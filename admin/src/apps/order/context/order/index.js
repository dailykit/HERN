import React from 'react'
import { has, isEmpty } from 'lodash'
import { useMutation } from '@apollo/react-hooks'

import { MUTATIONS } from '../../graphql'

const Context = React.createContext()

const initialState = {
   cart: { id: null },
   filter: { tunnel: false },
   delivery_config: { orderId: null },
   current_view: 'SUMMARY',
   sachet: { sachet: null, product: { name: null } },
   current_product: { id: null },
   orders: {
      limit: 10,
      offset: 0,
      loading: true,
      where: {
         cart: { status: { _eq: 'ORDER_PENDING' }, order: {} },
         isArchived: { _eq: false },
         _or: [
            { isRejected: { _eq: false } },
            { isRejected: { _is_null: true } },
         ],
      },
   },
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      // Add Tab
      case 'SELECT_SACHET':
         return {
            ...state,
            current_view: 'SACHET_ITEM',
            sachet: { sachet: payload.sachet, product: payload.product },
         }
      case 'SELECT_PRODUCT':
         return {
            ...state,
            current_view: 'PRODUCT',
            current_product: payload,
         }
      case 'SWITCH_VIEW': {
         return {
            ...state,
            sachet: {
               product: { name: null },
               id: null,
            },

            current_view: payload.view,
         }
      }
      case 'DELIVERY_PANEL': {
         return {
            ...state,
            delivery_config: {
               ...state.delivery_config,
               ...payload,
            },
         }
      }
      case 'SET_FILTER': {
         const existingOr = state.orders.where._or
         const { _or: incomingOr = [], ...rest } = payload
         let result = []
         if (!isEmpty(incomingOr)) {
            let keys = incomingOr.map(node => Object.keys(node)).flat()
            result = existingOr.filter(
               node => !keys.some(key => has(node, key))
            )
         }
         return {
            ...state,
            orders: {
               loading: true,
               limit: 10,
               offset: 0,
               where: {
                  ...state.orders.where,
                  ...(!isEmpty(incomingOr) && {
                     _or: [...result, ...incomingOr],
                  }),
                  ...rest,
               },
            },
         }
      }
      case 'SET_PAGINATION': {
         return {
            ...state,
            orders: {
               ...state.orders,
               limit: payload.limit,
               offset: payload.offset,
            },
         }
      }
      case 'CLEAR_READY_BY_FILTER': {
         const { readyByTimestamp, ...rest } = state.orders.where
         return {
            ...state,
            orders: {
               loading: true,
               limit: 10,
               offset: 0,
               where: rest,
            },
         }
      }
      case 'CLEAR_FULFILLMENT_FILTER': {
         const { cart, ...restWhere } = state.orders.where
         const { order, ...restCart } = cart
         const { fulfillmentTimestamp, ...restOrder } = order
         return {
            ...state,
            orders: {
               loading: true,
               limit: 10,
               offset: 0,
               where: {
                  ...restWhere,
                  cart: { ...restCart, order: { ...restOrder } },
               },
            },
         }
      }
      case 'CLEAR_FULFILLMENT_TYPE_FILTER': {
         const { cart, ...restWhere } = state.orders.where
         const { order, ...restCart } = cart
         const { fulfillmentType, ...restOrder } = order
         return {
            ...state,
            orders: {
               loading: true,
               limit: 10,
               offset: 0,
               where: {
                  ...restWhere,
                  cart: { ...restCart, order: { ...restOrder } },
               },
            },
         }
      }
      case 'CLEAR_SOURCE_FILTER': {
         const { cart, ...rest } = state.orders.where
         const { source, ...restCart } = cart
         return {
            ...state,
            orders: {
               loading: true,
               limit: 10,
               offset: 0,
               where: {
                  ...rest,
                  cart: restCart,
               },
            },
         }
      }
      case 'CLEAR_AMOUNT_FILTER': {
         const { cart, ...restWhere } = state.orders.where
         const { order, ...restCart } = cart
         const { amountPaid, ...restOrder } = order
         return {
            ...state,
            orders: {
               loading: true,
               limit: 10,
               offset: 0,
               where: {
                  ...restWhere,
                  cart: { ...restCart, order: { ...restOrder } },
               },
            },
         }
      }
      case 'TOGGLE_FILTER_TUNNEL': {
         return {
            ...state,
            filter: payload,
         }
      }
      case 'SET_ORDERS_STATUS': {
         return {
            ...state,
            orders: { ...state.orders, loading: payload },
         }
      }
      case 'SET_CART_ID':
         return { ...state, cart: { id: payload } }
      default:
         return state
   }
}

export const OrderProvider = ({ children }) => {
   const [state, dispatch] = React.useReducer(reducers, initialState)

   return (
      <Context.Provider value={{ state, dispatch }}>
         {children}
      </Context.Provider>
   )
}

export const useOrder = () => {
   const { state, dispatch } = React.useContext(Context)
   const [update] = useMutation(MUTATIONS.ORDER.UPDATE)

   const selectSachet = React.useCallback(
      (sachet, product) => {
         dispatch({
            type: 'SELECT_SACHET',
            payload: { sachet, product },
         })
      },
      [dispatch]
   )

   const switchView = React.useCallback(
      view => {
         dispatch({
            type: 'SWITCH_VIEW',
            payload: {
               view,
            },
         })
      },
      [dispatch]
   )

   const updateOrder = ({ id, set, append }) => {
      update({
         variables: {
            id,
            ...(set && { _set: set }),
            ...(append && { _append: append }),
         },
      })
   }

   return {
      state,
      dispatch,
      switchView,
      updateOrder,
      selectSachet,
   }
}
