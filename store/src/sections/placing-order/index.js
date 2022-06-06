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
         cart?.fulfillmentInfo?.slot?.from
            ? router.push(
                 `/menu?d=${moment(cart?.fulfillmentInfo?.slot?.from).format(
                    'YYYY-MM-DD'
                 )}`
              )
            : router.push(`/menu`)
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
         {cart.status === 'ORDER_PENDING' && cart.orderId && (
            <HelperBar type="success">
               <HelperBar.Title>
                  <span role="img" aria-label="celebrate">
                     <CelebrationIllustration />
                  </span>
               </HelperBar.Title>
               <HelperBar.SubTitle>
                  <span>Congratulations!</span> Your order has been placed.
                  Continue selecting menu for others weeks.
               </HelperBar.SubTitle>
               {/* <HelperBar.Button onClick={gotoMenu}>
                  Browse Menu
               </HelperBar.Button> */}
               <StarsIllustration />
            </HelperBar>
         )}

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
      </section>
   )
}

const Pulse = () => (
   <span className="hern-placing-order__indicator-pulse">
      <span></span>
      <span></span>
   </span>
)

const CelebrationIllustration = () => (
   <svg
      width="81"
      height="81"
      viewBox="0 0 81 81"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <path
         d="M27.0501 18.6986C26.8143 18.9343 26.6353 19.2185 26.4859 19.5301L26.469 19.5133L2.85638 72.7028L2.87954 72.7259C2.44164 73.5743 3.17427 75.3007 4.67532 76.8038C6.17427 78.3028 7.90059 79.0354 8.74901 78.5975L8.77006 78.6186L61.9637 55.008L61.9469 54.9891C62.2585 54.8417 62.5406 54.6628 62.7785 54.4249C66.0669 51.1364 60.7343 40.4733 50.869 30.608C41.0037 20.7407 30.3385 15.4101 27.0501 18.6986Z"
         fill="#DD2E44"
      />
      <path
         d="M29.9427 28.1962L3.45006 71.3667L2.85638 72.7035L2.87954 72.7246C2.44164 73.5751 3.17427 75.2993 4.67532 76.8025C5.16375 77.2909 5.66901 77.6614 6.16796 77.9751L38.3637 38.7225L29.9427 28.1962Z"
         fill="#EA596E"
      />
      <path
         d="M51.0213 30.4424C60.8529 40.2782 66.3118 50.7624 63.2087 53.8634C60.1076 56.9645 49.6234 51.5076 39.7855 41.6761C29.9518 31.8403 24.495 21.354 27.596 18.2508C30.6992 15.1498 41.1834 20.6087 51.0213 30.4424Z"
         fill="#A0041E"
      />
      <path
         d="M41.7109 31.5875C41.2919 31.9264 40.7446 32.1032 40.1656 32.0401C38.3382 31.8422 36.8014 31.2064 35.7256 30.2022C34.5867 29.139 34.0246 27.7138 34.1782 26.2822C34.4477 23.7727 36.9656 21.4696 41.2582 21.9348C42.9277 22.1138 43.673 21.5769 43.6961 21.3201C43.7256 21.0653 43.113 20.3811 41.4456 20.2001C39.6161 20.0022 38.0814 19.3664 37.0035 18.3622C35.8646 17.299 35.3003 15.8717 35.4561 14.4422C35.7298 11.9327 38.2456 9.62956 42.534 10.0948C43.7509 10.2254 44.3909 9.97272 44.6625 9.81061C44.8814 9.67798 44.9677 9.55166 44.9761 9.48009C44.9993 9.22535 44.3951 8.54114 42.7214 8.36009C41.5677 8.23377 40.7298 7.19798 40.8561 6.04009C40.9803 4.8843 42.0161 4.04851 43.174 4.17482C47.4625 4.63588 49.433 7.42114 49.1614 9.93272C48.8898 12.4422 46.374 14.7432 42.0814 14.2801C40.8646 14.1475 40.2267 14.4001 39.9551 14.5622C39.7382 14.6948 39.6498 14.8232 39.6414 14.8927C39.614 15.1496 40.2225 15.8338 41.8961 16.0148C46.1846 16.4759 48.1551 19.2611 47.8835 21.7727C47.6119 24.2822 45.094 26.5853 40.8056 26.1201C39.5888 25.9896 38.9488 26.2401 38.6751 26.4022C38.4582 26.5348 38.374 26.6632 38.3656 26.7348C38.3382 26.9896 38.9467 27.6738 40.6182 27.8548C41.7719 27.979 42.6119 29.0169 42.4835 30.1727C42.4225 30.7517 42.1298 31.2485 41.7109 31.5875Z"
         fill="#AA8DD8"
      />
      <path
         d="M67.1221 51.0531C71.2758 49.8805 74.1411 51.7331 74.8232 54.1647C75.5053 56.5942 74.0274 59.67 69.8779 60.8363C68.2568 61.291 67.7705 62.0658 67.8358 62.3142C67.9074 62.5626 68.7305 62.971 70.3474 62.5121C74.499 61.3458 77.3642 63.1984 78.0463 65.6279C78.7347 68.0595 77.2526 71.131 73.099 72.3016C71.48 72.7563 70.9916 73.5331 71.0632 73.7795C71.1326 74.0258 71.9537 74.4321 73.5726 73.9795C74.6905 73.6637 75.8547 74.3163 76.1705 75.4342C76.4821 76.5542 75.8316 77.7163 74.7095 78.0321C70.5621 79.2005 67.6926 77.3521 67.0063 74.9184C66.3242 72.4889 67.8042 69.4173 71.96 68.2468C73.579 67.79 74.0674 67.0173 73.9958 66.7689C73.9263 66.5226 73.1074 66.1121 71.4884 66.5668C67.3347 67.7373 64.4695 65.8889 63.7853 63.4552C63.1011 61.0237 64.5811 57.9521 68.7368 56.7816C70.3516 56.3289 70.84 55.55 70.7705 55.3058C70.699 55.0552 69.8821 54.6468 68.2611 55.1037C67.1411 55.4195 65.9811 54.7668 65.6653 53.6468C65.3495 52.5289 66.0021 51.3668 67.1221 51.0531Z"
         fill="#77B255"
      />
      <path
         d="M50.9983 45.3755C50.3794 45.3755 49.7688 45.1039 49.352 44.586C48.6257 43.6765 48.773 42.3523 49.6804 41.626C50.1394 41.2576 61.0867 32.6597 76.5583 34.8723C77.7099 35.0365 78.5078 36.1018 78.3436 37.2534C78.1794 38.4029 77.1225 39.2113 75.9604 39.0386C62.2909 37.0976 52.4088 44.8365 52.312 44.9144C51.9225 45.226 51.4594 45.3755 50.9983 45.3755Z"
         fill="#AA8DD8"
      />
      <path
         d="M14.6891 36.6196C14.4891 36.6196 14.2849 36.5902 14.0828 36.5312C12.9691 36.1965 12.3375 35.0217 12.6723 33.9081C15.0575 25.9649 17.2197 13.2891 14.5628 9.98595C14.2639 9.61121 13.8175 9.24279 12.7902 9.32068C10.8133 9.47016 11.0028 13.6386 11.0049 13.6807C11.0933 14.8407 10.2218 15.8512 9.06386 15.9375C7.88702 16.0091 6.89123 15.1544 6.80702 13.9944C6.58807 11.0912 7.49334 5.49963 12.4723 5.12279C14.6954 4.95437 16.5418 5.727 17.847 7.34805C22.8386 13.5607 17.7712 31.5733 16.7039 35.1207C16.4302 36.0323 15.5944 36.6196 14.6891 36.6196Z"
         fill="#77B255"
      />
      <path
         d="M59.4183 22.9349C59.4183 24.678 58.0036 26.0928 56.2604 26.0928C54.5173 26.0928 53.1025 24.678 53.1025 22.9349C53.1025 21.1917 54.5173 19.777 56.2604 19.777C58.0036 19.777 59.4183 21.1917 59.4183 22.9349Z"
         fill="#5C913B"
      />
      <path
         d="M10.9953 40.829C10.9953 43.1532 9.10896 45.0396 6.78475 45.0396C4.46053 45.0396 2.57422 43.1532 2.57422 40.829C2.57422 38.5048 4.46053 36.6185 6.78475 36.6185C9.10896 36.6185 10.9953 38.5048 10.9953 40.829Z"
         fill="#9266CC"
      />
      <path
         d="M74.1517 43.9871C74.1517 45.7303 72.737 47.145 70.9938 47.145C69.2507 47.145 67.8359 45.7303 67.8359 43.9871C67.8359 42.244 69.2507 40.8292 70.9938 40.8292C72.737 40.8292 74.1517 42.244 74.1517 43.9871Z"
         fill="#5C913B"
      />
      <path
         d="M55.2064 69.2503C55.2064 70.9935 53.7917 72.4082 52.0485 72.4082C50.3054 72.4082 48.8906 70.9935 48.8906 69.2503C48.8906 67.5072 50.3054 66.0924 52.0485 66.0924C53.7917 66.0924 55.2064 67.5072 55.2064 69.2503Z"
         fill="#5C913B"
      />
      <path
         d="M65.7336 11.3544C65.7336 13.6786 63.8472 15.5649 61.523 15.5649C59.1988 15.5649 57.3125 13.6786 57.3125 11.3544C57.3125 9.0302 59.1988 7.14389 61.523 7.14389C63.8472 7.14389 65.7336 9.0302 65.7336 11.3544Z"
         fill="#FFCC4D"
      />
      <path
         d="M74.1517 20.8279C74.1517 22.5711 72.737 23.9858 70.9938 23.9858C69.2507 23.9858 67.8359 22.5711 67.8359 20.8279C67.8359 19.0848 69.2507 17.6701 70.9938 17.6701C72.737 17.6701 74.1517 19.0848 74.1517 20.8279Z"
         fill="#FFCC4D"
      />
      <path
         d="M67.8392 29.2503C67.8392 30.9935 66.4245 32.4082 64.6813 32.4082C62.9382 32.4082 61.5234 30.9935 61.5234 29.2503C61.5234 27.5072 62.9382 26.0924 64.6813 26.0924C66.4245 26.0924 67.8392 27.5072 67.8392 29.2503Z"
         fill="#FFCC4D"
      />
      <path
         d="M21.5228 52.407C21.5228 54.1502 20.1081 55.5649 18.3649 55.5649C16.6218 55.5649 15.207 54.1502 15.207 52.407C15.207 50.6639 16.6218 49.2492 18.3649 49.2492C20.1081 49.2492 21.5228 50.6639 21.5228 52.407Z"
         fill="#FFCC4D"
      />
   </svg>
)

