import React from 'react'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Radio, Space } from 'antd'

import { useConfig, usePayment } from '../../lib'
import * as Icon from '../../assets/icons'
import OrderInfo from '../../sections/OrderInfo'
import { isClient, formatCurrency, getRoute } from '../../utils'
import { Loader, Button, HelperBar } from '../../components'
import {
   // usePayment,
   ProfileSection,
   PaymentProvider,
   PaymentSection,
} from '../../sections/checkout'
import { useUser } from '../../context'
import * as QUERIES from '../../graphql'
import { isEmpty } from 'lodash'

export const Checkout = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/select-plan'))
      }
   }, [isAuthenticated, isLoading])

   return (
      <PaymentProvider>
         <PaymentContent />
      </PaymentProvider>
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

const PaymentContent = () => {
   const router = useRouter()
   const { user } = useUser()
   // const { state } = usePayment()
   const {
      isPaymentLoading,
      paymentLifeCycleState,
      paymentInfo,
      profileInfo,
      setPaymentInfo,
      setIsProcessingPayment,
      setProfileInfo,
      updatePaymentState,
      setIsPaymentInitiated,
   } = usePayment()
   const { addToast } = useToasts()
   const authTabRef = React.useRef()
   const { configOf } = useConfig()
   const [otpPageUrl, setOtpPageUrl] = React.useState('')
   const [isOverlayOpen, toggleOverlay] = React.useState(false)
   const [overlayMessage, setOverlayMessage] = React.useState('')

   const {
      loading,
      error,
      data: { cart = { paymentStatus: '', transactionRemark: {} } } = {},
   } = useSubscription(QUERIES.CART_SUBSCRIPTION, {
      skip: !isClient || !new URLSearchParams(location.search).get('id'),
      variables: {
         id: isClient ? new URLSearchParams(location.search).get('id') : '',
      },
   })

   // React.useEffect(() => {
   //    if (!loading && !isEmpty(cart)) {
   //       ;(async () => {
   //          const status = cart.paymentStatus
   //          const remark = cart.transactionRemark
   //          const next_action = cart.transactionRemark?.next_action

   //          try {
   //             if (status === 'PENDING') {
   //                setOverlayMessage(messages['PENDING'])
   //             } else if (status === 'REQUIRES_ACTION' && !next_action?.type) {
   //                toggleOverlay(true)
   //                setOverlayMessage(messages['REQUIRES_ACTION'])
   //             } else if (status === 'REQUIRES_ACTION' && next_action?.type) {
   //                toggleOverlay(true)
   //                setOverlayMessage(messages['REQUIRES_ACTION_WITH_URL'])
   //                let TAB_URL = ''
   //                let remark = remark
   //                if (next_action?.type === 'use_stripe_sdk') {
   //                   TAB_URL = next_action?.use_stripe_sdk?.stripe_js
   //                } else {
   //                   TAB_URL = next_action?.redirect_to_url?.url
   //                }
   //                setOtpPageUrl(TAB_URL)
   //                authTabRef.current = window.open(TAB_URL, 'payment_auth_page')
   //             } else if (
   //                status === 'REQUIRES_PAYMENT_METHOD' &&
   //                remark?.last_payment_error?.code
   //             ) {
   //                toggleOverlay(false)
   //                setOverlayMessage(messages['PENDING'])
   //                addToast(remark?.last_payment_error?.message, {
   //                   appearance: 'error',
   //                })
   //             } else if (cart.paymentStatus === 'SUCCEEDED') {
   //                if (authTabRef.current) {
   //                   authTabRef.current.close()
   //                   if (!authTabRef.current.closed) {
   //                      window.open(
   //                         `/checkout?id=${cart.id}`,
   //                         'payment_auth_page'
   //                      )
   //                   }
   //                }
   //                setOverlayMessage(messages['SUCCEEDED'])
   //                addToast(messages['SUCCEEDED'], { appearance: 'success' })
   //                router.push(`/placing-order?id=${cart.id}`)
   //             } else if (status === 'PAYMENT_FAILED') {
   //                toggleOverlay(false)
   //                addToast(messages['PAYMENT_FAILED'], {
   //                   appearance: 'error',
   //                })
   //             }
   //          } catch (error) {
   //             console.log('on succeeded -> error -> ', error)
   //          }
   //       })()
   //    }
   // }, [loading, cart])

   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onCompleted: () => {
         updatePaymentState({
            paymentLifeCycleState: 'PROCESSING',
         })
      },
      onError: error => {
         updatePaymentState({
            paymentLifeCycleState: 'FAILED',
         })
         addToast(error.message, { appearance: 'error' })
      },
   })

   const isStripe =
      paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
         ?.supportedPaymentCompany?.label === 'stripe'

   const [updatePlatformCustomer] = useMutation(
      QUERIES.UPDATE_PLATFORM_CUSTOMER,
      {
         onCompleted: () => {
            updateCart({
               variables: {
                  id: cart.id,
                  _inc: { paymentRetryAttempt: 1 },
                  _set: {
                     paymentMethodId: isStripe
                        ? paymentInfo?.selectedAvailablePaymentOption
                             ?.selectedPaymentMethodId || null
                        : null,
                     toUseAvailablePaymentOptionId:
                        paymentInfo?.selectedAvailablePaymentOption?.id,
                     customerInfo: {
                        customerEmail: profileInfo?.email,
                        customerPhone: profileInfo?.phone,
                        customerLastName: profileInfo?.lastName,
                        customerFirstName: profileInfo?.firstName,
                     },
                  },
               },
            })
         },
         onError: error => {
            console.log('updatePlatformCustomer -> error -> ', error)
            addToast('Failed to update the user profile!', {
               appearance: 'success',
            })
         },
      }
   )

   const handleSubmit = () => {
      // toggleOverlay(true)
      setIsProcessingPayment(true)
      if (!isEmpty(profileInfo)) {
         setIsPaymentInitiated(true)
         updatePaymentState({
            paymentLifeCycleState: 'INCREMENT_PAYMENT_RETRY_ATTEMPT',
         })

         updatePlatformCustomer({
            variables: {
               keycloakId: user.keycloakId,
               _set: {
                  firstName: profileInfo.firstName,
                  lastName: profileInfo.lastName,
                  phoneNumber: profileInfo.phone,
               },
            },
         })
      }
   }

   const isValid = () => {
      return (
         profileInfo.firstName &&
         profileInfo.lastName &&
         profileInfo.phone &&
         paymentInfo &&
         paymentInfo.selectedAvailablePaymentOption?.id
      )
   }
   const onOverlayClose = () => {
      setOtpPageUrl('')
      setOverlayMessage('We are processing your payment.')
      toggleOverlay(false)
   }

   const theme = configOf('theme-color', 'Visual')

   // React.useEffect(() => {
   //    if (!isEmpty(cart) && !loading) {
   //       console.log('cart checkout-page-> ', cart)
   //       const availablePaymentOptionToCart =
   //          cart.availablePaymentOptionToCart.find(
   //             option => option?.label === 'Paytm Page'
   //          )
   //       console.log(availablePaymentOptionToCart)
   //       setPaymentInfo({
   //          selectedAvailablePaymentOption: availablePaymentOptionToCart,
   //       })
   //    }
   // }, [cart])

   const onPaymentMethodChange = event => {
      const { value } = event.target
      if (value) {
         const availablePaymentOptionToCart =
            cart.availablePaymentOptionToCart.find(
               option => option.id === value
            )
         console.log(availablePaymentOptionToCart)
         setPaymentInfo({
            selectedAvailablePaymentOption: availablePaymentOptionToCart,
         })
      }
   }

   const showPaymentIcon = label => {
      switch (label) {
         case 'Debit/Credit Card':
            return <Icon.DebitCardIcon />
         case 'Netbanking':
            return <Icon.NetbankingIcon />
         case 'Paytm':
            return <Icon.PaytmIcon />
         case 'UPI':
            return <Icon.UpiIcon />
         default:
            return null
      }
   }

   if (loading || isPaymentLoading) return <Loader inline />
   if (isClient && !new URLSearchParams(location.search).get('id')) {
      return (
         <Main>
            <div tw="pt-4 w-full">
               <HelperBar>
                  <HelperBar.Title>
                     Oh no! Looks like you've wandered on an unknown path, let's
                     get you to home.
                  </HelperBar.Title>
                  <HelperBar.Button
                     onClick={() =>
                        (window.location.href =
                           window.location.origin + getRoute('/'))
                     }
                  >
                     Go to Home
                  </HelperBar.Button>
               </HelperBar>
            </div>
         </Main>
      )
   }
   if (error) {
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
   if (isEmpty(cart)) {
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
                           window.location.origin + getRoute('/'))
                     }
                  >
                     Go to Home
                  </HelperBar.Button>
               </HelperBar>
            </div>
         </Main>
      )
   }
   if (user?.keycloakId !== cart?.customerKeycloakId) {
      return (
         <Main>
            <div tw="pt-4 w-full">
               <HelperBar type="warning">
                  <HelperBar.SubTitle>
                     Seems like, you do not have access to this page, let's get
                     you to home.
                  </HelperBar.SubTitle>
                  <HelperBar.Button
                     onClick={() =>
                        (window.location.href =
                           window.location.origin + getRoute('/'))
                     }
                  >
                     Go to Home
                  </HelperBar.Button>
               </HelperBar>
            </div>
         </Main>
      )
   }
   return (
      <Main>
         <Form>
            <header tw="my-3 pb-1 border-b flex items-center justify-between">
               <SectionTitle theme={theme}>Profile Details</SectionTitle>
            </header>
            <ProfileSection />
            <SectionTitle theme={theme}>Select Payment Method</SectionTitle>
            <Radio.Group onChange={onPaymentMethodChange}>
               <>
                  <Space direction="vertical">
                     {!isEmpty(cart) &&
                        cart.availablePaymentOptionToCart.map(option => (
                           <Radio value={option?.id} key={option?.id}>
                              <div tw="flex items-center">
                                 <Space size="middle">
                                    {showPaymentIcon(option?.label)}

                                    {option?.label ||
                                       option?.supportedPaymentOption
                                          ?.paymentOptionLabel}
                                 </Space>
                              </div>
                           </Radio>
                        ))}
                  </Space>
               </>
            </Radio.Group>
            {paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
               ?.supportedPaymentCompany.label === 'stripe' && (
               <PaymentSection cart={cart} />
            )}
         </Form>
         {cart?.products?.length > 0 && (
            <CartDetails>
               <OrderInfo cart={cart} />
               <section>
                  <Button
                     tw="w-full"
                     bg={theme?.accent}
                     onClick={handleSubmit}
                     disabled={!Boolean(isValid())}
                  >
                     Confirm & Pay {formatCurrency(cart.totalPrice)}
                  </Button>
               </section>
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
                     {cart.paymentStatus === 'REQUIRES_ACTION' && otpPageUrl && (
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
                     {cart.paymentStatus !== 'PENDING' && <Loader inline />}
                  </section>
               </main>
            </Overlay>
         )}
      </Main>
   )
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
   padding: 0 16px;
   margin-bottom: 24px;
   min-height: calc(100vh - 160px);
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
