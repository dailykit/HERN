import React from 'react'
import moment from 'moment'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'

import { useTranslation, useUser } from '../context'
import { getRoute, normalizeAddress } from '../utils'
import { Billing, CartProduct, Button } from '../components'

const OrderInfo = ({
   cart,
   showViewOrderButton = false,
   showFulfillment = true,
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
      <div>
         <section>
            <header className="hern-order-info__header">
               <h4 className="hern-order-info__header__title">
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
                  <header className="hern-order-info__add-on__header">
                     <h4 className="hern-order-info__add-on__header__title">
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

         <section className="hern-cart-billing">
            <h4 className="hern-order-info__billings__title">{t('Charges')}</h4>
            <Billing billing={cart?.cartOwnerBilling} />
         </section>
         {showFulfillment && (
            <section className="hern-order-info__address">
               {cart?.fulfillmentInfo?.type?.includes('DELIVERY') ? (
                  <p className="hern-order-info__address__delivery">
                     <div style={{ display: 'flex' }}>
                        <span style={{ marginRight: '8px' }}>
                           <CalendarIllustration />
                        </span>
                        <span>
                           {t('Your box will be delivered on')}{' '}
                           {moment(cart?.fulfillmentInfo?.slot?.from).format(
                              'MMM D'
                           )}
                        </span>
                     </div>
                     &nbsp;
                     <div style={{ display: 'flex' }}>
                        <span style={{ marginRight: '8px' }}>
                           <TimeIllustrator />
                        </span>
                        <span>
                           {t('Between')}{' '}
                           {moment(cart?.fulfillmentInfo?.slot?.from).format(
                              'hh:mm A'
                           )}
                           &nbsp;-&nbsp;
                           {moment(cart?.fulfillmentInfo?.slot?.to).format(
                              'hh:mm A'
                           )}
                        </span>
                     </div>
                     &nbsp;
                     <div style={{ display: 'flex' }}>
                        <span style={{ marginRight: '8px' }}>
                           <LocationIllustration />
                        </span>
                        <span>
                           {t('At')} {normalizeAddress(cart?.address)}
                        </span>
                     </div>
                  </p>
               ) : (
                  <p className="hern-order-info__address__pickup">
                     <span>{t('Pickup your box in between')}</span>
                     {moment(cart?.fulfillmentInfo?.slot?.from).format('MMM D')}
                     ,{' '}
                     {moment(cart?.fulfillmentInfo?.slot?.from).format(
                        'hh:mm A'
                     )}{' '}
                     -{' '}
                     {moment(cart?.fulfillmentInfo?.slot?.to).format('hh:mm A')}{' '}
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
                     className="hern-order-info__go-to-order__btn"
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
                     className="hern-order-info__early-pay__btn"
                     onClick={() =>
                        router.push(getRoute(`/checkout/?id=${cart?.id}`))
                     }
                  >
                     {t('Early Pay')}
                  </Button>
               )}
            </>
         )}
      </div>
   )
}

const LocationIllustration = () => {
   return (
      <svg
         width="16"
         height="16"
         viewBox="0 0 16 16"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M2.56006 6.40031C2.56006 10.5542 7.56582 15.3878 7.77894 15.5917L8.00006 15.8029L8.22118 15.5914C8.4343 15.3878 13.4401 10.5542 13.4401 6.40031C13.4401 3.59551 12.0154 0.320312 8.00006 0.320312C3.9847 0.320312 2.56006 3.59551 2.56006 6.40031ZM12.8001 6.40031C12.8001 9.80575 8.97094 13.9203 8.00006 14.9085C7.02918 13.9203 3.20006 9.80575 3.20006 6.40031C3.20006 2.38943 5.67974 0.960312 8.00006 0.960312C10.3204 0.960312 12.8001 2.38943 12.8001 6.40031Z"
            fill="#3F4441"
            fill-opacity="0.79"
         />
         <path
            d="M4.80029 5.44023C4.80029 7.20471 6.23581 8.64023 8.00029 8.64023C9.76477 8.64023 11.2003 7.20471 11.2003 5.44023C11.2003 3.67575 9.76477 2.24023 8.00029 2.24023C6.23581 2.24023 4.80029 3.67575 4.80029 5.44023ZM10.5603 5.44023C10.5603 6.85175 9.41181 8.00023 8.00029 8.00023C6.58877 8.00023 5.44029 6.85175 5.44029 5.44023C5.44029 4.02871 6.58877 2.88023 8.00029 2.88023C9.41181 2.88023 10.5603 4.02871 10.5603 5.44023Z"
            fill="#3F4441"
            fill-opacity="0.79"
         />
      </svg>
   )
}

