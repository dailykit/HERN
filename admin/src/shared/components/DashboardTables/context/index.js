import React from 'react'
import { get_env } from '../../../utils'

export const DashboardTableContext = React.createContext()

//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}
console.log(process.env)
const initialState = {
   from: false,
   to: false,
   currency: currency[get_env('REACT_APP_CURRENCY')],
}
const reducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case 'FROM': {
         return {
            ...state,
            from: payload,
         }
      }
      case 'TO': {
         return {
            ...state,
            to: payload,
         }
      }
   }
}
export const DashboardTableProvider = ({ children }) => {
   const [dashboardTableState, dashboardTableDispatch] = React.useReducer(
      reducer,
      initialState
   )
   return (
      <DashboardTableContext.Provider
         value={{ dashboardTableState, dashboardTableDispatch }}
      >
         {children}
      </DashboardTableContext.Provider>
   )
}
