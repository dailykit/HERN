import React from 'react'

import { ListItem } from './styled'
import { useOrder } from '../../context'
import { currencyFmt } from '../../../../shared/utils'
import { useWindowSize } from '../../../../shared/hooks'

export const MetricItem = ({
   title,
   count = 0,
   variant,
   amount = 0,
   average = 0,
   closeOrderSummaryTunnel,
}) => {
   const { state, dispatch } = useOrder()
   const { width, height } = useWindowSize()

   const changeStatus = () => {
      const isPortrait = height > width
      dispatch({ type: 'SET_ORDERS_STATUS', payload: true })
      dispatch({
         type: 'SET_FILTER',
         payload: {
            cart: {
               ...state.orders.where?.cart,
               status: {
                  ...(!['ORDER_ALL', 'ORDER_REJECTED_OR_CANCELLED'].includes(
                     variant
                  ) && {
                     _eq: variant,
                  }),
               },
            },
            ...(variant === 'ORDER_REJECTED_OR_CANCELLED'
               ? { _or: [{ isRejected: { _eq: true } }] }
               : {
                    _or: [
                       { isRejected: { _eq: false } },
                       { isRejected: { _is_null: true } },
                    ],
                 }),
            ...(variant === 'ORDER_ALL' && {
               _or: [
                  { isRejected: { _eq: false } },
                  { isRejected: { _eq: true } },
                  { isRejected: { _is_null: true } },
               ],
            }),
         },
      })
      dispatch({
         type: 'SET_PAGINATION',
         payload: { limit: 10, offset: 0 },
      })
      window.scrollTo({
         top: 0,
         behavior: 'smooth',
      })
      window.history.pushState(
         '',
         document.title,
         window.location.pathname + window.location.search
      )
      if (isPortrait) closeOrderSummaryTunnel(1)
   }
   return (
      <ListItem
         variant={variant}
         onClick={() => changeStatus()}
         className={
            (Object.keys(state.orders.where?.cart?.status || {}).length === 0 &&
               variant === 'ORDER_ALL') ||
            variant === state.orders.where?.cart?.status?._eq
               ? 'active'
               : ''
         }
      >
         <header>
            <h2>{title}</h2>
            <span title="Average">
               {currencyFmt(Number(average?.toFixed(2)) || 0)}
            </span>
         </header>
         <main>
            <span>{count}</span>
            <span title="Total">
               {currencyFmt(Number(amount?.toFixed(2)) || 0)}
            </span>
         </main>
      </ListItem>
   )
}
