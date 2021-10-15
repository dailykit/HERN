import React from 'react'
import { useToasts } from 'react-toast-notifications'
import { useSubscription } from '@apollo/client'
import { Wrap } from './styles'
import { Card, Goodies, InlineLoader } from '../../../components'
import { useUser, useRsvp } from '../../../Providers'
import { EXPERIENCE_PRODUCT } from '../../../graphql'

export default function AddKit({ decodedToken }) {
   const { toggleProductModal, setProductModalType } = useUser()
   const {
      state: rpsvState,
      addSelectedProduct,
      addSelectedProductOption
   } = useRsvp()
   const { experienceBooking, selectedProductOption } = rpsvState
   const { addToast } = useToasts()

   // subscription for products linked with experience
   const {
      loading: isProductsLoading,
      error: productsError,
      data: { products = [] } = {}
   } = useSubscription(EXPERIENCE_PRODUCT, {
      skip: !experienceBooking,
      variables: {
         experienceId: experienceBooking?.experienceClass?.experienceId
      }
   })

   const cardClickHandler = async product => {
      switch (product?.type) {
         case 'simple':
            await addSelectedProduct(product)

            if (product?.productOptions.length > 1) {
               await setProductModalType('booking')
               await toggleProductModal(true)
            } else {
               await addSelectedProductOption(product.productOptions[0])
            }
            break
         case 'customizable':
            await addSelectedProduct(product)
            if (product?.customizableProductComponents.length > 1) {
               await setProductModalType('booking')
               await toggleProductModal(true)
            } else {
               await addSelectedProductOption(
                  product.customizableProductComponents[0]
               )
            }
            break
         case 'combo':
            await addSelectedProduct(product)
            if (product?.comboProductComponents.length > 1) {
               await setProductModalType('booking')
               await toggleProductModal(true)
            } else {
               await addSelectedProductOption(product.comboProductComponents[0])
            }
            break
         default:
            await addSelectedProduct(product)
            break
      }
   }

   if (isProductsLoading) return <InlineLoader />
   if (productsError) {
      addToast('Opps!! Something went wrong!', { appearance: 'error' })
      console.log(productsError)
   }
   return (
      <Wrap>
         {decodedToken?.parentShare === 100 ? (
            <div className="kit-includes-div">
               <Goodies
                  products={products}
                  title="Whats included in my Kit?"
                  secondTitle="Ingredients"
                  textClass="League-Gothic text3 text_center"
               />
            </div>
         ) : (
            <>
               <h1 className="kit_heading">Select your kit</h1>
               <div className="product_wrapper">
                  {products.length > 0 &&
                     products.map(product => {
                        return (
                           <Card
                              key={product?.id}
                              type="product"
                              data={product}
                              onClick={() => cardClickHandler(product)}
                              isAdded={
                                 selectedProductOption?.productId ===
                                 product?.id
                              }
                           />
                        )
                     })}
               </div>
            </>
         )}
      </Wrap>
   )
}
