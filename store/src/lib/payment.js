import {
   createContext,
   useState,
   useEffect,
   useContext,
   useReducer,
} from 'react'
import _has from 'lodash/has'
import _isEmpty from 'lodash/isEmpty'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'
import axios from 'axios'

import { GET_CART_PAYMENT_INFO, UPDATE_CART_PAYMENT } from '../graphql'
import { useUser } from '../context'
import { useConfig } from '../lib'
import {
   getRazorpayOptions,
   isClient,
   useRazorPay,
   usePaytm,
   getPaytmOptions,
   get_env,
} from '../utils'
import { CartPaymentComponent } from '../components'

const PaymentContext = createContext()
const inititalState = {
   profileInfo: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
   },
   paymentInfo: null,
   paymentLoading: false,
   paymentLifeCycleState: '',
   isPaymentProcessing: false,
   isPaymentSuccess: false,
   isPaymentFailure: false,
   isPaymentDismissed: false,
}

const reducer = (state, action) => {
   switch (action.type) {
      case 'SET_PROFILE_INFO':
         return {
            ...state,
            profileInfo: action.payload,
         }
      case 'SET_PAYMENT_INFO':
         return {
            ...state,
            paymentInfo: {
               ...state.paymentInfo,
               ...action.payload,
            },
         }
      case 'UPDATE_PAYMENT_STATE':
         return {
            ...state,
            ...action.payload,
         }
      default:
         return state
   }
}

