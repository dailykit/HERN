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
import { CartContext, onDemandMenuContext } from '../../context'
import { PRODUCTS } from '../../graphql'
import classNames from 'classnames'
import * as Scroll from 'react-scroll'

import { useConfig } from '../../lib'
import { setThemeVariable, getRoute } from '../../utils'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import { VegNonVegType } from '../../assets/icons'
import CartBar from '../order/CartBar'

export const FeaturedCollection = ({ config }) => {
   const router = useRouter()
   const { addToast } = useToasts()
   // props

   console.log('config123', config)

   // context
   const { brand, locationId, storeStatus } = useConfig()

   // component state
   const [hydratedMenu, setHydratedMenu] = React.useState([])
   const [status, setStatus] = useState('loading')
   const { onDemandMenu } = React.useContext(onDemandMenuContext)
   const { cartState, addToCart } = React.useContext(CartContext)
   const { isMenuLoading, allProductIds, categories } = onDemandMenu

   // const date = React.useMemo(() => new Date(Date.now()).toISOString(), [])

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

   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: locationId,
         },
      }),
      [brand]
   )
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
         fetchPolicy: 'network-only',
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

   const productData = {
      id: 1080,
      name: "Adrish's Special",
      type: 'simple',
      assets: {
         images: [
            'https://dailykit-133-test.s3.amazonaws.com/images/07783-burger.jpg',
            'https://dailykit-133-test.s3.amazonaws.com/images/07783-burger.jpg',
            'https://dailykit-133-test.s3.amazonaws.com/images/07783-burger.jpg',
         ],
         videos: [],
      },
      tags: ['Hot', 'New', 'Trending', 'Trending', 'Final'],
      additionalText: 'comes with Ketchup',
      description: 'SLdhasldha',
      price: 5,
      discount: 50,
      isPopupAllowed: true,
      isPublished: true,
      defaultProductOptionId: null,
      productOptions: [
         {
            id: 1203,
            position: 1000000,
            type: 'readyToEat',
            label: 'Basic',
            price: 10,
            discount: 0,
            cartItem: {
               childs: {
                  data: [
                     {
                        childs: {
                           data: [],
                        },
                        unitPrice: 10,
                        productOptionId: 1203,
                     },
                  ],
               },
               productId: 1080,
               unitPrice: 2.5,
            },
            modifier: {
               id: 1003,
               name: 'modifier-sGh3i',
               categories: [
                  {
                     id: 1003,
                     name: 'category-IOSqx',
                     isRequired: true,
                     type: 'single',
                     limits: {
                        max: null,
                        min: 1,
                     },
                     options: [],
                     __typename: 'onDemand_modifierCategory',
                  },
               ],
               __typename: 'onDemand_modifier',
            },
            __typename: 'products_productOption',
         },
         {
            id: 1206,
            position: 500000,
            type: 'mealKit',
            label: 'Basic',
            price: 20,
            discount: 0,
            cartItem: {
               childs: {
                  data: [
                     {
                        childs: {
                           data: [
                              {
                                 simpleRecipeYieldId: 1025,
                              },
                              {
                                 simpleRecipeYieldId: 1025,
                              },
                              {
                                 simpleRecipeYieldId: 1025,
                              },
                              {
                                 simpleRecipeYieldId: 1025,
                              },
                              {
                                 simpleRecipeYieldId: 1025,
                              },
                              {
                                 simpleRecipeYieldId: 1025,
                              },
                           ],
                        },
                        unitPrice: 20,
                        productOptionId: 1206,
                     },
                  ],
               },
               productId: 1080,
               unitPrice: 2.5,
            },
            modifier: null,
            __typename: 'products_productOption',
         },
         {
            id: 1237,
            position: 0,
            type: null,
            label: 'Serves 4',
            price: 5,
            discount: 0,
            cartItem: {
               childs: {
                  data: [
                     {
                        childs: {
                           data: [],
                        },
                        unitPrice: 5,
                        productOptionId: 1237,
                     },
                  ],
               },
               productId: 1080,
               unitPrice: 2.5,
            },
            modifier: {
               id: 1002,
               name: 'Pizza options',
               categories: [
                  {
                     id: 1002,
                     name: 'choose your crust',
                     isRequired: true,
                     type: 'multiple',
                     limits: {
                        max: 2,
                        min: 1,
                     },
                     options: [
                        {
                           id: 1004,
                           name: 'Cheese burst',
                           price: 100,
                           discount: 0,
                           quantity: 1,
                           image: 'https://dailykit-133-test.s3.amazonaws.com/images/11479-1-1.jpg',
                           isActive: true,
                           sachetItemId: null,
                           ingredientSachetId: null,
                           cartItem: {
                              data: [
                                 {
                                    unitPrice: 100,
                                    modifierOptionId: 1004,
                                 },
                              ],
                           },
                           __typename: 'onDemand_modifierCategoryOption',
                        },
                        {
                           id: 1016,
                           name: 'Mushroom Soba Noodles - 2 servings',
                           price: 0,
                           discount: 0,
                           quantity: 1,
                           image: 'https://dailykit-133-test.s3.amazonaws.com/images/07783-burger.jpg',
                           isActive: false,
                           sachetItemId: null,
                           ingredientSachetId: null,
                           cartItem: {
                              data: [
                                 {
                                    unitPrice: 0,
                                    modifierOptionId: 1016,
                                 },
                              ],
                           },
                           __typename: 'onDemand_modifierCategoryOption',
                        },
                        {
                           id: 1021,
                           name: 'option-UzL0q',
                           price: 0,
                           discount: 0,
                           quantity: 1,
                           image: null,
                           isActive: true,
                           sachetItemId: null,
                           ingredientSachetId: null,
                           cartItem: {
                              data: [
                                 {
                                    unitPrice: 0,
                                    modifierOptionId: 1021,
                                 },
                              ],
                           },
                           __typename: 'onDemand_modifierCategoryOption',
                        },
                     ],
                     __typename: 'onDemand_modifierCategory',
                  },
                  {
                     id: 1022,
                     name: 'Another one',
                     isRequired: true,
                     type: 'single',
                     limits: {
                        max: 1,
                        min: 1,
                     },
                     options: [
                        {
                           id: 1017,
                           name: 'Beans',
                           price: 1,
                           discount: 50,
                           quantity: 1,
                           image: 'https://dailykit-133-test.s3.amazonaws.com/images/21814-mac-cheese.jpg',
                           isActive: true,
                           sachetItemId: null,
                           ingredientSachetId: null,
                           cartItem: {
                              data: [
                                 {
                                    unitPrice: 0.5,
                                    modifierOptionId: 1017,
                                 },
                              ],
                           },
                           __typename: 'onDemand_modifierCategoryOption',
                        },
                        {
                           id: 10171,
                           name: 'Beans Return',
                           price: 1,
                           discount: 50,
                           quantity: 1,
                           image: 'https://dailykit-133-test.s3.amazonaws.com/images/21814-mac-cheese.jpg',
                           isActive: true,
                           sachetItemId: null,
                           ingredientSachetId: null,
                           cartItem: {
                              data: [
                                 {
                                    unitPrice: 0.5,
                                    modifierOptionId: 1017,
                                 },
                              ],
                           },
                           __typename: 'onDemand_modifierCategoryOption',
                        },
                     ],
                     __typename: 'onDemand_modifierCategory',
                  },
               ],
               __typename: 'onDemand_modifier',
            },
            __typename: 'products_productOption',
         },
      ],
      __typename: 'products_product',
   }
   const CustomArea = props => {
      const { data } = props
      return (
         <div className="hern-on-demand-product-custom-area">
            <Button
               className="hern-custom-area-add-btn"
               type="outline"
               onClick={() => {
                  if (data.productOptions.length > 0) {
                     setProductModifier(data)
                  } else {
                     addToast('Added to the Cart!', {
                        appearance: 'success',
                     })
                     addToCart({ productId: data.id }, 1)
                  }
               }}
               disabled={
                  locationId ? (storeStatus.status ? false : true) : true
               }
            >
               {locationId
                  ? storeStatus.status
                     ? 'ADD'
                     : 'COMING SOON'
                  : 'COMING SOON'}
            </Button>
            {data.productOptions.length > 0 && <span>Customizable</span>}
         </div>
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
                                             showImage={
                                                (config?.informationVisibility
                                                   ?.product?.showImage
                                                   ?.value &&
                                                   eachProduct.assets.images
                                                      .length > 0) ??
                                                true
                                             }
                                             canSwipe={
                                                config?.informationVisibility
                                                   ?.product?.canSwipe?.value ??
                                                true
                                             }
                                             showSliderArrows={
                                                config?.informationVisibility
                                                   ?.product?.showSliderArrows
                                                   ?.value ?? true
                                             }
                                             showSliderIndicators={
                                                config?.informationVisibility
                                                   ?.product
                                                   ?.showSliderIndicators
                                                   ?.value ?? true
                                             }
                                             showImageIcon={
                                                config?.informationVisibility
                                                   ?.product?.showImageIcon
                                                   ?.value
                                                   ? true
                                                   : undefined
                                             }
                                             showProductPrice={
                                                config?.informationVisibility
                                                   ?.product?.showProductPrice
                                                   ?.value ?? true
                                             }
                                             showProductName={
                                                config?.informationVisibility
                                                   ?.product?.showProductName
                                                   ?.value ?? true
                                             }
                                             showProductAdditionalText={
                                                config?.informationVisibility
                                                   ?.product
                                                   ?.customAreaComponent
                                                   ?.value ?? true
                                             }
                                             customAreaComponent={
                                                config?.informationVisibility
                                                   ?.product
                                                   ?.showProductAdditionalText
                                                   ?.value
                                                   ? CustomArea
                                                   : undefined
                                             }
                                             showModifier={
                                                productModifier &&
                                                productModifier.id ===
                                                eachProduct.id
                                             }
                                             closeModifier={closeModifier}
                                             modifierPopupConfig={{
                                                showModifierImage:
                                                   config?.informationVisibility
                                                      ?.modifier
                                                      ?.showModifierImage
                                                      ?.value ?? true,
                                             }}
                                             customAreaFlex={false}
                                             modifierWithoutPopup={false}
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
            {(config?.informationVisibility?.menuCategories?.menu?.value && menuType !== 'fixed-top-nav') && (
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
               cartState.cart &&
               cartState.cart?.products?.aggregate?.count !== 0 && (
                  <BottomCartBar />
               )}
            {showCartOnRight && <CartBar />}
         </div>
      </>
   )
}
