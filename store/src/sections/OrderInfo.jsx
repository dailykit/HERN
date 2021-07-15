import React from 'react'
import moment from 'moment'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'

import { useUser } from '../context'
import { getRoute, normalizeAddress } from '../utils'
import { Billing, CartProduct, Button } from '../components'

const OrderInfo = ({ cart, showViewOrderButton = false }) => {
   const router = useRouter()
   const { user } = useUser()
   const { addToast } = useToasts()

   React.useEffect(() => {
      if (showViewOrderButton && cart.paymentStatus !== 'SUCCEEDED') {
         addToast(
            'There was an issue with your payment, please click early pay button to proceed.',
            { appearance: 'error' }
         )
      }
   }, [cart?.paymentStatus])

   const planProducts = cart?.products?.filter(node => !node.isAddOn) || []
   const addOnProducts = cart?.products?.filter(node => node.isAddOn) || []
   return (
      <div>
         <section>
            <header tw="mt-3 mb-2 pb-1 border-b flex items-center justify-between">
               <h4 tw="text-lg text-gray-700">
                  Your Box ({user?.subscription?.recipes?.count})
               </h4>
            </header>
            <ProductCards>
               {planProducts.map(product => (
                  <CartProduct
                     product={product}
                     isRemovable={false}
                     key={`product-${product.id}`}
                  />
               ))}
            </ProductCards>
         </section>
         {addOnProducts.length > 0 && (
            <>
               <section>
                  <header tw="mt-3 mb-2 pb-1 border-b flex items-center justify-between">
                     <h4 tw="text-lg text-gray-700">Your Add Ons</h4>
                  </header>

                  <ProductCards>
                     {addOnProducts.map(product => (
                        <CartProduct
                           product={product}
                           isRemovable={false}
                           key={`product-${product.id}`}
                        />
                     ))}
                  </ProductCards>
               </section>
            </>
         )}
         <section>
            <h4 tw="text-lg text-gray-700 my-3 pb-1 border-b">Charges</h4>
            <Billing billing={cart?.billingDetails} />
         </section>
         <section tw="mt-2 mb-3">
            {cart?.fulfillmentInfo?.type.includes('DELIVERY') ? (
               <p tw="text-gray-500">
                  Your box will be delivered on{' '}
                  <span>
                     {moment(cart?.fulfillmentInfo?.slot?.from).format('MMM D')}
                     &nbsp;between{' '}
                     {moment(cart?.fulfillmentInfo?.slot?.from).format(
                        'hh:mm A'
                     )}
                     &nbsp;-&nbsp;
                     {moment(cart?.fulfillmentInfo?.slot?.to).format('hh:mm A')}
                  </span>{' '}
                  at <span>{normalizeAddress(cart?.address)}</span>
               </p>
            ) : (
               <p tw="text-gray-500">
                  Pickup your box in between{' '}
                  {moment(cart?.fulfillmentInfo?.slot?.from).format('MMM D')},{' '}
                  {moment(cart?.fulfillmentInfo?.slot?.from).format('hh:mm A')}{' '}
                  - {moment(cart?.fulfillmentInfo?.slot?.to).format('hh:mm A')}{' '}
                  from {normalizeAddress(cart?.fulfillmentInfo?.address)}
               </p>
            )}
         </section>
         {showViewOrderButton && (
            <>
               {cart?.paymentStatus === 'SUCCEEDED' ? (
                  <Button
                     disabled={false}
                     tw="w-full bg-green-500"
                     onClick={() =>
                        router.push(
                           getRoute(
                              `/account/orders?id=${cart?.subscriptionOccurenceId}`
                           )
                        )
                     }
                  >
                     Go to Order
                  </Button>
               ) : (
                  <SaveGhostButton
                     onClick={() =>
                        router.push(getRoute(`/checkout/?id=${cart?.id}`))
                     }
                  >
                     EARLY PAY
                  </SaveGhostButton>
               )}
            </>
         )}
      </div>
   )
}

export default OrderInfo

const ProductCards = styled.ul`
   display: grid;
   grid-gap: 16px;
   grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
   @media screen and (max-width: 567px) {
      grid-template-columns: 1fr;
   }
`

export const SaveGhostButton = styled.button(
   ({ disabled }) => css`
      ${tw`
      h-10
      w-full
      rounded
      text-center
      text-green-600
      hover:bg-gray-100
   `}
      ${disabled &&
      tw`
         h-10
         w-full
         rounded
         text-center
         text-gray-600
         cursor-not-allowed 
      `}
   `
)
