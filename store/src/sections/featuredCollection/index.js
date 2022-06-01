import React, { useState } from 'react'
import {
   OnDemandMenu,
   ProductCard,
   BottomCartBar,
   Divider,
   Button,
   Loader,
   Empty,
} from '../../components'
import { useQuery, useSubscription } from '@apollo/react-hooks'
import _ from 'lodash'
import { CartContext } from '../../context'
import { PRODUCTS, PRODUCTS_BY_CATEGORY } from '../../graphql'
import classNames from 'classnames'
import * as Scroll from 'react-scroll'

import { useConfig } from '../../lib'
import {
   setThemeVariable,
   getRoute,
   useIntersectionObserver,
} from '../../utils'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import { VegNonVegType } from '../../assets/icons'
import CartBar from '../order/CartBar'
import { CustomArea } from './productCustomArea'

export const FeaturedCollection = ({ config }) => {
   const { addToast } = useToasts()

   // context
   const { brand, isConfigLoading, locationId, storeStatus, brandLocation } =
      useConfig()

   // component state
   const [hydratedMenu, setHydratedMenu] = React.useState([])
   const [status, setStatus] = useState('loading')
   const { cartState, addToCart } = React.useContext(CartContext)
   const [menuData, setMenuData] = useState({
      categories: [],
      allProductIds: [],
      isMenuLoading: true,
   })

   const date = React.useMemo(() => new Date(Date.now()).toISOString(), [])
   const collectionIdArray = React.useMemo(
      () =>
         config?.data?.collectionData?.value?.map(
            collection => collection.id
         ) || [],
      [config]
   )
   const menuType = config?.display?.dropdown?.value[0]?.value
      ? config?.display?.dropdown?.value[0]?.value
      : 'side-nav'
   const numberOfProducts =
      config?.display?.['numberOfProducts']?.value ??
      config?.display?.['numberOfProducts']?.default ??
      2
   const showCategoryLengthOnCategoryTitle =
      config?.display?.['showCategoryLengthOnCategoryTitle']?.value ??
      config?.display?.['showCategoryLengthOnCategoryTitle']?.default ??
      true
   const showCategoryLengthOnCategory =
      config?.display?.['showCategoryLengthOnCategory']?.value ??
      config?.display?.['showCategoryLengthOnCategory']?.default ??
      true
   const showCartOnRight =
      config?.display?.['showCartOnRight']?.value ??
      config?.display?.['showCartOnRight']?.default ??
      false
   const productsScrollWidth =
      config?.display?.productsScrollWidth?.value ??
      config?.display?.productsScrollWidth?.default ??
      0

   setThemeVariable('--hern-number-of-products', numberOfProducts)
   setThemeVariable(
      '--hern-order-product-section-scroll-width',
      productsScrollWidth + 'px'
   )

   // query for get products by category (contain array of product ids)
   const { error: menuError } = useQuery(PRODUCTS_BY_CATEGORY, {
      skip: isConfigLoading || !brand?.id,
      variables: {
         params: {
            brandId: brand?.id,
            date,
            ...(collectionIdArray.length > 0 && { collectionIdArray }),
            locationId,
         },
      },
      onCompleted: data => {
         if (data?.onDemand_getMenuV2copy?.length) {
            const [res] = data.onDemand_getMenuV2copy
            const { menu } = res.data
            const ids = menu.map(category => category.products).flat()
            setMenuData(prev => ({
               ...prev,
               allProductIds: ids,
               categories: menu,
               isMenuLoading: false,
            }))
         }
      },
      onError: error => {
         setMenuData(prev => ({
            ...prev,
            isMenuLoading: false,
         }))
         setStatus('error')
         console.log(error)
      },
   })
   const { isMenuLoading, allProductIds, categories } = menuData

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )
   const { loading: productsLoading, error: productsError } = useSubscription(
      PRODUCTS,
      {
         skip: isMenuLoading,
         variables: {
            ids: allProductIds,
            params: argsForByLocation,
         },
         // fetchPolicy: 'network-only',
         onSubscriptionData: ({ subscriptionData }) => {
            const { data } = subscriptionData
            if (data && data.products.length) {
               const updatedMenu = categories.map(category => {
                  const updatedProducts = category.products
                     .map(productId => {
                        const found = data.products.find(
                           ({ id }) => id === productId
                        )
                        if (found) {
                           return found
                        }
                        return null
                     })
                     .filter(Boolean)
                  return {
                     ...category,
                     products: updatedProducts,
                  }
               })
               setHydratedMenu(updatedMenu)
            }
            setStatus('success')
         },
      }
   )

   React.useEffect(() => {
      if (productsError) {
         setStatus('error')
      }
   }, [productsError])

   const [productModifier, setProductModifier] = useState(null)

   const CustomAreaWrapper = ({ data }) => {
      return <CustomArea data={data} setProductModifier={setProductModifier} />
   }
   const closeModifier = () => {
      setProductModifier(null)
   }

   if (productsError) {
      console.log(productsError)
      return <p>Error</p>
   }

   if (_.isEmpty(hydratedMenu))
      return (
         <Empty
            title="No product found !"
            description="We are updating our menu with more new items, please check back later."
            route="/"
            buttonLabel="Back to home"
         />
      )

   if (isMenuLoading || status === 'loading' || productsLoading) {
      return <Loader type="order-loading" />
   }
   const getWrapperClasses = () => {
      if (menuType === 'fixed-top-nav') {
         if (!showCartOnRight) {
            return 'hern-on-demand-order-container--fixed-top-nav--full-width'
         }
         return 'hern-on-demand-order-container--fixed-top-nav'
      }
      return ''
   }
   return (
      <>
         {menuType === 'fixed-top-nav' && (
            <OnDemandMenu
               menuType="navigationAnchorMenu"
               categories={categories}
               showCount={showCategoryLengthOnCategory}
            />
         )}
         <div
            className={classNames(
               'hern-on-demand-order-container',
               getWrapperClasses()
            )}
         >
            <div
               id="hern-on-demand-order-container"
               className={classNames('hern-on-demand-page', {
                  'hern-on-demand-page-pop-up--active': productModifier,
               })}
            >
               <div
                  className={classNames('hern-on-demand-page-content', {
                     'hern-on-demand-page-content--navigationAnchor--active':
                        config?.informationVisibility?.menuCategories?.menu
                           ?.value &&
                        config?.informationVisibility?.menuCategories?.menuType
                           ?.value?.value === 'navigationAnchorMenu',
                  })}
               >
                  {hydratedMenu.map((eachCategory, index) => {
                     return (
                        <Scroll.Element key={index} name={eachCategory.name}>
                           {config?.informationVisibility?.collection
                              ?.productCategory?.value && (
                              <p
                                 className="hern-product-category-heading"
                                 id={`hern-product-category-${eachCategory.name}`}
                              >
                                 {eachCategory.name}
                                 {showCategoryLengthOnCategoryTitle && (
                                    <>({eachCategory.products.length})</>
                                 )}
                              </p>
                           )}
                           <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                              {eachCategory.products.map(
                                 (eachProduct, index) => (
                                    <ProductWithIntersection
                                       key={eachProduct.id}
                                       eachProduct={eachProduct}
                                       numberOfProducts={numberOfProducts}
                                       productModifier={productModifier}
                                       closeModifier={closeModifier}
                                       CustomAreaWrapper={CustomAreaWrapper}
                                       config={config}
                                    />
                                 )
                              )}
                           </div>
                           <Divider />
                        </Scroll.Element>
                     )
                  })}
               </div>
            </div>
            {config?.informationVisibility?.menuCategories?.menu?.value &&
               menuType !== 'fixed-top-nav' && (
                  <OnDemandMenu
                     categories={categories}
                     menuType={
                        config?.informationVisibility?.menuCategories?.menuType
                           ?.value?.value
                     }
                  />
               )}
            {(config?.informationVisibility?.cart?.bottomCartBar?.value ??
               true) &&
               cartState.cart && <BottomCartBar />}
            {showCartOnRight && <CartBar />}
         </div>
      </>
   )
}

