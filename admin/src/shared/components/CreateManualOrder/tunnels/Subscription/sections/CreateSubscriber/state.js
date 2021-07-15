import React from 'react'

const Context = React.createContext()

const initial = {
   plan: { selected: null },
   serving: { selected: null },
   itemCount: { selected: null },
   address: { selected: null },
   deliveryDay: { selected: null },
   deliveryDate: { selected: null },
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_PLAN':
         return { ...state, plan: { selected: payload } }
      case 'SET_SERVING':
         return { ...state, serving: { selected: payload } }
      case 'SET_ITEM_COUNT':
         return { ...state, itemCount: { selected: payload } }
      case 'SET_ADDRESS':
         return { ...state, address: { selected: payload } }
      case 'SET_DELIVERY_DAY':
         return { ...state, deliveryDay: { selected: payload } }
      case 'SET_DELIVERY_DATE':
         return { ...state, deliveryDate: { selected: payload } }
      default:
         return state
   }
}

export const SubProvider = ({ children }) => {
   const [state, dispatch] = React.useReducer(reducers, initial)
   return (
      <Context.Provider value={{ ...state, dispatch }}>
         {children}
      </Context.Provider>
   )
}

export const useSub = () => React.useContext(Context)
