import React, { useEffect } from 'react'
import { useToasts } from 'react-toast-notifications'
import { useSubscription } from '@apollo/client'
import { Wrap } from './styles'
import { Card } from '../../../Card'
import InlineLoader from '../../../InlineLoader'
import { useUser, useExperienceInfo, useProduct } from '../../../../Providers'
import { EXPERIENCE_PRODUCT } from '../../../../graphql'

export default function SelectKit({ experienceId }) {
   const {
      toggleProductModal,
      setProductModalType,
      state: userState
   } = useUser()
   const { state: experienceState, updateExperienceInfo } = useExperienceInfo()
   const {
      state: productState,
      addProducts,
      addSelectedProduct,
      addSelectedProductOption
   } = useProduct()
   const { selectedProductOption } = productState
   const { kit, isHostParticipant, kitPrice } = experienceState
   const { user: { defaultCustomerAddress = {} } = {} } = userState
   const { addToast } = useToasts()

   // subscription for products linked with experience
   const {
      loading: isProductsLoading,
      error: productsError,
      data: { products = [] } = {}
   } = useSubscription(EXPERIENCE_PRODUCT, {
      variables: {
         experienceId
      }
   })

   const addKitHandler = async e => {
      const { checked } = e.target
      if (checked) {
         await updateExperienceInfo({
            kit: kit + 1,
            isKitAdded: true
         })
      } else {
         await updateExperienceInfo({
            kit: 0,
            isKitAdded: false
         })
      }
   }

   const cardClickHandler = async product => {
      console.log('Product', product)
      switch (product?.type) {
         case 'simple':
            console.log('in simple')
            await addSelectedProduct(product)
            console.log('in simple1')
            if (product?.productOptions.length > 1) {
               console.log('in simple2 if')
               await setProductModalType('booking')
               await toggleProductModal(true)
            } else {
               console.log('in simple2 else')
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

   useEffect(() => {
      if (products.length) {
         addProducts(products)
      }
   }, [products])

   if (isProductsLoading) return <InlineLoader />
   if (productsError) {
      addToast('Opps!! Something went wrong!', { appearance: 'error' })
      console.log(productsError)
   }
   return (
      <Wrap>
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
                           selectedProductOption?.productId === product?.id
                        }
                     />
                  )
               })}
         </div>

         {/* {products.length === 1 &&
        selectedProductOption?.productId === products[0]?.id && (
          <Goodies title="Whats in the kit?" products={products} />
        )} */}
         {/* {isHostParticipant && (
        <label className="checkbox-wrap">
          <Input
            type="checkbox"
            customWidth="24px"
            customHeight="24px"
            checked={kit > 0}
            onClick={addKitHandler}
          />
          <Flex
            container
            alignItems="center"
            justifyContent="space-between"
            flex="1"
          >
            <span className="checkbox-label">Add kit</span>
            <span className="checkbox-label">${kitPrice?.toFixed(1)}</span>
          </Flex>
        </label>
      )} */}
      </Wrap>
   )
}
