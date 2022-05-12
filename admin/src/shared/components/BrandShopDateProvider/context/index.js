import React from 'react'
import moment from 'moment'
import { get_env } from '../../../utils'
export const BrandShopDateContext = React.createContext()

//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}

//initial State
export const initialState = {
   from: moment().startOf('y').format('YYYY-MM-DD'),
   to: moment().format('YYYY-MM-DD'),
   compare: {
      isCompare: false,
      data: null,
      isRun: false,
      from: moment().format('YYYY-MM-DD'),
      to: moment().add(1, 'd').format('YYYY-MM-DD'),
      compareResult: null,
      isSkip: true,
   },
   groupBy: ['year', 'month', 'week'],
   brandShop: {
      brandId: undefined,
      shopTitle: false,
      brand: undefined,
      locationId: null,
   },
   currency: currency[get_env('REACT_APP_CURRENCY')],
}

//reducer
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

export const BrandShopDateProvider = ({ children }) => {
   const [brandShopDateState, brandShopDateDispatch] = React.useReducer(
      reducer,
      initialState
   )
   return (
      <BrandShopDateContext.Provider
         value={{ brandShopDateState, brandShopDateDispatch }}
      >
         {children}
      </BrandShopDateContext.Provider>
   )
}
