import React from 'react'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../lib'
import * as Icon from '../../assets/icons'
import OrderInfo from '../../sections/OrderInfo'
import { OnDemandCart } from '../cart'
import {
   isClient,
   formatCurrency,
   getRoute,
   useQueryParams,
   get_env,
} from '../../utils'
import {
   Loader,
   Button,
   HelperBar,
   PaymentOptionsRenderer,
   UserInfo,
} from '../../components'
import {
   // usePayment,
   ProfileSection,
   PaymentProvider,
   PaymentSection,
} from '../../sections/checkout'
import { useUser, useCart, useTranslation } from '../../context'
import * as QUERIES from '../../graphql'
import { isEmpty } from 'lodash'
import { EmptyCart } from '../../assets/icons'
import Link from 'next/link'

export const Checkout = props => {
   const router = useRouter()
   const { id } = router.query
   const { isAuthenticated, isLoading, user } = useUser()

   const { cartState, isFinalCartLoading } = useCart()
   const { addToast } = useToasts()
   const { t } = useTranslation()
   const authTabRef = React.useRef()
   const { configOf } = useConfig()
   const [otpPageUrl, setOtpPageUrl] = React.useState('')
   const [isOverlayOpen, toggleOverlay] = React.useState(false)
   const [overlayMessage, setOverlayMessage] = React.useState('')
   const [loading, setLoading] = React.useState(true)
   const {
      error,
      data: { cart = { paymentStatus: '', transactionRemark: {} } } = {},
   } = useSubscription(QUERIES.CART_SUBSCRIPTION, {
      skip: isEmpty(id),
      variables: {
         id,
      },
      onSubscriptionData: () => {
         setLoading(false)
      },
   })

   const onOverlayClose = () => {
      setOtpPageUrl('')
      setOverlayMessage('We are processing your payment.')
      toggleOverlay(false)
   }

   const theme = configOf('theme-color', 'Visual')

   React.useEffect(() => {
      if (!isAuthenticated && !isLoading && cart?.source === 'subscription') {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/select-plan'))
      }
   }, [isAuthenticated, isLoading])

   React.useEffect(() => {
      if (!isEmpty(cartState) && cartState?.cart?.id) {
         setLoading(false)
      }
   }, [cartState?.cart?.id])

   if (
      isClient &&
      !new URLSearchParams(location.search).get('id') &&
      cart?.source === 'subscription'
   ) {
      return (
         // <Main>
         //    <div tw="pt-4 w-full">
         //       <HelperBar>
         //          <HelperBar.Title>
         //             Oh no! Looks like you've wandered on an unknown path, let's
         //             get you to home.
         //          </HelperBar.Title>
         //          <HelperBar.Button onClick={() => router.push('/')}>
         //             Go to Home
         //          </HelperBar.Button>
         //       </HelperBar>
         //    </div>
         // </Main>
         <div className="hern-cart-empty-cart">
            <EmptyCart />
            <span>Oops! Your cart is empty </span>
            <Button className="hern-cart-go-to-menu-btn" onClick={() => {}}>
               <Link href="/order">GO TO MENU</Link>
            </Button>
         </div>
      )
   }
   if (error) {
      setLoading(false)
      return (
         <Main>
            <div tw="pt-4 w-full">
               <HelperBar type="danger">
                  <HelperBar.SubTitle>
                     Looks like there was an issue fetching details, please
                     refresh the page!
                  </HelperBar.SubTitle>
               </HelperBar>
            </div>
         </Main>
      )
   }
   if (isEmpty(cart) && cart?.source === 'subscription') {
      return (
         <Main>
            <div tw="pt-4 w-full">
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
            </div>
         </Main>
      )
   }
   if (id === 'undefined') {
      return (
         <div className="hern-cart-empty-cart">
            <EmptyCart />
            <span>Oops! Your cart is empty </span>
            <Button className="hern-cart-go-to-menu-btn" onClick={() => {}}>
               <Link href="/order">GO TO MENU</Link>
            </Button>
         </div>
      )
   }
   // if (isAuthenticated && user?.keycloakId !== cart?.customerKeycloakId) {
   //    return (
   //       <Main>
   //          <div tw="pt-4 w-full">
   //             <HelperBar type="warning">
   //                <HelperBar.SubTitle>
   //                   Seems like, you do not have access to this page, let's get
   //                   you to home.
   //                </HelperBar.SubTitle>
   //                <HelperBar.Button
   //                   onClick={() =>
   //                      (window.location.href =
   //                         get_env('BASE_BRAND_URL') + getRoute('/'))
   //                   }
   //                >
   //                   Go to Home
   //                </HelperBar.Button>
   //             </HelperBar>
   //          </div>
   //       </Main>
   //    )
   // }
   if (loading) return <Loader inline />
   return (
      <>
         {cart?.source === 'subscription' ? (
            <Main>
               <Form>
                  <header tw="my-3 pb-1 border-b flex items-center justify-between">
                     <SectionTitle theme={theme}>Profile Details</SectionTitle>
                  </header>
                  <UserInfo cart={cart} />
                  {!isEmpty(cart) && (
                     <PaymentOptionsRenderer cartId={cart?.id} />
                  )}
               </Form>
               {cart?.products?.length > 0 && (
                  <CartDetails>
                     <OrderInfo cart={cart} />
                  </CartDetails>
               )}
               {isOverlayOpen && (
                  <Overlay>
                     <header tw="flex pr-3 pt-3">
                        <button
                           onClick={onOverlayClose}
                           tw="ml-auto bg-white h-10 w-10 flex items-center justify-center rounded-full"
                        >
                           <Icon.CloseIcon tw="stroke-current text-gray-600" />
                        </button>
                     </header>
                     <main tw="flex-1 flex flex-col items-center justify-center">
                        <section tw="p-4 w-11/12 lg:w-8/12 bg-white rounded flex flex-col items-center">
                           <p tw="lg:w-3/4 text-gray-700 md:text-lg mb-4 text-center">
                              {overlayMessage}{' '}
                           </p>
                           {cart.paymentStatus === 'REQUIRES_ACTION' &&
                              otpPageUrl && (
                                 <a
                                    target="_blank"
                                    href={otpPageUrl}
                                    title={otpPageUrl}
                                    rel="noreferer noopener"
                                    style={{ color: '#fff' }}
                                    tw="inline-block px-4 py-2 bg-orange-400 text-sm uppercase rounded font-medium tracking-wider text-indigo-600"
                                 >
                                    Complete Payment
                                 </a>
                              )}
                           {cart.paymentStatus !== 'PENDING' && (
                              <Loader inline />
                           )}
                        </section>
                     </main>
                  </Overlay>
               )}
            </Main>
         ) : (
            <OnDemandCart config={props.config} />
         )}
      </>
   )
}

