import React from 'react'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Select, Menu, Dropdown } from 'antd'

import { useConfig } from '../../lib'
import * as QUERIES from '../../graphql'
import * as Icon from '../../assets/icons'
import OrderInfo from '../../sections/OrderInfo'
import {
   isClient,
   formatCurrency,
   getSettings,
   getRoute,
   useRazorPay,
   get_env,
} from '../../utils'
import { Loader, Button, HelperBar } from '../../components'
import {
   usePayment,
   ProfileSection,
   PaymentProvider,
   PaymentSection,
} from '../../sections/checkout'
import { useUser } from '../../context'
import { UPDATE_BRAND_CUSTOMER, UPDATE_CART_PAYMENT } from '../../graphql'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const CheckoutSection = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/register'))
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
   const { state } = usePayment()
   const { addToast } = useToasts()
   const { displayRazorpay } = useRazorPay()
   const authTabRef = React.useRef()
   const { brand, configOf } = useConfig()
   const [otpPageUrl, setOtpPageUrl] = React.useState('')
   const [isOverlayOpen, toggleOverlay] = React.useState(false)
   const [overlayMessage, setOverlayMessage] = React.useState('')
   const [selectedPaymentMethod, setSelectedPaymentMethod] =
      React.useState('stripe')
   const [submitting, setSubmitting] = React.useState(false)
   const [paymentMethods, setPaymentMethods] = React.useState([
      'stripe',
      'razorpay',
   ])

   const [updateBrandCustomer] = useMutation(UPDATE_BRAND_CUSTOMER, {
      skip: !user?.brandCustomerId,
      onError: error => {
         console.log('UPDATE BRAND CUSTOMER -> ERROR -> ', error)
      },
   })

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

   React.useEffect(() => {
      if (!loading && !isEmpty(cart)) {
         ;(async () => {
            const status = cart.paymentStatus
            const remark = cart.transactionRemark
            const next_action = cart.transactionRemark?.next_action

            try {
               if (status === 'PENDING') {
                  setOverlayMessage(messages['PENDING'])
               } else if (status === 'REQUIRES_ACTION' && !next_action?.type) {
                  toggleOverlay(true)
                  setOverlayMessage(messages['REQUIRES_ACTION'])
               } else if (status === 'REQUIRES_ACTION' && next_action?.type) {
                  toggleOverlay(true)
                  setOverlayMessage(messages['REQUIRES_ACTION_WITH_URL'])
                  let TAB_URL = ''
                  let remark = remark
                  if (next_action?.type === 'use_stripe_sdk') {
                     TAB_URL = next_action?.use_stripe_sdk?.stripe_js
                  } else {
                     TAB_URL = next_action?.redirect_to_url?.url
                  }
                  setOtpPageUrl(TAB_URL)
                  authTabRef.current = window.open(TAB_URL, 'payment_auth_page')
               } else if (
                  status === 'REQUIRES_PAYMENT_METHOD' &&
                  remark?.last_payment_error?.code
               ) {
                  toggleOverlay(false)
                  setOverlayMessage(messages['PENDING'])
                  addToast(remark?.last_payment_error?.message, {
                     appearance: 'error',
                  })
               } else if (status === 'SUCCEEDED') {
                  if (authTabRef.current) {
                     authTabRef.current.close()
                     if (!authTabRef.current.closed) {
                        window.open(
                           `/get-started/checkout?id=${cart.id}`,
                           'payment_auth_page'
                        )
                     }
                  }
                  setOverlayMessage(messages['SUCCEEDED'])
                  addToast(messages['SUCCEEDED'], { appearance: 'success' })
                  router.push(`/get-started/placing-order?id=${cart.id}`)
               } else if (status === 'PAYMENT_FAILED') {
                  toggleOverlay(false)
                  addToast(messages['PAYMENT_FAILED'], {
                     appearance: 'error',
                  })
               }
               setSelectedPaymentMethod(cart?.retryPaymentMethod)
            } catch (error) {
               console.log('on succeeded -> error -> ', error)
            }
         })()
      }
   }, [loading, cart])

   const [updateCustomerReferralRecord] = useMutation(
      QUERIES.MUTATIONS.CUSTOMER_REFERRAL.UPDATE,
      {
         onError: error => {
            console.log(error)
            addToast('Referral code not applied!', { appearance: 'error' })
         },
      }
   )
   const [updateCartPayment] = useMutation(UPDATE_CART_PAYMENT, {
      onError: error => {
         console.log(error)
         addToast('Something went wrong!', { appearance: 'error' })
      },
   })

   const [insertOccurenceCustomers] = useMutation(
      QUERIES.MUTATIONS.OCCURENCE.CUSTOMER.CREATE.MULTIPLE,
      {
         onCompleted: () => {
            if (isClient) {
               localStorage.removeItem('skipList')
            }
         },
         onError: error => console.log('SKIP CARTS -> ERROR -> ', error),
      }
   )

   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onCompleted: async ({ updateCart = {} }) => {
         try {
            ReactPixel.trackCustom('initiatePayment', {
               paymentMethodId: state.payment.selected.id,
               customerEmail: user?.platform_customer?.email,
               customerPhone: state?.profile?.phoneNumber,
               customerLastName: state?.profile?.lastName,
               customerFirstName: state?.profile?.firstName,
               cartId: updateCart?.id,
               itemTotal: updateCart?.itemTotal,
               discount: updateCart?.discount,
               deliveryPrice: updateCart?.deliveryPrice,
               tax: updateCart?.tax,
               totalPrice: updateCart?.totalPrice,
            })
            let referralCode = null
            if (
               Array.isArray(user?.customerReferrals) &&
               user?.customerReferrals.length > 0
            ) {
               const [referral] = user?.customerReferrals
               referralCode = referral?.referralCode
            }

            if (state.code.value && state.code.value !== referralCode) {
               await updateCustomerReferralRecord({
                  variables: {
                     brandId: brand.id,
                     keycloakId: user.keycloakId,
                     _set: {
                        referredByCode: state.code.value,
                     },
                  },
               })
            }
         } catch (error) {}

         try {
            if (
               updateCart?.paymentMethodId &&
               !user?.subscriptionPaymentMethodId
            ) {
               await updateBrandCustomer({
                  variables: {
                     id: user?.brandCustomerId,
                     _set: {
                        subscriptionPaymentMethodId:
                           updateCart?.paymentMethodId,
                     },
                  },
               })
            }
         } catch (error) {}

         try {
            if (isClient) {
               const skipList = localStorage.getItem('skipList')
               await insertOccurenceCustomers({
                  variables: {
                     objects: skipList.split(',').map(id => ({
                        isSkipped: true,
                        keycloakId: user.keycloakId,
                        subscriptionOccurenceId: Number(id),
                        brand_customerId: user.brandCustomerId,
                     })),
                  },
               })
            }
         } catch (error) {}
      },
      onError: error => {
         addToast(error.message, { appearance: 'error' })
      },
   })

   const [updatePlatformCustomer] = useMutation(
      QUERIES.UPDATE_PLATFORM_CUSTOMER,
      {
         onCompleted: () => {
            updateCart({
               variables: {
                  id: cart.id,
                  _inc: { paymentRetryAttempt: 1 },
                  _set: {
                     paymentMethodId: state.payment.selected.id,
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
      if (selectedPaymentMethod === 'stripe') {
         toggleOverlay(true)
      } else {
         setSubmitting(true)
      }
      updatePlatformCustomer({
         variables: {
            keycloakId: user.keycloakId,
            _set: { ...state.profile },
         },
      })
   }

   const PaymentMethodMenu = (
      <Menu>
         {paymentMethods.map(method => (
            <Menu.Item onClick={() => paymentMethodSelectionHandler(method)}>
               {method.toUpperCase()}
            </Menu.Item>
         ))}
      </Menu>
   )

   const isValid = () => {
      if (selectedPaymentMethod === 'stripe') {
         return (
            state.profile.firstName &&
            state.profile.lastName &&
            state.profile.phoneNumber &&
            state.payment.selected?.id &&
            state.code.isValid
         )
      } else {
         return (
            state.profile.firstName &&
            state.profile.lastName &&
            state.profile.phoneNumber
         )
      }
   }
   const onOverlayClose = () => {
      setOtpPageUrl('')
      setOverlayMessage('We are processing your payment.')
      toggleOverlay(false)
   }

   const theme = configOf('theme-color', 'Visual')
   const paymentMethodSelectionHandler = value => {
      setSelectedPaymentMethod(value)
      console.log('handler', cart)
      if (cart && cart?.id) {
         updateCart({
            variables: {
               id: cart?.id,
               _set: {
                  retryPaymentMethod: value,
               },
            },
         })
      }
   }
   const cancelCartPayment = () => {
      console.log('dismissed')
      if (cart && cart?.activeCartPaymentId) {
         updateCartPayment({
            variables: {
               id: cart?.activeCartPaymentId,
               _set: {
                  paymentStatus: 'CANCELLED',
               },
               _inc: {
                  cancelAttempt: 1,
               },
            },
         })
      }
      setSubmitting(false)
   }

   React.useEffect(() => {
      ;(async () => {
         console.log('inside useEffect', cart)
         if (
            cart &&
            cart?.activeCartPaymentId &&
            cart?.activeCartPayment?.transactionRemark
         ) {
            const {
               id: razorpay_order_id,
               notes,
               amount,
               status,
               receipt,
               currency,
            } = cart?.activeCartPayment?.transactionRemark
            if (cart?.activeCartPayment?.paymentStatus === 'CREATED') {
               const RAZORPAY_KEY_ID = get_env('RAZORPAY_KEY_ID')
               console.log('razorpay key id', RAZORPAY_KEY_ID)
               const options = {
                  key: RAZORPAY_KEY_ID,
                  amount: amount.toString(),
                  currency,
                  name: 'Test Hern',
                  order_id: razorpay_order_id,
                  notes,
                  prefill: {
                     name: `${state.profile.firstName} ${state.profile.lastName}`,
                     email: user?.platform_customer?.email || '',
                     contact: state.profile.phoneNumber,
                     method: 'upi',
                     vpa: 'abc@ybl',
                  },
                  theme: {
                     hide_topbar: true,
                  },
                  readonly: {
                     email: '1',
                     contact: '1',
                     name: '1',
                  },
                  config: {
                     display: {
                        blocks: {
                           banks: {
                              name: 'Google Pay',
                              instruments: [
                                 {
                                    method: 'upi',
                                    flows: ['collect'],
                                    apps: ['google_pay'],
                                 },
                              ],
                           },
                        },
                        sequence: ['block.banks'],
                        preferences: {
                           show_default_blocks: false,
                        },
                     },
                  },
                  modal: {
                     ondismiss: () => {
                        console.log('dismissed')
                        if (cart && cart?.activeCartPaymentId) {
                           updateCartPayment({
                              variables: {
                                 id: cart?.activeCartPaymentId,
                                 _set: {
                                    paymentStatus: 'CANCELLED',
                                 },
                                 _inc: {
                                    cancelAttempt: 1,
                                 },
                              },
                           })
                        }
                        setSubmitting(false)
                     },
                  },
                  handler: function (response) {
                     const responseData = {
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpaySignature: response.razorpay_signature,
                     }
                     if (response && response?.razorpay_payment_id) {
                        console.log('razorpay response', responseData)
                        setSubmitting(false)
                        toggleOverlay(true)
                     }
                  },
               }
               await displayRazorpay(options)
            }
         }
      })()
   }, [cart.activeCartPayment])

   if (loading) return <Loader inline />
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
            <Dropdown overlay={PaymentMethodMenu}>
               <a
                  className="ant-dropdown-link"
                  onClick={e => e.preventDefault()}
               >
                  {selectedPaymentMethod
                     ? selectedPaymentMethod.toUpperCase()
                     : 'Select Payment Method'}
               </a>
            </Dropdown>
            <Select
               defaultValue={selectedPaymentMethod}
               onChange={paymentMethodSelectionHandler}
            >
               {paymentMethods.map(method => (
                  <Select.Option value={method}>
                     {method.toUpperCase()}
                  </Select.Option>
               ))}
            </Select>
            {selectedPaymentMethod === 'stripe' && (
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
                     disabled={submitting || !Boolean(isValid())}
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
         right: 0;
         background-color: #fff;
         > button {
            ${tw`shadow-lg`}
         }
      }
   }
`