const CalendarIllustration = () => {
   return (
      <svg
         width="16"
         height="16"
         viewBox="0 0 16 16"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M5.5 8.5C5.9135 8.5 6.25 8.1635 6.25 7.75C6.25 7.3365 5.9135 7 5.5 7C5.0865 7 4.75 7.3365 4.75 7.75C4.75 8.1635 5.0865 8.5 5.5 8.5ZM5.5 7.5C5.5663 7.5 5.62989 7.52634 5.67678 7.57322C5.72366 7.62011 5.75 7.6837 5.75 7.75C5.75 7.8163 5.72366 7.87989 5.67678 7.92678C5.62989 7.97366 5.5663 8 5.5 8C5.4337 8 5.37011 7.97366 5.32322 7.92678C5.27634 7.87989 5.25 7.8163 5.25 7.75C5.25 7.6837 5.27634 7.62011 5.32322 7.57322C5.37011 7.52634 5.4337 7.5 5.5 7.5ZM8 8.5C8.4135 8.5 8.75 8.1635 8.75 7.75C8.75 7.3365 8.4135 7 8 7C7.5865 7 7.25 7.3365 7.25 7.75C7.25 8.1635 7.5865 8.5 8 8.5ZM8 7.5C8.0663 7.5 8.12989 7.52634 8.17678 7.57322C8.22366 7.62011 8.25 7.6837 8.25 7.75C8.25 7.8163 8.22366 7.87989 8.17678 7.92678C8.12989 7.97366 8.0663 8 8 8C7.9337 8 7.87011 7.97366 7.82322 7.92678C7.77634 7.87989 7.75 7.8163 7.75 7.75C7.75 7.6837 7.77634 7.62011 7.82322 7.57322C7.87011 7.52634 7.9337 7.5 8 7.5ZM3 11C3.4135 11 3.75 10.6635 3.75 10.25C3.75 9.8365 3.4135 9.5 3 9.5C2.5865 9.5 2.25 9.8365 2.25 10.25C2.25 10.6635 2.5865 11 3 11ZM3 10C3.0663 10 3.12989 10.0263 3.17678 10.0732C3.22366 10.1201 3.25 10.1837 3.25 10.25C3.25 10.3163 3.22366 10.3799 3.17678 10.4268C3.12989 10.4737 3.0663 10.5 3 10.5C2.9337 10.5 2.87011 10.4737 2.82322 10.4268C2.77634 10.3799 2.75 10.3163 2.75 10.25C2.75 10.1837 2.77634 10.1201 2.82322 10.0732C2.87011 10.0263 2.9337 10 3 10ZM5.5 11C5.9135 11 6.25 10.6635 6.25 10.25C6.25 9.8365 5.9135 9.5 5.5 9.5C5.0865 9.5 4.75 9.8365 4.75 10.25C4.75 10.6635 5.0865 11 5.5 11ZM5.5 10C5.5663 10 5.62989 10.0263 5.67678 10.0732C5.72366 10.1201 5.75 10.1837 5.75 10.25C5.75 10.3163 5.72366 10.3799 5.67678 10.4268C5.62989 10.4737 5.5663 10.5 5.5 10.5C5.4337 10.5 5.37011 10.4737 5.32322 10.4268C5.27634 10.3799 5.25 10.3163 5.25 10.25C5.25 10.1837 5.27634 10.1201 5.32322 10.0732C5.37011 10.0263 5.4337 10 5.5 10ZM3 13.5C3.4135 13.5 3.75 13.1635 3.75 12.75C3.75 12.3365 3.4135 12 3 12C2.5865 12 2.25 12.3365 2.25 12.75C2.25 13.1635 2.5865 13.5 3 13.5ZM3 12.5C3.0663 12.5 3.12989 12.5263 3.17678 12.5732C3.22366 12.6201 3.25 12.6837 3.25 12.75C3.25 12.8163 3.22366 12.8799 3.17678 12.9268C3.12989 12.9737 3.0663 13 3 13C2.9337 13 2.87011 12.9737 2.82322 12.9268C2.77634 12.8799 2.75 12.8163 2.75 12.75C2.75 12.6837 2.77634 12.6201 2.82322 12.5732C2.87011 12.5263 2.9337 12.5 3 12.5ZM8 12C7.5865 12 7.25 12.3365 7.25 12.75C7.25 13.1635 7.5865 13.5 8 13.5C8.4135 13.5 8.75 13.1635 8.75 12.75C8.75 12.3365 8.4135 12 8 12ZM8 13C7.9337 13 7.87011 12.9737 7.82322 12.9268C7.77634 12.8799 7.75 12.8163 7.75 12.75C7.75 12.6837 7.77634 12.6201 7.82322 12.5732C7.87011 12.5263 7.9337 12.5 8 12.5C8.0663 12.5 8.12989 12.5263 8.17678 12.5732C8.22366 12.6201 8.25 12.6837 8.25 12.75C8.25 12.8163 8.22366 12.8799 8.17678 12.9268C8.12989 12.9737 8.0663 13 8 13ZM13 11C13.4135 11 13.75 10.6635 13.75 10.25C13.75 9.8365 13.4135 9.5 13 9.5C12.5865 9.5 12.25 9.8365 12.25 10.25C12.25 10.6635 12.5865 11 13 11ZM13 10C13.0663 10 13.1299 10.0263 13.1768 10.0732C13.2237 10.1201 13.25 10.1837 13.25 10.25C13.25 10.3163 13.2237 10.3799 13.1768 10.4268C13.1299 10.4737 13.0663 10.5 13 10.5C12.9337 10.5 12.8701 10.4737 12.8232 10.4268C12.7763 10.3799 12.75 10.3163 12.75 10.25C12.75 10.1837 12.7763 10.1201 12.8232 10.0732C12.8701 10.0263 12.9337 10 13 10ZM13 8.5C13.4135 8.5 13.75 8.1635 13.75 7.75C13.75 7.3365 13.4135 7 13 7C12.5865 7 12.25 7.3365 12.25 7.75C12.25 8.1635 12.5865 8.5 13 8.5ZM13 7.5C13.0663 7.5 13.1299 7.52634 13.1768 7.57322C13.2237 7.62011 13.25 7.6837 13.25 7.75C13.25 7.8163 13.2237 7.87989 13.1768 7.92678C13.1299 7.97366 13.0663 8 13 8C12.9337 8 12.8701 7.97366 12.8232 7.92678C12.7763 7.87989 12.75 7.8163 12.75 7.75C12.75 7.6837 12.7763 7.62011 12.8232 7.57322C12.8701 7.52634 12.9337 7.5 13 7.5Z"
            fill="#3F4441"
            fill-opacity="0.79"
         />
         <path
            d="M0.75 5.75V13.75C0.75 14.439 1.311 15 2 15H14C14.689 15 15.25 14.439 15.25 13.75V3.75C15.25 3.061 14.689 2.5 14 2.5H12.75V1.75C12.75 1.3365 12.4135 1 12 1C11.5865 1 11.25 1.3365 11.25 1.75V2.5H4.75V1.75C4.75 1.3365 4.4135 1 4 1C3.5865 1 3.25 1.3365 3.25 1.75V2.5H2C1.6686 2.5004 1.35089 2.63222 1.11655 2.86655C0.88222 3.10089 0.750397 3.4186 0.75 3.75V5.75ZM14.75 13.75C14.75 14.1635 14.4135 14.5 14 14.5H2C1.5865 14.5 1.25 14.1635 1.25 13.75V6H14.75V13.75ZM11.75 1.75C11.75 1.6837 11.7763 1.62011 11.8232 1.57322C11.8701 1.52634 11.9337 1.5 12 1.5C12.0663 1.5 12.1299 1.52634 12.1768 1.57322C12.2237 1.62011 12.25 1.6837 12.25 1.75V3.75C12.25 3.8163 12.2237 3.87989 12.1768 3.92678C12.1299 3.97366 12.0663 4 12 4C11.9337 4 11.8701 3.97366 11.8232 3.92678C11.7763 3.87989 11.75 3.8163 11.75 3.75V1.75ZM3.75 1.75C3.75 1.6837 3.77634 1.62011 3.82322 1.57322C3.87011 1.52634 3.9337 1.5 4 1.5C4.0663 1.5 4.12989 1.52634 4.17678 1.57322C4.22366 1.62011 4.25 1.6837 4.25 1.75V3.75C4.25 3.8163 4.22366 3.87989 4.17678 3.92678C4.12989 3.97366 4.0663 4 4 4C3.9337 4 3.87011 3.97366 3.82322 3.92678C3.77634 3.87989 3.75 3.8163 3.75 3.75V1.75ZM1.25 3.75C1.25 3.3365 1.5865 3 2 3H3.25V3.75C3.25 4.1635 3.5865 4.5 4 4.5C4.4135 4.5 4.75 4.1635 4.75 3.75V3H11.25V3.75C11.25 4.1635 11.5865 4.5 12 4.5C12.4135 4.5 12.75 4.1635 12.75 3.75V3H14C14.4135 3 14.75 3.3365 14.75 3.75V5.5H1.25V3.75Z"
            fill="#3F4441"
            fill-opacity="0.79"
         />
         <path
            d="M10.1459 8.20685C10.169 8.23025 10.1966 8.24883 10.227 8.26151C10.2573 8.27419 10.2899 8.28072 10.3229 8.28072C10.3558 8.28072 10.3884 8.27419 10.4188 8.26151C10.4491 8.24883 10.4767 8.23025 10.4999 8.20685L11.2064 7.49985C11.2519 7.4527 11.2771 7.38955 11.2765 7.324C11.276 7.25845 11.2497 7.19575 11.2033 7.14939C11.157 7.10304 11.0943 7.07675 11.0287 7.07618C10.9632 7.07561 10.9 7.10081 10.8529 7.14635L10.3224 7.67685L10.1459 7.49985C10.0987 7.45431 10.0356 7.42911 9.97001 7.42968C9.90446 7.43025 9.84175 7.45654 9.7954 7.5029C9.74905 7.54925 9.72276 7.61195 9.72219 7.6775C9.72162 7.74305 9.74682 7.8062 9.79236 7.85335L10.1459 8.20685ZM10.1459 10.7804C10.169 10.8038 10.1966 10.8223 10.227 10.835C10.2573 10.8477 10.2899 10.8542 10.3229 10.8542C10.3558 10.8542 10.3884 10.8477 10.4188 10.835C10.4491 10.8223 10.4767 10.8038 10.4999 10.7804L11.2069 10.0733C11.2524 10.0262 11.2776 9.96305 11.277 9.8975C11.2765 9.83195 11.2502 9.76925 11.2038 9.7229C11.1575 9.67654 11.0948 9.65025 11.0292 9.64968C10.9637 9.64911 10.9005 9.67431 10.8534 9.71985L10.3224 10.2498L10.1454 10.0728C10.0982 10.0273 10.0351 10.0021 9.96951 10.0027C9.90396 10.0033 9.84126 10.0295 9.7949 10.0759C9.74855 10.1222 9.72226 10.185 9.72169 10.2505C9.72112 10.316 9.74632 10.3792 9.79186 10.4264L10.1459 10.7804ZM7.64586 10.7804C7.66901 10.8038 7.69658 10.8223 7.72696 10.835C7.75734 10.8477 7.78994 10.8542 7.82286 10.8542C7.85578 10.8542 7.88837 10.8477 7.91876 10.835C7.94914 10.8223 7.9767 10.8038 7.99986 10.7804L8.70686 10.0733C8.7524 10.0262 8.7776 9.96305 8.77703 9.8975C8.77646 9.83195 8.75016 9.76925 8.70381 9.7229C8.65746 9.67654 8.59476 9.65025 8.52921 9.64968C8.46366 9.64911 8.40051 9.67431 8.35336 9.71985L7.82236 10.2498L7.64536 10.0728C7.59821 10.0273 7.53506 10.0021 7.46951 10.0027C7.40396 10.0033 7.34126 10.0295 7.2949 10.0759C7.24855 10.1222 7.22226 10.185 7.22169 10.2505C7.22112 10.316 7.24632 10.3792 7.29186 10.4264L7.64586 10.7804ZM5.14586 13.2804C5.16901 13.3038 5.19658 13.3223 5.22696 13.335C5.25734 13.3477 5.28994 13.3542 5.32286 13.3542C5.35578 13.3542 5.38837 13.3477 5.41875 13.335C5.44914 13.3223 5.4767 13.3038 5.49986 13.2804L6.20686 12.5733C6.2524 12.5262 6.2776 12.463 6.27703 12.3975C6.27646 12.332 6.25016 12.2692 6.20381 12.2229C6.15746 12.1765 6.09476 12.1503 6.02921 12.1497C5.96366 12.1491 5.90051 12.1743 5.85336 12.2199L5.32236 12.7498L5.14536 12.5728C5.09821 12.5273 5.03506 12.5021 4.96951 12.5027C4.90396 12.5033 4.84126 12.5295 4.7949 12.5759C4.74855 12.6222 4.72226 12.6849 4.72169 12.7505C4.72112 12.816 4.74632 12.8792 4.79186 12.9264L5.14586 13.2804Z"
            fill="#3F4441"
            fill-opacity="0.79"
         />
      </svg>
   )
}

