import { useQuery } from '@apollo/react-hooks'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import {
   Button,
   ProductCard,
   Loader,
   OnDemandMenu,
   Divider,
   BottomCartBar,
} from '../../components'
import { CartContext } from '../../context'
import { PRODUCTS_BY_CATEGORY, PRODUCTS } from '../../graphql'
import { useConfig } from '../../lib'
export const FeaturedCollection = props => {
   // props
   const { config } = props
   console.log('config', config)

   // context
   const { brand, isConfigLoading } = useConfig()
   const { cartState, addToCart } = React.useContext(CartContext)

   // component state
   const [productIdForModifier, setProductIdForModifier] = useState(null)
   const [menuData, setMenuData] = useState({
      categories: [],
      allProductIds: [],
      isMenuLoading: true,
   })
   const [status, setStatus] = useState('loading')
   const [hydratedMenu, setHydratedMenu] = React.useState([])

   const date = React.useMemo(() => new Date(Date.now()).toISOString(), [])

   // query for get products by category (contain array of product ids)
   const { error: menuError } = useQuery(PRODUCTS_BY_CATEGORY, {
      skip: isConfigLoading || !brand?.id,
      variables: {
         params: {
            brandId: brand?.id,
            date,
         },
      },
      onCompleted: data => {
         if (data?.onDemand_getMenuV2?.length) {
            const [res] = data.onDemand_getMenuV2
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

   // get all products from productIds getting from PRODUCT_BY_CATEGORY
   const { loading: productsLoading, error: productsError } = useQuery(
      PRODUCTS,
      {
         skip: menuData.isMenuLoading,
         variables: {
            ids: menuData.allProductIds,
         },
         fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data && data.products.length) {
               const updatedMenu = menuData.categories.map(category => {
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
               onClick={() => {
                  if (
                     data.productOptions.length > 0 &&
                     (config?.informationVisibility?.modifier?.showModifier
                        ?.value ??
                        true)
                  ) {
                     setProductIdForModifier(data.id)
                  } else {
                     // console.log('defaultCartItem', data.defaultCartItem)
                     addToCart(data.defaultCartItem, 1)
                  }
               }}
            >
               ADD
            </Button>
            {data.productOptions.length > 0 &&
               (config?.informationVisibility?.modifier?.showModifier?.value ??
                  true) && <span>Customizable</span>}
         </div>
      )
   }
   const closeModifier = () => {
      setProductIdForModifier(null)
   }

   if (status === 'error' || productsError || menuError) {
      return <p>Something went wrong</p>
   }
   if (status == 'loading' || productsLoading) {
      return <Loader />
   }
   return (
      <>
         <div className="hern-on-demand-order-container">
            <div
               className={classNames('hern-on-demand-page', {
                  'hern-on-demand-page-pop-up--active': productIdForModifier,
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
                        <div key={index}>
                           {config?.informationVisibility?.collection
                              ?.productCategory?.value && (
                              <p
                                 className="hern-product-category-heading"
                                 id={`hern-product-category-${eachCategory.name}`}
                              >
                                 {eachCategory.name}
                              </p>
                           )}
                           {eachCategory.products.map((eachProduct, index) => {
                              return (
                                 <ProductCard
                                    key={index}
                                    data={eachProduct}
                                    showImage={
                                       config?.informationVisibility?.product
                                          ?.showImage?.value ?? true
                                    }
                                    canSwipe={
                                       config?.informationVisibility?.product
                                          ?.canSwipe?.value ?? true
                                    }
                                    showSliderArrows={
                                       config?.informationVisibility?.product
                                          ?.showSliderArrows?.value ?? true
                                    }
                                    showSliderIndicators={
                                       config?.informationVisibility?.product
                                          ?.showSliderIndicators?.value ?? true
                                    }
                                    showImageIcon={
                                       config?.informationVisibility?.product
                                          ?.showImageIcon?.value
                                          ? true
                                          : undefined
                                    }
                                    showProductPrice={
                                       config?.informationVisibility?.product
                                          ?.showProductPrice?.value ?? true
                                    }
                                    showProductName={
                                       config?.informationVisibility?.product
                                          ?.showProductName?.value ?? true
                                    }
                                    showProductAdditionalText={
                                       config?.informationVisibility?.product
                                          ?.customAreaComponent?.value ?? true
                                    }
                                    customAreaComponent={
                                       config?.informationVisibility?.product
                                          ?.showProductAdditionalText?.value
                                          ? CustomArea
                                          : undefined
                                    }
                                    showModifier={
                                       productIdForModifier &&
                                       productIdForModifier === eachProduct.id
                                    }
                                    closeModifier={closeModifier}
                                    modifierPopupConfig={{
                                       showModifierImage:
                                          config?.informationVisibility
                                             ?.modifier?.showModifierImage
                                             ?.value ?? true,
                                    }}
                                 />
                              )
                           })}
                           <Divider />
                        </div>
                     )
                  })}
               </div>
               {config?.informationVisibility?.menuCategories?.menu?.value && (
                  <OnDemandMenu
                     categories={menuData.categories}
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
            </div>
         </div>
      </>
   )
}
