import { useSubscription } from '@apollo/react-hooks'
import moment from 'moment'
import React from 'react'
import { toast } from 'react-toastify'
import { ErrorState, InlineLoader } from '..'
import { logger } from '../../utils'
import { TOTAL_ORDER_RECEIVED } from '../DashboardAnalytics/graphQl/subscription'
import { SparkChart } from './SparkChart'
import { Card, CardGraph, CardText, CardTotal } from './styled'

const WeeklyOrderReceive = ({ onClick }) => {
   const groupBy = ['year', 'month', 'week', 'day']
   const from = moment().subtract(7, 'day').format('YYYY-MM-DD')
   const to = moment().format('YYYY-MM-DD')
   //subscription for present data
   const {
      data: { insights_analytics = [] } = {},
      loading: subsLoading,
      error: subsError,
   } = useSubscription(TOTAL_ORDER_RECEIVED, {
      variables: {
         //totalOrderReceived
         args: {
            params: {
               where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' AND a.created_at >= '${from}' AND a.created_at < '${to}'`,
               groupingSets: `(${groupBy.toString()})`,
               columns: groupBy
                  .map(group => {
                     return `EXTRACT(${group.toUpperCase()} FROM a.created_at) AS \"${group.toLowerCase()}\"`
                  })
                  .join(','),
            },
         },
      },
   })

   //subscription for compare data

   console.log('insight data order', insights_analytics, subsLoading)
   if (subsLoading) {
      return <InlineLoader />
   }
   if (subsError) {
      console.log(subsError)

      logger(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState height="320px" message="Could not get the Insight data" />
      )
   }
   console.log(
      'WeeklyOrderReceived:::',
      insights_analytics[0].getOrdersRecieved.filter(x => x.year !== null)
   )
   return (
      <Card onClick={onClick} title="Click to see order report">
         <CardText>Total Orders Received in last week</CardText>
         <CardTotal>
            {insights_analytics[0].getOrdersRecieved?.find(
               x => x.year === null
            )['count'] || 0}
         </CardTotal>
         <CardGraph>
            {insights_analytics[0].getOrdersRecieved.length > 1 && (
               <>
                  <SparkChart
                     insightAnalyticsData={insights_analytics[0].getOrdersRecieved.filter(
                        x => x.year !== null
                     )}
                     from={from}
                     to={to}
                     dataOf="count"
                     groupBy={groupBy}
                  />
               </>
            )}
         </CardGraph>
      </Card>
   )
}
export default WeeklyOrderReceive
