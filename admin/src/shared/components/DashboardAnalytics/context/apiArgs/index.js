import React from 'react'
import moment from 'moment'
import { get_env } from '../../../../utils'
export const AnalyticsApiArgsContext = React.createContext()

//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}

export const initialState = {
   from:
      localStorage.getItem('analyticsDateFrom') ||
      moment().format('YYYY-MM-DD'),
   to:
      localStorage.getItem('analyticsDateTo') ||
      moment().add(1, 'd').format('YYYY-MM-DD'),
   compare: {
      isCompare: false,
      data: null,
      isRun: false,
      from: moment().format('YYYY-MM-DD'),
      to: moment().add(1, 'd').format('YYYY-MM-DD'),
      compareResult: null,
      isSkip: true,
   },
   groupBy: ['year', 'month', 'week', 'day', 'hour'],
   brandShop: {
      brandId: undefined,
      shopTitle: false,
      brand: undefined,
   },
   currency: currency[get_env('REACT_APP_CURRENCY')],
}
export const reducer = (state = initialState, { type, payload }) => {
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
      case 'COMPARE': {
         return {
            ...state,
            compare: { ...state.compare, ...payload },
         }
      }
      case 'GROUPBY': {
         return {
            ...state,
            groupBy: payload,
         }
      }
      case 'BRANDSHOP': {
         return {
            ...state,
            brandShop: { ...state.brandShop, ...payload },
         }
      }
   }
}

export const AnalyticsApiArgsProvider = ({ children }) => {
   const [analyticsApiArgState, analyticsApiArgsDispatch] = React.useReducer(
      reducer,
      initialState
   )
   return (
      <AnalyticsApiArgsContext.Provider
         value={{ analyticsApiArgState, analyticsApiArgsDispatch }}
      >
         {children}
      </AnalyticsApiArgsContext.Provider>
   )
}
