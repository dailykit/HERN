import React, { useContext } from 'react'
import { toast } from 'react-toastify'
import { useSubscription } from '@apollo/react-hooks'

import { Wrapper } from './styled'
import SachetBar from './SachetBar'
import { useOrder } from '../../context'
import { QUERIES, QUERIES2 } from '../../graphql'
import { logger, currencyFmt } from '../../../../shared/utils'
import { InlineLoader, ErrorState } from '../../../../shared/components'
import { BrandContext } from '../../../../App'

const BottomQuickInfoBar = ({ openOrderSummaryTunnel }) => {
   const { state } = useOrder()
   const [brandContext, setBrandContext] = useContext(BrandContext)
   const [ordersAggregate, setOrdersAggregate] = React.useState([])
   // console.log('brandContextBottom', brandContext)
   const [loaderBottom, setLoaderBottom] = React.useState(true)

   const { data: { orders = {} } = {} } = useSubscription(
      QUERIES.ORDERS.AGGREGATE.TOTAL,
      {
         variables: {
            where: {
               cart: {
                  brandId: {
                     _in: brandContext.brandId,
                  },
                  locationId: { _in: brandContext.locationId },
               },
            },
         },
      }
   )
   const { data: { orders: cancelledOrders = {} } = {} } = useSubscription(
      QUERIES.ORDERS.AGGREGATE.CANCELLED
   )
   const { loading, error } = useSubscription(QUERIES2.ORDERS_AGGREGATE, {
      variables: {
         brandId:
            brandContext.brandId === null
               ? { _is_null: true }
               : {
                    _in: brandContext.brandId,
                 },
         locationId:
            brandContext.locationId === null
               ? { _is_null: true }
               : {
                    _in: brandContext.locationId,
                 },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { order_orderStatusEnum = [] } = {} },
      }) => {
         if (order_orderStatusEnum.length > 0) {
            const result = order_orderStatusEnum.map(order => {
               return {
                  title: order.title,
                  value: order.value,
                  count: order.groupedOrderSummary[0]?.count || 0,
                  sum: order.groupedOrderSummary[0]?.sum || 0,
                  avg: order.groupedOrderSummary[0]?.avg || 0,
               }
            })
            setOrdersAggregate(result)
            // console.log('orderSummary 1', order_orderStatusEnum, result)
            setLoaderBottom(false)
         }
      },
   })
   // console.log('orderSummary for bottom', ordersAggregate)

   if (loading || loaderBottom) return <InlineLoader />
   // console.log('Error and loading', error, loading, loaderBottom)
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