const TimeIllustrator = () => {
   return (
      <svg
         width="17"
         height="17"
         viewBox="0 0 17 17"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M8.49971 1.7666C4.78096 1.7666 1.76611 4.78145 1.76611 8.5002C1.76611 12.2189 4.78096 15.2338 8.49971 15.2338C12.2185 15.2338 15.2333 12.2189 15.2333 8.5002C15.2333 4.78145 12.2185 1.7666 8.49971 1.7666ZM8.49971 14.5963C5.13955 14.5963 2.40361 11.8604 2.40361 8.5002C2.40361 5.14004 5.13955 2.4041 8.49971 2.4041C11.8599 2.4041 14.5958 5.14004 14.5958 8.5002C14.5958 11.8604 11.8599 14.5963 8.49971 14.5963Z"
            fill="#3F4441"
            fill-opacity="0.79"
         />
         <path
            d="M8.81816 8.3666V4.64785C8.81816 4.4752 8.67207 4.3291 8.49941 4.3291C8.32676 4.3291 8.18066 4.4752 8.18066 4.64785V8.49941C8.18066 8.5791 8.22051 8.67207 8.27363 8.72519L10.8369 11.2885C10.9033 11.3549 10.983 11.3814 11.0627 11.3814C11.1424 11.3814 11.2221 11.3549 11.2885 11.2885C11.408 11.1689 11.408 10.9564 11.2885 10.8369L8.81816 8.3666Z"
            fill="#3F4441"
            fill-opacity="0.79"
         />
      </svg>
   )
}

export default OrderInfo
