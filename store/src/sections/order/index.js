import React, { useState } from 'react'
import {
   OnDemandMenu,
   ProductCard,
   BottomCartBar,
   Divider,
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
                        <>
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
                        </>
                     )
                  })}
               </div>
               <OnDemandMenu />
               <BottomCartBar />
            </div>
         </div>
      </>
   )
}
