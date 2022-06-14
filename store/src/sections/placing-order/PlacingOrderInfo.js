import React from 'react'
import moment from 'moment'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'

import { useTranslation, useUser } from '../../context'
import { getRoute, normalizeAddress } from '../../utils'
import { Billing, CartProduct, Button } from '../../components'
import { HelperBar } from '../../components'

const PlacingOrderInfo = ({
   cart,
   showViewOrderButton = false,
   showFulfillment = true,
   gotoMenu,
}) => {
   const router = useRouter()
   const { user } = useUser()
   const { addToast } = useToasts()
   const { t } = useTranslation()
   React.useEffect(() => {
      if (showViewOrderButton && cart.paymentStatus !== 'SUCCEEDED') {
         addToast(
            t(
               'There was an issue with your payment, please click early pay button to proceed.'
            ),
            { appearance: 'error' }
         )
      }
   }, [cart?.paymentStatus])

   const planProducts = cart?.products?.filter(node => !node.isAddOn) || []
   const addOnProducts = cart?.products?.filter(node => node.isAddOn) || []
   return (
      <div className="hern-placing-order-info__wrapper">
         <div className="hern-placing-order-info__left">
            <section>
               <header className="hern-placing-order-info__header">
                  <h4 className="hern-placing-order-info__header__title">
                     <span>{t('Your Box')}</span> (
                     {user?.subscription?.recipes?.count})
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
                     <header className="hern-placing-order-info__add-on__header">
                        <h4 className="hern-placing-order-info__add-on__header__title">
                           <span>{t('Your Add Ons')}</span>
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
         </div>
         <div className="hern-placing-order-info__right">
            <h4 className="hern-placing-order-info__billings__title">
               {t('Charges')}
            </h4>
            <section className="hern-cart-billing">
               <Billing billing={cart?.cartOwnerBilling} />
            </section>
            {showFulfillment && (
               <section className="hern-placing-order-info__address">
                  {cart?.fulfillmentInfo?.type?.includes('DELIVERY') ? (
                     <p className="hern-order-info__address__delivery">
                        <span>{t('Your box will be delivered on')}</span>{' '}
                        <span>
                           {moment(cart?.fulfillmentInfo?.slot?.from).format(
                              'MMM D'
                           )}
                           &nbsp;<span>{t('between')}</span>{' '}
                           {moment(cart?.fulfillmentInfo?.slot?.from).format(
                              'hh:mm A'
                           )}
                           &nbsp;-&nbsp;
                           {moment(cart?.fulfillmentInfo?.slot?.to).format(
                              'hh:mm A'
                           )}
                        </span>{' '}
                        <span>{t('at')}</span>{' '}
                        <span>{normalizeAddress(cart?.address)}</span>
                     </p>
                  ) : (
                     <p className="hern-order-info__address__pickup">
                        <span>{t('Pickup your box in between')}</span>
                        {moment(cart?.fulfillmentInfo?.slot?.from).format(
                           'MMM D'
                        )}
                        ,{' '}
                        {moment(cart?.fulfillmentInfo?.slot?.from).format(
                           'hh:mm A'
                        )}{' '}
                        -{' '}
                        {moment(cart?.fulfillmentInfo?.slot?.to).format(
                           'hh:mm A'
                        )}{' '}
                        <span>{t('from')}</span>{' '}
                        {normalizeAddress(cart?.fulfillmentInfo?.address)}
                     </p>
                  )}
               </section>
            )}
            {showViewOrderButton && (
               <>
                  {cart?.paymentStatus === 'SUCCEEDED' ? (
                     <Button
                        disabled={false}
                        className="hern-placing-order-info__go-to-order__btn"
                        onClick={() =>
                           router.push(
                              getRoute(
                                 `/account/orders?id=${cart?.subscriptionOccurenceId}`
                              )
                           )
                        }
                     >
                        {t('Go to Order')}
                     </Button>
                  ) : (
                     <Button
                        className="hern-placing-order-info__early-pay__btn"
                        onClick={() =>
                           router.push(getRoute(`/checkout/?id=${cart?.id}`))
                        }
                     >
                        {t('Early Pay')}
                     </Button>
                  )}
               </>
            )}

            <div className="hern-placing-order-info__btn">
               <HelperBar.Button onClick={gotoMenu}>
                  Browse Menu
               </HelperBar.Button>
            </div>
         </div>
      </div>
   )
}

export default PlacingOrderInfo