export const PaymentProvider = ({ children }) => {
   const [state, dispatch] = useReducer(reducer, inititalState)
   const [isPaymentLoading, setIsPaymentLoading] = useState(true)
   const [cartId, setCartId] = useState(null)
   const [cartPayment, setCartPayment] = useState(null)
   const { user, isAuthenticated, isLoading } = useUser()
   const { brand } = useConfig()
   const { displayRazorpay } = useRazorPay()
   const { displayPaytm } = usePaytm()
   const { addToast } = useToasts()

   // subscription to get cart payment info
   const { error: hasCartPaymentError, loading: isCartPaymentLoading } =
      useSubscription(GET_CART_PAYMENT_INFO, {
         variables: {
            where: {
               _and: [
                  {
                     isResultShown: {
                        _eq: false,
                     },
                  },
                  {
                     _or: [
                        cartId
                           ? {
                                cartId: {
                                   _eq: cartId,
                                },
                             }
                           : {},
                        {
                           cart: {
                              brandId: {
                                 _eq: brand?.id,
                              },
                              customerKeycloakId: {
                                 _eq: user?.keycloakId,
                              },
                           },
                        },
                     ],
                  },
               ],
            },
         },
         onSubscriptionData: ({
            subscriptionData: {
               data: { cartPayments: requiredCartPayments = [] } = {},
            } = {},
         } = {}) => {
            console.log(
               'cartPayment from payment----->>>>',
               requiredCartPayments
            )
            if (!_isEmpty(requiredCartPayments)) {
               const [requiredCartPayment] = requiredCartPayments
               dispatch({
                  type: 'SET_PAYMENT_INFO',
                  payload: {
                     selectedAvailablePaymentOption:
                        requiredCartPayment.availablePaymentOption,
                  },
               })
               switch (requiredCartPayment.paymentStatus) {
                  case 'SUCCEEDED':
                     dispatch({
                        type: 'UPDATE_PAYMENT_STATE',
                        payload: {
                           paymentLifeCycleState: 'INITIALIZE',
                        },
                     })
                  case 'CANCELLED':
                     dispatch({
                        type: 'UPDATE_PAYMENT_STATE',
                        payload: {
                           paymentLifeCycleState: 'CANCELLED',
                        },
                     })
                  case 'FAILED':
                     dispatch({
                        type: 'UPDATE_PAYMENT_STATE',
                        payload: {
                           paymentLifeCycleState: 'FAILED',
                        },
                     })
               }

               setCartPayment(requiredCartPayment)
            }
         },
      })

   // mutation to update cart payment
   const [updateCartPayment] = useMutation(UPDATE_CART_PAYMENT, {
      onCompleted: () => {
         addToast('Payment dismissed', {
            appearance: 'error',
         })
      },
      onError: error => {
         console.error(error)
         addToast('Something went wrong!', { appearance: 'error' })
      },
   })

   // methods to set/update reducer state
   const setProfileInfo = profileInfo => {
      dispatch({
         type: 'SET_PROFILE_INFO',
         payload: profileInfo,
      })
   }

   const setPaymentInfo = paymentInfo => {
      dispatch({
         type: 'SET_PAYMENT_INFO',
         payload: paymentInfo,
      })
   }

   const updatePaymentState = state => {
      dispatch({
         type: 'UPDATE_PAYMENT_STATE',
         payload: state,
      })
   }

   const onCancelledHandler = () => {
      if (!_isEmpty(cartPayment)) {
         updateCartPayment({
            variables: {
               id: cartPayment?.id,
               _set: {
                  paymentStatus: 'CANCELLED',
               },
               _inc: {
                  cancelAttempt: 1,
               },
            },
         })
      }
      dispatch({
         type: 'UPDATE_PAYMENT_STATE',
         payload: {
            isPaymentDismissed: true,
            isPaymentProcessing: false,
         },
      })
   }

   const eventHandler = async response => {
      dispatch({
         type: 'UPDATE_PAYMENT_STATE',
         payload: {
            isPaymentProcessing: false,
         },
      })
      const url = isClient ? window.location.origin : ''
      const { data } = await axios.post(
         `${url}/server/api/payment/handle-payment-webhook`,
         response
      )
      console.log('result', data)
   }

   const initializePayment = requiredCartId => {
      setCartId(requiredCartId)
      dispatch({
         type: 'UPDATE_PAYMENT_STATE',
         payload: {
            paymentLifeCycleState: 'INITIALIZE',
         },
      })
   }

   // useEffect(() => {
   //    if (cartId) {
   //       dispatch({
   //          type: 'UPDATE_PAYMENT_STATE',
   //          payload: {
   //             paymentLifeCycleState: 'INITIALIZE',
   //          },
   //       })
   //    }
   // }, [cartId])

   // setting user related info in payment provider context
   useEffect(() => {
      if (
         isAuthenticated &&
         !_isEmpty(user) &&
         _has(user, 'platform_customer') &&
         !isLoading
      ) {
         dispatch({
            type: 'SET_PROFILE_INFO',
            payload: {
               firstName: user.platform_customer?.firstName || '',
               lastName: user.platform_customer?.lastName || '',
               email: user.platform_customer?.email || '',
               phone: user.platform_customer?.phoneNumber || '',
            },
         })

         dispatch({
            type: 'SET_PAYMENT_INFO',
            payload: {
               paymentMethods: user.platform_customer?.paymentMethods,
            },
         })
         setIsPaymentLoading(false)
      }
   }, [user])

   useEffect(() => {
      console.log(
         'inside top of useEffect',
         !_isEmpty(cartPayment),
         !_isEmpty(cartPayment?.transactionRemark),
         _has(
            cartPayment,
            'availablePaymentOption.supportedPaymentOption.supportedPaymentCompany.label'
         ),
         !isCartPaymentLoading
      )
      if (
         !_isEmpty(cartPayment) &&
         !_isEmpty(cartPayment.transactionRemark) &&
         _has(
            cartPayment,
            'availablePaymentOption.supportedPaymentOption.supportedPaymentCompany.label'
         ) &&
         !isCartPaymentLoading
      ) {
         console.log('inside payment provider useEffect')
         // right now only handle the razorpay method.
         if (
            cartPayment.availablePaymentOption.supportedPaymentOption
               .supportedPaymentCompany.label === 'razorpay'
         ) {
            console.log('inside payment provider useEffect 1', cartPayment)

            if (cartPayment.paymentStatus === 'CREATED') {
               ;(async () => {
                  const options = getRazorpayOptions({
                     orderDetails: cartPayment.transactionRemark,
                     paymentInfo: state.paymentInfo,
                     profileInfo: state.profileInfo,
                     ondismissHandler: () => onCancelledHandler(),
                     eventHandler,
                  })
                  console.log('options', options)
                  await displayRazorpay(options)
               })()
            }
         } else if (
            cartPayment.availablePaymentOption.supportedPaymentOption
               .supportedPaymentCompany.label === 'paytm'
         ) {
            console.log('inside payment provider useEffect 1', cartPayment)

            if (cartPayment.paymentStatus === 'PENDING') {
               const PAYTM_MERCHANT_ID =
                  process.env.NEXT_PUBLIC_PAYTM_MERCHANT_ID ||
                  get_env('PAYTM_MERCHANT_ID')
               const PAYTM_ORDER_ID = cartPayment?.id
               const PAYTM_TXN_TOKEN = cartPayment?.transactionId
               if (PAYTM_ORDER_ID && PAYTM_TXN_TOKEN && isClient) {
                  const paymentUrl = `https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage?mid=${PAYTM_MERCHANT_ID}&orderId=${PAYTM_ORDER_ID}&txnToken=${PAYTM_TXN_TOKEN}`
                  window.location.href = paymentUrl
               }
            }
         }
      }
   }, [cartPayment?.paymentStatus, cartPayment?.transactionRemark])

   return (
      <PaymentContext.Provider
         value={{
            state,
            paymentLoading: isPaymentLoading,
            setPaymentInfo,
            setProfileInfo,
            updatePaymentState,
            initializePayment,
         }}
      >
         {state.paymentLifeCycleState === 'INITIALIZE' ? (
            <CartPaymentComponent cartId={cartId} />
         ) : (
            children
         )}
      </PaymentContext.Provider>
   )
}

export const usePayment = () => {
   const {
      state,
      paymentLoading,
      setPaymentInfo,
      setProfileInfo,
      updatePaymentState,
      initializePayment,
   } = useContext(PaymentContext)
   return {
      isPaymentLoading: paymentLoading,
      isPaymentProcessing: state.isPaymentProcessing,
      isPaymentSuccess: state.isPaymentSuccess,
      isPaymentDismissed: state.isPaymentDismissed,
      paymentLifeCycleState: state.paymentLifeCycleState,
      profileInfo: state.profileInfo,
      paymentInfo: state.paymentInfo,
      setPaymentInfo: setPaymentInfo,
      setProfileInfo: setProfileInfo,
      updatePaymentState,
      initializePayment,
   }
}