const ProductWithIntersection = ({
   eachProduct,
   numberOfProducts,
   productModifier,
   closeModifier,
   CustomAreaWrapper,
   config,
}) => {
   const router = useRouter()

   const productRef = React.useRef()

   const { entry, isIntersected } = useIntersectionObserver(productRef, {
      rootMargin: '100px 0px 100px 0px ',
   })
   const isVisible = React.useMemo(
      () => isIntersected || !!entry?.isIntersecting,
      [entry, isIntersected]
   )
   const VegNonVegIcon = () => (
      <VegNonVegType vegNonVegType={eachProduct?.VegNonVegType} />
   )
   return (
      <div
         className={classNames('hern-on-demand-order--product-card', {
            'hern-on-demand-order--product-card-with-bg': !isVisible,
         })}
         style={{
            margin: '0 auto',
            maxWidth: numberOfProducts === 4 ? '280px' : 'auto',
         }}
         ref={productRef}
      >
         <ProductWrapper isVisible={isVisible}>
            <ProductCard
               iconOnImage={VegNonVegIcon}
               onProductNameClick={() =>
                  router.push(getRoute('/products/' + eachProduct.id))
               }
               onImageClick={() =>
                  router.push(getRoute('/products/' + eachProduct.id))
               }
               data={eachProduct}
               showImage={
                  (config?.informationVisibility?.product?.showImage?.value &&
                     eachProduct.assets.images.length > 0) ??
                  true
               }
               canSwipe={
                  config?.informationVisibility?.product?.canSwipe?.value ??
                  true
               }
               showSliderArrows={
                  config?.informationVisibility?.product?.showSliderArrows
                     ?.value ?? true
               }
               showSliderIndicators={
                  config?.informationVisibility?.product?.showSliderIndicators
                     ?.value ?? true
               }
               showImageIcon={
                  config?.informationVisibility?.product?.showImageIcon?.value
                     ? true
                     : undefined
               }
               showProductPrice={
                  config?.informationVisibility?.product?.showProductPrice
                     ?.value ?? true
               }
               showProductName={
                  config?.informationVisibility?.product?.showProductName
                     ?.value ?? true
               }
               showProductAdditionalText={
                  config?.informationVisibility?.product?.customAreaComponent
                     ?.value ?? true
               }
               customAreaComponent={
                  config?.informationVisibility?.product
                     ?.showProductAdditionalText?.value
                     ? CustomAreaWrapper
                     : undefined
               }
               showModifier={
                  productModifier && productModifier.id === eachProduct.id
               }
               closeModifier={closeModifier}
               modifierPopupConfig={{
                  showModifierImage:
                     config?.informationVisibility?.modifier?.showModifierImage
                        ?.value ?? true,
                  counterButtonPosition: 'BOTTOM',
               }}
               customAreaFlex={false}
               modifierWithoutPopup={false}
               config={config}
            />
         </ProductWrapper>
      </div>
   )
}
function productPropsAreEqual(prevProps, nextProps) {
   return (
      prevProps.isVisible === nextProps.isVisible &&
      prevProps.children === nextProps.children
   )
}
const ProductWrapper = React.memo(({ children, isVisible }) => {
   if (isVisible) {
      return <>{children}</>
   }
   return <></>
}, productPropsAreEqual)
