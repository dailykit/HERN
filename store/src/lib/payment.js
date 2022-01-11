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

import {
   GET_CART_PAYMENT_INFO,
   UPDATE_CART_PAYMENT,
   CREATE_PRINT_JOB,
   UPDATE_CART,
} from '../graphql'
import { useUser, useCart } from '../context'
import { useConfig } from '../lib'
import {
   getRazorpayOptions,
   isClient,
   useRazorPay,
   usePaytm,
   useTerminalPay,
   getPaytmOptions,
   get_env,
} from '../utils'
import {
   CartPaymentComponent,
   PaymentProcessingModal,
   PrintProcessingModal,
} from '../components'
import { isEmpty, set } from 'lodash'

const PaymentContext = createContext()
const inititalState = {
   profileInfo: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
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
   printDetails: {
      isPrintInitiated: false,
      printStatus: 'not-started',
      message: '',
   },
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
      case 'UPDATE_INITIAL_STATE':
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
   const { brand, kioskDetails, settings } = useConfig()
   const { displayRazorpay } = useRazorPay()
   const { displayPaytm } = usePaytm()
   const {
      initiateTerminalPayment,
      byPassTerminalPayment,
      cancelTerminalPayment,
   } = useTerminalPay()
   const { cartState } = useCart()
   const { addToast } = useToasts()

   const BY_PASS_TERMINAL_PAYMENT = get_env('BY_PASS_TERMINAL_PAYMENT')
   const ALLOW_POSIST_PUSH_ORDER = get_env('ALLOW_POSIST_PUSH_ORDER')

   // subscription to get cart payment info
   const { error: hasCartPaymentError, loading: isCartPaymentLoading } =
      useSubscription(GET_CART_PAYMENT_INFO, {
         skip: !cartId && !isAuthenticated,
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
                  type: 'UPDATE_INITIAL_STATE',
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
      onError: error => {
         console.error(error)
         addToast('Something went wrong!', { appearance: 'error' })
      },
   })

   // mutation to update cart
   const [updateCart] = useMutation(UPDATE_CART, {
      onError: error => {
         console.error(error)
         addToast('Something went wrong!', { appearance: 'error' })
      },
   })

   // mutation to create print job
   const [createPrintJob, { loading: isPrinting, error: hasPrintError }] =
      useMutation(CREATE_PRINT_JOB, {
         onCompleted: ({ createPrintJob = {} }) => {
            if (createPrintJob.success) {
               dispatch({
                  type: 'UPDATE_INITIAL_STATE',
                  payload: {
                     printDetails: {
                        ...state.printDetails,
                        printStatus: 'success',
                     },
                  },
               })
            } else {
               dispatch({
                  type: 'UPDATE_INITIAL_STATE',
                  payload: {
                     printDetails: {
                        ...state.printDetails,
                        printStatus: 'failed',
                        message: createPrintJob.message,
                     },
                  },
               })
            }
         },
         onError: error => {
            console.error(error)
            addToast('Something went wrong!', { appearance: 'error' })
            dispatch({
               type: 'UPDATE_INITIAL_STATE',
               payload: {
                  printDetails: {
                     ...state.printDetails,
                     printStatus: 'failed',
                     message:
                        'Something went wrong while printing, please try again!',
                  },
               },
            })
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
         type: 'UPDATE_INITIAL_STATE',
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
   const onPaymentModalClose = (isFailed = false) => {
      setIsProcessingPayment(false)
      setIsPaymentInitiated(false)
      updateCartPayment({
         variables: {
            id: cartPayment?.id,
            _set: {
               ...(isFailed && { paymentStatus: 'FAILED' }),
               isResultShown: true,
            },
         },
      })
   }
   const normalModalClose = () => {
      setIsProcessingPayment(false)
      setIsPaymentInitiated(false)
   }

   const eventHandler = async response => {
      dispatch({
         type: 'UPDATE_INITIAL_STATE',
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
         type: 'UPDATE_INITIAL_STATE',
         payload: {
            paymentLifeCycleState: 'INITIALIZE',
         },
      })
   }

   const initializePrinting = async () => {
      normalModalClose()
      await dispatch({
         type: 'UPDATE_INITIAL_STATE',
         payload: {
            printDetails: {
               isPrintInitiated: true,
               printStatus: 'ongoing',
               message: '',
            },
         },
      })
      if (!isEmpty(settings) && isClient) {
         const path = settings['printing'].find(
            item => item?.identifier === 'KioskCustomerTokenTemplate'
         )?.value?.path?.value
         const DATA_HUB_HTTPS = get_env('DATA_HUB_HTTPS')
         const { origin } = new URL(DATA_HUB_HTTPS)
         const origin2 = 'https://testhern.dailykit.org'
         const templateOptions = encodeURI(
            JSON.stringify({
               path,
               format: 'raw',
               readVar: false,
            })
         )
         const templateVariable = encodeURI(
            JSON.stringify({
               cartId: cartState?.cart?.id,
            })
         )

         const url = `${origin2}/template/?template=${templateOptions}&data=${templateVariable}`

         await createPrintJob({
            variables: {
               contentType: 'raw_uri',
               printerId: kioskDetails?.printerId,
               source: 'Dailykit',
               title: `TOKEN-${cartPayment?.cartId}`,
               url,
            },
         })
      }
   }

   const createPosistOrder = async () => {
      await updateCart({
         variables: {
            id: cartPayment?.cartId,
            _set: {},
            _inc: {
               posistOrderPushAttempt: 1,
            },
         },
      })
   }

   const setPrintStatus = value => {
      dispatch({
         type: 'UPDATE_INITIAL_STATE',
         payload: {
            printDetails: {
               ...state.printDetails,
               printStatus: value,
            },
         },
      })
   }

   const resetPrintDetails = () => {
      dispatch({
         type: 'UPDATE_INITIAL_STATE',
         payload: {
            printDetails: {
               isPrintInitiated: false,
               printStatus: 'not-started',
               message: '',
            },
         },
      })
   }

   const closePrintModal = () => {
      dispatch({
         type: 'UPDATE_INITIAL_STATE',
         payload: {
            printDetails: {
               isPrintInitiated: false,
               printStatus: 'not-started',
               message: '',
            },
         },
      })
   }

   // useEffect(() => {
   //    if (cartId) {
   //       dispatch({
   //          type: 'UPDATE_INITIAL_STATE',
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
               phoneNumber: user.platform_customer?.phoneNumber || '',
            },
         })

         dispatch({
            type: 'SET_PAYMENT_INFO',
            payload: {
               selectedAvailablePaymentOption: {
                  ...state.selectedAvailablePaymentOption,
                  selectedPaymentMethodId:
                     user.platform_customer?.defaultPaymentMethodId || null,
               },
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
      if (
         !_isEmpty(cartState) &&
         cartState?.cart?.posistOrderStatus === 'CREATED'
      ) {
         initializePrinting()
      }
   }, [cartState?.cart?.posistOrderStatus])

   useEffect(() => {
      if (
         cartPayment?.paymentStatus === 'SUCCEEDED' &&
         ALLOW_POSIST_PUSH_ORDER === 'true'
      ) {
         console.log(
            'inside terminal payment useffect',
            cartPayment?.paymentStatus,
            ALLOW_POSIST_PUSH_ORDER
         )
         ;(async () => {
            await createPosistOrder()
         })()
      }
   }, [cartPayment?.paymentStatus])

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
         // !_isEmpty(cartPayment?.transactionRemark) &&
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
         } else if (
            cartPayment.availablePaymentOption.supportedPaymentOption
               .paymentOptionLabel === 'TERMINAL'
         ) {
            console.log(
               'inside payment provider useEffect 1 from terminal',
               cartPayment
            )
            if (cartPayment.paymentStatus === 'PENDING') {
               ;(async () => {
                  await initiateTerminalPayment(cartPayment)
               })()
            }
         }
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
            initializePrinting,
         }}
      >
         {isPaymentInitiated && (
            <PaymentProcessingModal
               isOpen={isProcessingPayment}
               cartPayment={cartPayment}
               closeModal={isFailed => onPaymentModalClose(isFailed)}
               normalModalClose={normalModalClose}
               cancelPayment={onCancelledHandler}
               isTestingByPass={BY_PASS_TERMINAL_PAYMENT === 'true'}
               byPassTerminalPayment={byPassTerminalPayment}
               cancelTerminalPayment={cancelTerminalPayment}
               codPaymentOptionId={cartState.kioskPaymentOption.cod}
               initializePrinting={initializePrinting}
            />
         )}
         {state.printDetails.isPrintInitiated && (
            <PrintProcessingModal
               printDetails={state.printDetails}
               setPrintStatus={setPrintStatus}
               resetPrintDetails={resetPrintDetails}
               closePrintModal={closePrintModal}
               initializePrinting={initializePrinting}
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
