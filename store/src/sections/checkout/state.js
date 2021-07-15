import React from 'react'

const initialState = {
   tunnel: {
      isVisible: false,
   },
   profile: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
   },
   payment: {
      selected: {},
   },
   code: {
      isValid: true,
      value: '',
   },
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'TOGGLE_TUNNEL':
         return {
            ...state,
            tunnel: payload,
         }
      case 'SET_PAYMENT_METHOD':
         return {
            ...state,
            payment: payload,
         }
      case 'SET_PROFILE':
         return { ...state, profile: { ...state.profile, ...payload } }
      case 'SET_CODE':
         return { ...state, code: payload }
      default:
         return state
   }
}

const PaymentContext = React.createContext()

export const PaymentProvider = ({ children }) => {
   const [state, dispatch] = React.useReducer(reducers, initialState)
   return (
      <PaymentContext.Provider value={{ state, dispatch }}>
         {children}
      </PaymentContext.Provider>
   )
}

export const usePayment = () => React.useContext(PaymentContext)
