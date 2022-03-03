import React from 'react'
import moment from 'moment'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/router'
import { useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../lib'
import { isClient, get_env, getRoute } from '../../utils'
import { useUser } from '../../context'
import { CART_STATUS } from '../../graphql'
import OrderInfo from '../../sections/OrderInfo'
import { Loader, HelperBar, Spacer } from '../../components'
import { PlacedOrderIllo, CartIllo, PaymentIllo } from '../../assets/icons'
import classNames from 'classnames'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const PlacingOrder = () => {
   return (
      <div className="hern-placing-order__wrapper">
         <main className="hern-placing-order__main">
            <ContentWrapper />
         </main>
      </div>
   )
}

const ContentWrapper = () => {
   const { user } = useUser()
   const { configOf } = useConfig()
   const router = useRouter()
   const {
      error,
      loading,
      data: { cart = {} } = {},
   } = useSubscription(CART_STATUS, {
      skip: !isClient || !new URLSearchParams(location.search).get('id'),
      variables: {
         id: isClient ? new URLSearchParams(location.search).get('id') : '',
      },
      onSubscriptionData: ({
         subscriptionData: { data: { cart = {} } = {} } = {},
      } = {}) => {
         const isNotFirstTimeOrder =
            router.pathname === '/[brand]/placing-order'
         if (isNotFirstTimeOrder) {
            ReactPixel.trackCustom('earlyPay', {
               ...cart,
               currency: isClient && get_env('CURRENCY'),
               value: cart?.amount,
            })
         } else {
            ReactPixel.track('Subscribe', {
               ...cart,
               currency: isClient && get_env('CURRENCY'),
            })
         }

         ReactPixel.track('Purchase', {
            ...cart,
            currency: isClient && get_env('CURRENCY'),
            value: cart?.amount,
         })
      },
   })
   const theme = configOf('theme-color', 'Visual')
   const gotoMenu = () => {
      isClient && window.localStorage.removeItem('plan')
      if (isClient) {
         window.location.href = cart?.fulfillmentInfo?.slot?.from
            ? `${get_env('BASE_BRAND_URL')}/menu?d=${moment(
                 cart?.fulfillmentInfo?.slot?.from
              ).format('YYYY-MM-DD')}`
            : `${get_env('BASE_BRAND_URL')}/menu`
      }
   }

   if (loading) return <Loader inline />
   if (isClient && !new URLSearchParams(location.search).get('id')) {
      return (
         <main className="hern-placing-order__main">
            <HelperBar>
               <HelperBar.Title>
                  Oh no! Looks like you've wandered on an unknown path, let's
                  get you to home.
               </HelperBar.Title>
               <HelperBar.Button
                  onClick={() =>
                     (window.location.href =
                        get_env('BASE_BRAND_URL') + getRoute('/'))
                  }
               >
                  Go to Home
               </HelperBar.Button>
            </HelperBar>
         </main>
      )
   }
   if (error) {
      return (
         <main className="hern-placing-order__main">
            <HelperBar type="danger">
               <HelperBar.SubTitle>
                  Looks like there was an issue fetching details, please refresh
                  the page!
               </HelperBar.SubTitle>
            </HelperBar>
         </main>
      )
   }
   if (isEmpty(cart)) {
      return (
         <main className="hern-placing-order__main">
            <HelperBar type="info">
               <HelperBar.Title>
                  Looks like the page you're requesting is not available
                  anymore, let's get you to home.
               </HelperBar.Title>
               <HelperBar.Button
                  onClick={() =>
                     (window.location.href =
                        get_env('BASE_BRAND_URL') + getRoute('/'))
                  }
               >
                  Go to Home
               </HelperBar.Button>
            </HelperBar>
         </main>
      )
   }
   if (user?.keycloakId !== cart?.customerKeycloakId) {
      return (
         <main className="hern-placing-order__main">
            <HelperBar type="warning">
               <HelperBar.SubTitle>
                  Seems like, you do not have access to this page, let's get you
                  to home.
               </HelperBar.SubTitle>
               <HelperBar.Button
                  onClick={() =>
                     (window.location.href =
                        get_env('BASE_BRAND_URL') + getRoute('/'))
                  }
               >
                  Go to Home
               </HelperBar.Button>
            </HelperBar>
         </main>
      )
   }
   return (
      <section className="hern-placing-order__content">
         <header className="hern-placing-order__header">
            <h2
               style={{
                  color: `${
                     theme?.accent ? theme?.accent : 'rgba(5,150,105,1)'
                  }`,
               }}
               className="hern-placing-order__header__title"
               theme={theme}
            >
               Order Summary
            </h2>
         </header>
         <OrderInfo cart={cart} />
         <ul className="hern-placing-order__steps">
            <li
               className={classNames('hern-placing-order__step', {
                  'hern-placing-order__step--active':
                     cart.status !== 'CART_PENDING',
               })}
            >
               <span className="hern-placing-order__step__illustration">
                  <CartIllo />
               </span>
               Saving Cart
               {cart.status === 'CART_PENDING' && <Pulse />}
            </li>
            <li
               className={classNames('hern-placing-order__step', {
                  'hern-placing-order__step--active':
                     cart.paymentStatus === 'SUCCEEDED',
               })}
            >
               <span className="hern-placing-order__step__illustration">
                  <PaymentIllo />
               </span>
               Processing Payment
               {cart.paymentStatus !== 'SUCCEEDED' && <Pulse />}
            </li>
            <li
               className={classNames('hern-placing-order__step', {
                  'hern-placing-order__step--active':
                     cart.status === 'ORDER_PENDING' && cart.orderId,
               })}
            >
               <span className="hern-placing-order__step__illustration">
                  <PlacedOrderIllo />
               </span>
               Order Placed
               {cart.status !== 'ORDER_PENDING' ||
                  (!Boolean(cart.orderId) && <Pulse />)}
            </li>
         </ul>
         <Spacer />
         {cart.status === 'ORDER_PENDING' && cart.orderId && (
            <HelperBar type="success">
               <HelperBar.Title>
                  <span role="img" aria-label="celebrate">
                     🎉
                  </span>
                  Congratulations!{' '}
               </HelperBar.Title>
               <HelperBar.SubTitle>
                  Your order has been placed. Continue selecting menu for others
                  weeks.
               </HelperBar.SubTitle>
               <HelperBar.Button onClick={gotoMenu}>
                  Browse Menu
               </HelperBar.Button>
            </HelperBar>
         )}
      </section>
   )
}

const Pulse = () => (
   <span className="hern-placing-order__indicator-pulse">
      <span></span>
      <span></span>
   </span>
)
