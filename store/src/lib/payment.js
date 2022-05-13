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
import { useUser, useCart, useTranslation } from '../context'
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

const PaymentContext = createContext()
const initialState = {
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
   onPaymentSuccessCallback: () => {},
   onPaymentCancelCallback: () => {},
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
   const [state, dispatch] = useReducer(reducer, initialState)
   const [isPaymentLoading, setIsPaymentLoading] = useState(true)
   const [cartId, setCartId] = useState(null)
   const [cartPayment, setCartPayment] = useState(null)
   const [cartPaymentId, setCartPaymentId] = useState(null)
   const [isProcessingPayment, setIsProcessingPayment] = useState(false)
   const [isPaymentInitiated, setIsPaymentInitiated] = useState(false)
   const { user, isAuthenticated, isLoading } = useUser()
   const { kioskDetails, settings, selectedOrderTab, configOf } = useConfig()
   const { displayRazorpay } = useRazorPay()
   const { displayPaytm } = usePaytm()
   const {
      initiateTerminalPayment,
      byPassTerminalPayment,
      cancelTerminalPayment,
   } = useTerminalPay()
   const { cartState } = useCart()
   const { addToast } = useToasts()
   const { t } = useTranslation()

   const BY_PASS_TERMINAL_PAYMENT = get_env('BY_PASS_TERMINAL_PAYMENT')
   const ALLOW_POSIST_PUSH_ORDER = get_env('ALLOW_POSIST_PUSH_ORDER')
   const brand = configOf('Brand Info', 'brand')
   const theme = configOf('theme-color', 'Visual')?.themeColor

   // subscription to get cart payment info
   const {
      data: { cartPayments: cartPaymentsFromQuery = [] } = {},
      error: hasCartPaymentError,
      loading: isCartPaymentLoading,
   } = useSubscription(GET_CART_PAYMENT_INFO, {
      skip: !cartId && !cartPaymentId, // When cartId is not available use cartPaymentId to get the cartPayments
      fetchPolicy: 'no-cache',
      variables: {
         where: {
            isResultShown: {
               _eq: false,
            },
            ...(cartId
               ? {
                    cartId: {
                       _eq: cartId,
                    },
                 }
               : {
                    id: {
                       _eq: cartPaymentId,
                    },
                 }),
         },
      },
   })

   // mutation to update cart payment
   const [updateCartPayment] = useMutation(UPDATE_CART_PAYMENT, {
      onError: error => {
         console.error(error)
         addToast(`${t('Something went wrong')}`, { appearance: 'error' })
      },
   })

   // mutation to update cart
   const [updateCart] = useMutation(UPDATE_CART, {
      onError: error => {
         console.error(error)
         addToast(`${t('Something went wrong')}`, { appearance: 'error' })
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
            addToast(`${t('Something went wrong')}`, { appearance: 'error' })
            dispatch({
               type: 'UPDATE_INITIAL_STATE',
               payload: {
                  printDetails: {
                     ...state.printDetails,
                     printStatus: 'failed',
                     message: `${t(
                        'Something went wrong while printing please try again!'
                     )}`,
                  },
               },
            })
         },
      })

   //<---------  methods to set/update reducer state  --------->

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
                  comment:
                     'Cancelled by user using back button or dismiss modal',
               },
               _inc: {
                  cancelAttempt: 1,
               },
            },
         })
      }
      // Calling onPaymentCancel Callback which is passed in PaymentOptionRenderer Component
      state.onPaymentCancelCallback()
   }
   const onPaymentModalClose = async () => {
      await updateCartPayment({
         variables: {
            id: cartPayment?.id,
            _set: {
               ...(!['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(
                  cartPayment?.paymentStatus
               ) && {
                  paymentStatus: 'FAILED',
               }),
               isResultShown: true,
            },
         },
      })
   }

   const eventHandler = async response => {
      dispatch({
         type: 'UPDATE_INITIAL_STATE',
         payload: {
            isPaymentProcessing: false,
            isPaymentInitiated: false,
            paymentLifeCycleState: '',
         },
      })
      const url = isClient ? get_env('BASE_BRAND_URL') : ''
      const { data } = await axios.post(
         `${url}/server/api/payment/handle-payment-webhook`,
         response
      )
      console.log('result', data)
   }

   const initializePayment = (
      requiredCartId,
      cartPaymentId,
      paymentLifeCycleState = 'INITIALIZE'
   ) => {
      if (requiredCartId) {
         setCartId(requiredCartId)
      } else if (cartPaymentId) {
         setCartPaymentId(cartPaymentId)
      }
      setIsPaymentInitiated(true)
      setIsProcessingPayment(true)
      dispatch({
         type: 'UPDATE_INITIAL_STATE',
         payload: {
            paymentLifeCycleState,
         },
      })
   }

   const initializePrinting = async () => {
      console.log('inside  print method....')
      onPaymentModalClose()
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
      if (!_isEmpty(settings) && isClient) {
         const path =
            settings['printing']?.['KioskCustomerTokenTemplate']?.path?.value
         const DATA_HUB_HTTPS = get_env('DATA_HUB_HTTPS')
         const { origin } = new URL(DATA_HUB_HTTPS)
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
               paymentMode:
                  cartPayment?.availablePaymentOption?.supportedPaymentOption
                     ?.paymentOptionLabel === 'TERMINAL'
                     ? 'card'
                     : 'counter',
               orderType: selectedOrderTab?.orderFulfillmentTypeLabel || 'N/A',
            })
         )
         const url = `${origin}/template/?template=${templateOptions}&data=${templateVariable}`
         console.log('url.....', url)

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
      // await dispatch({
      //    type: 'UPDATE_INITIAL_STATE',
      //    payload: {
      //       printDetails: {
      //          ...state.printDetails,
      //          isPrintInitiated: true,
      //          printStatus: 'success',
      //       },
      //    },
      // })
   }

   const createPosistOrder = async () => {
      console.log('creating posist order....')
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

   const resetPaymentProviderStates = async () => {
      await dispatch({
         type: 'UPDATE_INITIAL_STATE',
         payload: {
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
         },
      })
      setCartId(null)
      setCartPayment(null)
      setIsPaymentLoading(true)
      setIsPaymentInitiated(false)
      setIsProcessingPayment(false)
   }

   //<---------  methods to set/update reducer state  --------->

   // setting cartPayment in state
   useEffect(() => {
      console.log('useEffect for setting cartPayment')
      if (!cartId && !cartPaymentId) {
         setCartId(cartState?.cart?.id || null)
      }
      if (!_isEmpty(cartPaymentsFromQuery)) {
         setCartPayment(cartPaymentsFromQuery[0])
         setCartId(cartPaymentsFromQuery[0].cartId)
         setIsPaymentInitiated(true)
         setIsProcessingPayment(true)
      } else {
         setCartPayment(null)
         setIsPaymentInitiated(false)
         setIsProcessingPayment(false)
      }
   }, [cartPaymentsFromQuery])

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

   // initiating payment flow (this is required after coming back from paytm payment page)
   useEffect(() => {
      if (
         !_isEmpty(router.query) &&
         _has(router.query, 'payment') &&
         _has(router.query, 'id') &&
         router.query.id
      ) {
         setIsPaymentInitiated(true)
         setIsProcessingPayment(true)
         setCartId(router.query.id)
      }
   }, [router.query])

   // initiate printing flow when posistOrderStatus is CREATED
   useEffect(() => {
      if (
         !_isEmpty(cartState) &&
         cartState?.cart?.posistOrderStatus === 'CREATED'
      ) {
         console.log(
            `initializing printing with cartId: ${cartState?.cart?.id}`
         )
         initializePrinting()
      }
   }, [cartState?.cart?.posistOrderStatus])

   //creating posist order (just increasing posistOrderRetryAttempt) when cartPayment is successful
   // and posistOrderPush is allowed
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
      if (cartPayment?.paymentStatus === 'SUCCEEDED') {
         // Calling onPaymentCancel Callback which is passed in PaymentOptionRenderer Component
         state.onPaymentSuccessCallback()
      }
   }, [cartPayment?.paymentStatus])

   // useEffect which checks the payment company and payment related status and does required actions
   useEffect(() => {
      if (
         isPaymentInitiated &&
         !_isEmpty(cartPayment) &&
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

            if (
               cartPayment.paymentStatus === 'CREATED' &&
               !_isEmpty(cartPayment?.stripeInvoiceId)
            ) {
               ;(async () => {
                  const options = getRazorpayOptions({
                     orderDetails: cartPayment.transactionRemark,
                     brand,
                     theme,
                     paymentInfo: cartPayment.availablePaymentOption,
                     profileInfo: cartPayment.cart.customerInfo,
                     ondismissHandler: () => onCancelledHandler(),
                     eventHandler,
                  })
                  console.log('options', options)
                  if (state.paymentLifeCycleState === 'INITIALIZE') {
                     await displayRazorpay(options)
                  }
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
            resetPaymentProviderStates,
         }}
      >
         {isPaymentInitiated && (
            <PaymentProcessingModal
               isOpen={isProcessingPayment}
               cartPayment={cartPayment}
               cartId={cartState?.cart?.id}
               closeModal={onPaymentModalClose}
               normalModalClose={resetPaymentProviderStates}
               cancelPayment={onCancelledHandler}
               isTestingByPass={BY_PASS_TERMINAL_PAYMENT === 'true'}
               byPassTerminalPayment={byPassTerminalPayment}
               cancelTerminalPayment={cancelTerminalPayment}
               PaymentOptions={cartState.kioskPaymentOptions}
               initializePrinting={initializePrinting}
               resetPaymentProviderStates={resetPaymentProviderStates}
               setIsProcessingPayment={setIsProcessingPayment}
               setIsPaymentInitiated={setIsPaymentInitiated}
            />
         )}
         {state.printDetails.isPrintInitiated && (
            <PrintProcessingModal
               printDetails={state.printDetails}
               setPrintStatus={setPrintStatus}
               resetPaymentProviderStates={resetPaymentProviderStates}
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
      resetPaymentProviderStates,
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
      resetPaymentProviderStates,
   }
}
