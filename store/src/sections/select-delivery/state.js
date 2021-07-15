import React from 'react'

const initialState = {
   address: {
      selected: {},
      error: '',
      tunnel: false,
   },
   delivery: {
      selected: {},
   },
   delivery_date: {
      selected: {},
   },
   skip_list: [],
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'TOGGLE_TUNNEL':
         return {
            ...state,
            address: {
               ...state.address,
               tunnel: payload,
            },
         }
      case 'SET_ADDRESS_ERROR':
         return {
            ...state,
            address: {
               ...state.address,
               error: payload,
            },
         }
      case 'SET_ADDRESS':
         return {
            ...state,
            address: {
               ...state.address,
               selected: payload,
            },
            delivery: {
               selected: {},
            },
            delivery_date: {
               selected: {},
            },
         }
      case 'SET_DAY':
         return {
            ...state,
            delivery: {
               selected: payload,
            },
            delivery_date: {
               selected: {},
            },
         }
      case 'SET_DATE':
         return {
            ...state,
            delivery_date: {
               selected: payload,
            },
         }
      case 'SET_SKIP_LIST':
         return {
            ...state,
            skip_list: payload,
         }
      case 'RESET':
         return {
            ...state,
            address: {
               selected: {},
               error: '',
               tunnel: false,
            },
            delivery: {
               selected: {},
            },
            delivery_date: {
               selected: {},
            },
            skip_list: [],
         }
      default:
         return state
   }
}

const DeliveryContext = React.createContext()

export const DeliveryProvider = ({ children }) => {
   const [state, dispatch] = React.useReducer(reducers, initialState)
   return (
      <DeliveryContext.Provider value={{ state, dispatch }}>
         {children}
      </DeliveryContext.Provider>
   )
}

export const useDelivery = () => React.useContext(DeliveryContext)