const messages = {
   PENDING: 'We are processing your payment.',
   SUCCEEDED: 'Payment for your order has succeeded, you will redirected soon.',
   REQUIRES_PAYMENT_METHOD: '',
   REQUIRES_ACTION:
      'A window will open in short while for further payment authorization required by your bank!',
   PAYMENT_FAILED: 'Your payment has failed, please try again.',
   REQUIRES_ACTION_WITH_URL:
      'A window will open in short while for further payment authorization required by your bank. In case the new window has not opened own yet, please click the button below.',
}

const Overlay = styled.section`
   ${tw`fixed flex flex-col inset-0`};
   z-index: 1000;
   background: rgba(0, 0, 0, 0.3);
`

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`text-green-600 text-lg`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const Main = styled.main`
   display: flex;
   padding: 64px 16px 16px 16px;
   margin-bottom: 24px;
   min-height: calc(100vh - 220px);
   ${tw`gap-4`}
   @media (max-width: 768px) {
      flex-direction: column;
   }
`

const Form = styled.section`
   flex: 1;
   .ant-radio-wrapper {
      align-items: center;
   }
`
const CartDetails = styled.section`
   width: 420px;
   @media (max-width: 768px) {
      width: 100%;
      > section {
         padding: 16px;
         position: fixed;
         bottom: 0;
         left: 0;
         background-color: #fff;
         right: 0;
         > button {
            ${tw`shadow-lg`}
         }
      }
   }
`
