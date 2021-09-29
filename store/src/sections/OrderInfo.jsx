import React from 'react'
import moment from 'moment'
import { useRouter } from 'next/router'
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
            <header className="hern-order-info__header">
               <h4 className="hern-order-info__header__title">
                  Your Box ({user?.subscription?.recipes?.count})
               </h4>
            </header>
            <ul className="hern-order-info__plan-products-list">
               {planProducts.map(product => (
                  <CartProduct
                     product={product}
                     isRemovable={false}
                     key={`product-${product.id}`}
                  />
               ))}
            </ul>
         </section>

         {addOnProducts.length > 0 && (
            <>
               <section>
                  <header className="hern-order-info__add-on__header">
                     <h4 className="hern-order-info__add-on__header__title">
                        Your Add Ons
                     </h4>
                  </header>

                  <ul className="hern-order-info__add-on-products-list">
                     {addOnProducts.map(product => (
                        <CartProduct
                           product={product}
                           isRemovable={false}
                           key={`product-${product.id}`}
                        />
                     ))}
                  </ul>
               </section>
            </>
         )}
         <section>
            <h4 className="hern-order-info__billings__title">Charges</h4>
            <Billing billing={cart?.billingDetails} />
         </section>
         <section className="hern-order-info__delivery">
            {cart?.fulfillmentInfo?.type.includes('DELIVERY') ? (
               <p className="hern-order-info__delivery__details">
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
                     className="hern-order-info__go-to-order__btn"
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
                  <button
                     className="hern-order-info__early-pay__btn"
                     onClick={() =>
                        router.push(getRoute(`/checkout/?id=${cart?.id}`))
                     }
                  >
                     EARLY PAY
                  </button>
               )}
            </>
         )}
      </div>
   )
}

export default OrderInfo
