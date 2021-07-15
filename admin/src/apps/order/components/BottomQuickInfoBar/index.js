import React from 'react'
import { toast } from 'react-toastify'
import { useSubscription } from '@apollo/react-hooks'

import { Wrapper } from './styled'
import SachetBar from './SachetBar'
import { useOrder } from '../../context'
import { QUERIES, QUERIES2 } from '../../graphql'
import { logger, currencyFmt } from '../../../../shared/utils'
import { InlineLoader, ErrorState } from '../../../../shared/components'

const BottomQuickInfoBar = ({ openOrderSummaryTunnel }) => {
   const { state } = useOrder()
   const { data: { orders = {} } = {} } = useSubscription(
      QUERIES.ORDERS.AGGREGATE.TOTAL
   )
   const { data: { orders: cancelledOrders = {} } = {} } = useSubscription(
      QUERIES.ORDERS.AGGREGATE.CANCELLED
   )
   const {
      loading,
      error,
      data: { ordersAggregate = [] } = {},
   } = useSubscription(QUERIES2.ORDERS_AGGREGATE)

   if (loading) return <div />
   if (error) {
      logger(error)
      toast.error('Failed to fetch the order summary!')
      return <ErrorState message="Failed to fetch the order summary!" />
   }

   const getCardText = () => {
      const activeStatusCard = state.orders.where?.cart?.status?._eq
      const isAllActive = state.orders?.where?._or.find(
         el =>
            el.isRejected?._eq === false ||
            el.isRejected?._eq === true ||
            el.isRejected?.is_null === true
      )

      const cardText = {}

      if (activeStatusCard) {
         const { title, count, sum, avg } = ordersAggregate.find(
            el => el.value === activeStatusCard
         )
         cardText.title = title
         cardText.count = count
         cardText.amount = sum
         cardText.average = avg
      } else if (isAllActive) {
         cardText.title = 'All'
         cardText.count = orders.aggregate.count
         cardText.amount = orders.aggregate.sum.amountPaid || 0
         cardText.average = orders.aggregate.avg.amountPaid || 0
      } else {
         cardText.title = 'Rejected Or Cancelled'
         cardText.count = cancelledOrders.aggregate.count
         cardText.amount = cancelledOrders.aggregate.sum.amountPaid || 0
         cardText.average = cancelledOrders.aggregate.avg.amountPaid || 0
      }
      return cardText
   }
   const { title, count, amount, average } = getCardText()
   return (
      <>
         {state.current_view === 'SUMMARY' && (
            <Wrapper variant={title} onClick={() => openOrderSummaryTunnel(1)}>
               <header>
                  <h2>{title}</h2>
                  <span title="Average">
                     {currencyFmt(Number(average) || 0)}
                  </span>
               </header>
               <main>
                  <span>{count}</span>
                  <span title="Total">{currencyFmt(Number(amount) || 0)}</span>
               </main>
            </Wrapper>
         )}
         {state.current_view === 'SACHET_ITEM' && (
            <SachetBar openOrderSummaryTunnel={openOrderSummaryTunnel} />
         )}
      </>
   )
}

export default BottomQuickInfoBar
