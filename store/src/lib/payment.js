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
import { useRouter } from 'next/router'

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
import { CartPaymentComponent, PaymentProcessingModal } from '../components'
import { set } from 'lodash'

const PaymentContext = createContext()
const inititalState = {
   profileInfo: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
   },
   paymentInfo: {
      tunnel: {
         isVisible: false,
      },
      selectedAvailablePaymentOption: null,
   },
   paymentLoading: false,
   paymentLifeCycleState: '',
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
   const router = useRouter()
   const [state, dispatch] = useReducer(reducer, inititalState)
   const [isPaymentLoading, setIsPaymentLoading] = useState(true)
   const [cartId, setCartId] = useState(null)
   const [cartPayment, setCartPayment] = useState(null)
   const [isProcessingPayment, setIsProcessingPayment] = useState(false)
   const [isPaymentInitiated, setIsPaymentInitiated] = useState(false)
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

               dispatch({
                  type: 'UPDATE_PAYMENT_STATE',
                  payload: {
                     paymentLifeCycleState:
                        requiredCartPayment?.paymentStatus || 'PENDING',
                  },
               })
               console.log(
                  '2nd cartPayment from payment----->>>>',
                  requiredCartPayments
               )
               setCartPayment(requiredCartPayment)
            }
         },
      })

   // mutation to update cart payment
   const [updateCartPayment] = useMutation(UPDATE_CART_PAYMENT, {
      // onCompleted: () => {
      //    addToast('Payment dismissed', {
      //       appearance: 'error',
      //    })
      // },
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
   }
   const onPaymentModalClose = () => {
      setIsProcessingPayment(false)
      setIsPaymentInitiated(false)
      updateCartPayment({
         variables: {
            id: cartPayment?.id,
            _set: {
               isResultShown: true,
            },
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
      setIsPaymentInitiated(true)
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
      if (!_isEmpty(router.query) && _has(router.query, 'payment')) {
         setIsPaymentInitiated(true)
      }
   }, [router.query])

   useEffect(() => {
      console.log(
         'useEffect=>',
         !_isEmpty(cartPayment),
         !_isEmpty(cartPayment?.transactionRemark),
         _has(
            cartPayment,
            'availablePaymentOption.supportedPaymentOption.supportedPaymentCompany.label'
         ),
         !isCartPaymentLoading
      )
      if (
         isPaymentInitiated &&
         !_isEmpty(cartPayment) &&
         !_isEmpty(cartPayment?.transactionRemark) &&
         _has(
            cartPayment,
            'availablePaymentOption.supportedPaymentOption.supportedPaymentCompany.label'
         ) &&
         !isCartPaymentLoading
      ) {
         console.log('inside payment provider useEffect')
         setIsProcessingPayment(true)
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
            if (['PENDING', 'PROCESSING'].includes(cartPayment.paymentStatus)) {
               if (isClient && cartPayment.actionRequired) {
                  const paymentUrl = cartPayment.actionUrl
                  window.location.href = paymentUrl
               }
            }
         }
         // else if (
         //    cartPayment.availablePaymentOption.supportedPaymentOption
         //       .supportedPaymentCompany.label === 'stripe'
         // ) {
         //    setIsProcessingPayment(true)
         // }
      }
   }, [
      cartPayment?.paymentStatus,
      cartPayment?.transactionRemark,
      cartPayment?.transactionId,
      cartPayment?.stripeInvoiceId,
      cartPayment?.actionUrl,
      isCartPaymentLoading,
   ])

   return (
      <PaymentContext.Provider
         value={{
            state,
            paymentLoading: isPaymentLoading,
            setPaymentInfo,
            setProfileInfo,
            setIsProcessingPayment,
            setIsPaymentInitiated,
            updatePaymentState,
            initializePayment,
            isProcessingPayment,
         }}
      >
         {isPaymentInitiated && (
            <PaymentProcessingModal
               isOpen={isProcessingPayment}
               cartId={cartPayment?.cartId}
               status={cartPayment?.paymentStatus}
               actionUrl={cartPayment?.actionUrl}
               actionRequired={cartPayment?.actionRequired}
               closeModal={onPaymentModalClose}
               cancelPayment={onCancelledHandler}
            />
         )}

         {children}
      </PaymentContext.Provider>
   )
}

export const usePayment = () => {
   const {
      state,
      paymentLoading,
      setPaymentInfo,
      setProfileInfo,
      setIsProcessingPayment,
      setIsPaymentInitiated,
      updatePaymentState,
      initializePayment,
      isProcessingPayment,
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
      setIsProcessingPayment,
      setIsPaymentInitiated,
      updatePaymentState,
      initializePayment,
      isProcessingPayment,
   }
}
