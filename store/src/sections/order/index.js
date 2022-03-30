import React, { useState } from 'react'
import {
   OnDemandMenu,
   ProductCard,
   BottomCartBar,
   Divider,
   Button,
   Loader,
} from '../../components'
import { useQuery } from '@apollo/react-hooks'
import _ from 'lodash'
import { CartContext, onDemandMenuContext, useTranslation } from '../../context'
import { PRODUCTS } from '../../graphql'
import classNames from 'classnames'
import * as Scroll from 'react-scroll'
import CartBar from './CartBar'
import { useConfig } from '../../lib'
import { setThemeVariable, getRoute } from '../../utils'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import { VegNonVegType } from '../../assets/icons'
import { CustomArea } from '../featuredCollection/productCustomArea'

export const OnDemandOrder = ({ config }) => {
   const router = useRouter()
   const { addToast } = useToasts()
   const { dynamicTrans, locale } = useTranslation()
   const { brand, locationId, storeStatus } = useConfig()

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
   const showCategoryBackgroundImage =
      config?.display?.showCategoryBackgroundImage?.value ??
      config?.display?.showCategoryBackgroundImage?.default ??
      false
   // const showCategoryBackgroundImage = false
   const categoryBackgroundImage =
      config?.display?.categoryBackgroundImage?.value ??
      config?.display?.categoryBackgroundImage?.default ??
      null
   const showAddToCartButtonFullWidth =
      config?.display?.showAddToCartButtonFullWidth?.value ??
      config?.display?.showAddToCartButtonFullWidth?.default ??
      true
   const navbarCategoryAlignment =
      config?.display?.navbarCategoryAlignment?.value?.value ?? 'CENTER'

   setThemeVariable('--hern-number-of-products', numberOfProducts)
   setThemeVariable(
      '--hern-order-product-section-scroll-width',
      productsScrollWidth + 'px'
   )

   const [hydratedMenu, setHydratedMenu] = React.useState([])
   const [status, setStatus] = useState('loading')
   const { onDemandMenu } = React.useContext(onDemandMenuContext)
   const { cartState, addToCart } = React.useContext(CartContext)
   const { isMenuLoading, allProductIds, categories } = onDemandMenu

   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: locationId,
         },
      }),
      [brand, locationId]
   )
   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   const { loading: productsLoading, error: productsError } = useQuery(
      PRODUCTS,
      {
         skip: isMenuLoading,
         variables: {
            ids: allProductIds,
            priceArgs: argsForByLocation,
            discountArgs: argsForByLocation,
            defaultCartItemArgs: argsForByLocation,
            productOptionPriceArgs: argsForByLocation,
            productOptionDiscountArgs: argsForByLocation,
            productOptionCartItemArgs: argsForByLocation,
            modifierCategoryOptionPriceArgs: argsForByLocation,
            modifierCategoryOptionDiscountArgs: argsForByLocation,
            modifierCategoryOptionCartItemArgs: argsForByLocation,
         },
         // fetchPolicy: 'network-only',
         onCompleted: data => {
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
               setStatus('success')
               setHydratedMenu(updatedMenu)
            }
         },
         onError: error => {
            setStatus('error')
            console.log('Error: ', error)
         },
      }
   )
   const [productModifier, setProductModifier] = useState(null)
   const CustomAreaWrapper = ({ data }) => {
      return (
         <CustomArea
            data={data}
            setProductModifier={setProductModifier}
            showAddToCartButtonFullWidth={showAddToCartButtonFullWidth}
         />
      )
   }
   const closeModifier = () => {
      setProductModifier(null)
   }

   if (productsError) {
      console.log(productsError)
      return <p>Error</p>
   }
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
               navbarAlignment={navbarCategoryAlignment}
            />
         )}
         <div
            className={classNames(
               'hern-on-demand-order-container',
               getWrapperClasses()
            )}
         >
            <div
               className={classNames('hern-on-demand-page', {
                  'hern-on-demand-page-pop-up--active': productModifier,
               })}
            >
               <div
                  className={classNames('hern-on-demand-page-content', {
                     'hern-on-demand-page-content--navigationAnchor--active': false,
                  })}
               >
                  {hydratedMenu.map((eachCategory, index) => {
                     return (
                        <Scroll.Element key={index} name={eachCategory.name}>
                           <div
                              className={classNames(
                                 'hern-store__order-category-name-wrapper',
                                 {
                                    'hern-store__order-category-name-wrapper-with-bg':
                                       showCategoryBackgroundImage,
                                 }
                              )}
                           >
                              {showCategoryBackgroundImage && (
                                 <div
                                    className="hern-store__order-category-name-wrapper-bg-image"
                                    style={{
                                       backgroundImage: `url(${categoryBackgroundImage})`,
                                    }}
                                 ></div>
                              )}
                              <p
                                 className={classNames(
                                    'hern-product-category-heading',
                                    {
                                       'hern-product-category-heading-with-bg':
                                          showCategoryBackgroundImage,
                                    }
                                 )}
                                 id={`hern-product-category-${eachCategory.name}`}
                              >
                                 {eachCategory.name}
                                 {showCategoryLengthOnCategoryTitle && (
                                    <>({eachCategory.products.length})</>
                                 )}
                              </p>
                           </div>
                           <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                              {eachCategory.products.map(
                                 (eachProduct, index) => {
                                    const VegNonVegIcon = () => (
                                       <VegNonVegType
                                          vegNonVegType={
                                             eachProduct?.VegNonVegType
                                          }
                                       />
                                    )
                                    return (
                                       <div
                                          key={index}
                                          className="hern-on-demand-order--product-card"
                                          style={{
                                             margin: '0 auto',
                                             maxWidth:
                                                numberOfProducts === 4
                                                   ? '280px'
                                                   : 'auto',
                                          }}
                                       >
                                          <ProductCard
                                             iconOnImage={VegNonVegIcon}
                                             onProductNameClick={() =>
                                                router.push(
                                                   getRoute(
                                                      '/products/' +
                                                         eachProduct.id
                                                   )
                                                )
                                             }
                                             onImageClick={() =>
                                                router.push(
                                                   getRoute(
                                                      '/products/' +
                                                         eachProduct.id
                                                   )
                                                )
                                             }
                                             key={index}
                                             data={eachProduct}
                                             showProductDescription={true}
                                             showImage={
                                                eachProduct.assets.images
                                                   .length > 0
                                                   ? true
                                                   : false
                                             }
                                             customAreaComponent={
                                                CustomAreaWrapper
                                             }
                                             showModifier={
                                                productModifier &&
                                                productModifier.id ===
                                                   eachProduct.id
                                             }
                                             closeModifier={closeModifier}
                                             customAreaFlex={false}
                                             modifierWithoutPopup={false}
                                             modifierPopupConfig={{
                                                counterButtonPosition: 'BOTTOM',
                                             }}
                                             stepView={false}
                                          />
                                       </div>
                                    )
                                 }
                              )}
                           </div>
                           <Divider />
                        </Scroll.Element>
                     )
                  })}
               </div>
            </div>
            {menuType !== 'fixed-top-nav' && (
               <OnDemandMenu categories={categories} />
            )}
            {cartState.cart && <BottomCartBar />}
            {showCartOnRight && <CartBar />}
         </div>
      </>
   )
}
