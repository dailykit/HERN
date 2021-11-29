import { createContext, useEffect, useContext, useReducer } from 'react'
import { Loader } from '../components'
import { useUser } from '../context'

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
   paymentSuccess: false,
   paymentFailure: false,
   paymentComplete: false,
   paymentCancelled: false,
   paymentError: null,
   paymentErrorMessage: null,
   paymentErrorDescription: null,
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
            paymentInfo: action.payload,
         }
      default:
         return state
   }
}

export const PaymentProvider = ({ children }) => {
   const [state, dispatch] = useReducer(reducer, inititalState)
   const { user, isAuthenticated, isLoading } = useUser()
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

   useEffect(() => {
      if (isAuthenticated && user && user?.keycloakId && !isLoading) {
         setProfileInfo({
            firstName: user?.platform_customer?.firstName || '',
            lastName: user?.platform_customer?.lastName || '',
            email: user?.platform_customer?.email || '',
            phone: user?.platform_customer?.phoneNumber || '',
         })
      }
   }, [user])

   return (
      <PaymentContext.Provider
         value={{
            state,
            paymentLoading: isLoading,
            setPaymentInfo,
            setProfileInfo,
         }}
      >
         {children}
      </PaymentContext.Provider>
   )
}

export const usePayment = () => {
   const { state, paymentLoading, setPaymentInfo, setProfileInfo } =
      useContext(PaymentContext)
   return {
      profileInfo: state.profileInfo,
      paymentInfo: state.paymentInfo,
      setPaymentInfo: setPaymentInfo,
      setProfileInfo: setProfileInfo,
      isPaymentLoading: paymentLoading,
   }
}
