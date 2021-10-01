import React, { useState } from 'react'
import {
   OnDemandMenu,
   ProductCard,
   BottomCartBar,
   Divider,
   ModifierPopup,
} from '../../components'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import _ from 'lodash'
import { onDemandMenuContext } from '../../context'

//query
const PRODUCTS = gql`
   query Products($ids: [Int!]!) {
      products(where: { isArchived: { _eq: false }, id: { _in: $ids } }) {
         id
         name
         type
         assets
         tags
         additionalText
         description
         price
         discount
         isPopupAllowed
         isPublished
         defaultProductOptionId
         productOptions(
            where: { isArchived: { _eq: false } }
            order_by: { position: desc_nulls_last }
         ) {
            id
            position
            type
            label
            price
            discount
            cartItem
            modifier {
               id
               name
               categories(where: { isVisible: { _eq: true } }) {
                  id
                  name
                  isRequired
                  type
                  limits
                  options(where: { isVisible: { _eq: true } }) {
                     id
                     name
                     price
                     discount
                     quantity
                     image
                     isActive

                     sachetItemId
                     ingredientSachetId
                     cartItem
                  }
               }
            }
         }
      }
   }
`
const datas = {
   id: 1080,
   name: "Adrish's Special",
   type: 'simple',
   assets: {
      images: [
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
export const OnDemandOrder = () => {
   const [hydratedMenu, setHydratedMenu] = React.useState([])
   const [status, setStatus] = useState('loading')
   const { onDemandMenu } = React.useContext(onDemandMenuContext)
   const { isMenuLoading, allProductIds, categories } = onDemandMenu
   const { loading: productsLoading, error: productsError } = useQuery(
      PRODUCTS,
      {
         skip: isMenuLoading,
         variables: {
            ids: allProductIds,
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
   console.log('hydratedMenu', hydratedMenu)
   if (productsError) {
      return <p>Error</p>
   }
   if (isMenuLoading || status === 'loading' || productsLoading) {
      return <p>loading</p>
   }
   return (
      <>
         <div className="hern-on-demand-order-container">
            <div className="hern-on-demand-page">
               <div className="hern-on-demand-page-content">
                  {hydratedMenu.map((eachCategory, index) => {
                     return (
                        <div key={index}>
                           <p
                              className="hern-product-category-heading"
                              id={`hern-product-category-${eachCategory.name}`}
                           >
                              {eachCategory.name}
                           </p>
                           {eachCategory.products.map(eachProduct => {
                              return (
                                 <ProductCard
                                    key={eachProduct.id}
                                    data={eachProduct}
                                    showImage={
                                       eachProduct.assets.images.length > 0
                                          ? true
                                          : false
                                    }
                                 />
                              )
                           })}
                           <Divider />
                        </div>
                     )
                  })}
               </div>
               <OnDemandMenu />
               {false && <BottomCartBar />}
               {false && <ModifierPopup productData={datas} />}
            </div>
         </div>
      </>
   )
}