const StarsIllustration = () => (
   <svg
      width="115"
      height="121"
      viewBox="0 0 115 121"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <path
         d="M114.7 83.2066C89.618 83.2066 77.077 70.6656 77.077 45.5837C77.077 70.6656 64.5361 83.2066 39.4541 83.2066C63.3066 83.2066 75.6016 94.5181 77.077 116.895C77.077 118.125 77.077 119.354 77.077 120.83C77.077 95.7476 89.618 83.2066 114.7 83.2066ZM88.6344 31.8132C88.6344 21.4853 93.7984 16.3214 104.126 16.3214C93.7984 16.3214 88.6344 11.1575 88.6344 0.82959C88.6344 11.1575 83.4705 16.3214 73.1426 16.3214C83.4705 16.3214 88.6344 21.4853 88.6344 31.8132Z"
         fill="#11823B"
         fill-opacity="0.4"
      />
      <path
         d="M19.205 27.6382C19.205 40.0467 13.0755 46.1761 0.666992 46.1761C13.0755 46.1761 19.205 52.3056 19.205 64.7141C19.205 52.4551 25.3344 46.1761 37.7429 46.1761C25.3344 46.1761 19.205 40.0467 19.205 27.6382Z"
         fill="#EA596E"
         fill-opacity="0.4"
      />
   </svg>
)
