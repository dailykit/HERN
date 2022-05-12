import React from 'react'
import moment from 'moment'
import { SparkChart } from './SparkChart'
import { GET_TOTAL_EARNING } from '../DashboardAnalytics/graphQl/subscription'
import { useSubscription } from '@apollo/react-hooks'
import { ErrorState, InlineLoader } from '..'
import { toast } from 'react-toastify'
import { currencyFmt, logger } from '../../utils'
import { Card, CardGraph, CardText, CardTotal } from './styled'

const WeeklyEarning = ({ onClick }) => {
   const groupBy = ['year', 'month', 'week', 'day']
   const from = moment().subtract(7, 'day').format('YYYY-MM-DD')
   const to = moment().format('YYYY-MM-DD')
   //subscription for present data
   const {
      data: { insights_analytics = [] } = {},
      loading: subsLoading,
      error: subsError,
   } = useSubscription(GET_TOTAL_EARNING, {
      variables: {
         //totalEarning
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

   // console.log('Loading', subsLoading, insights_analytics)
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
   // console.log(
   //    'WeeklyEarning:::',
   //    insights_analytics[0].getTotalEarnings.slice(1)
   // )
   return (
      <Card onClick={onClick} title="Click to see earning report">
         <CardText>Total Earning in last week</CardText>
         <CardTotal>
            {currencyFmt(
               insights_analytics[0].getTotalEarnings[0]['total'] || 0
            )}
         </CardTotal>
         <CardGraph>
            {insights_analytics[0].getTotalEarnings.length > 1 && (
               <>
                  <SparkChart
                     insightAnalyticsData={insights_analytics[0].getTotalEarnings.slice(
                        1
                     )}
                     from={from}
                     to={to}
                     dataOf="total"
                     groupBy={groupBy}
                  />
               </>
            )}
         </CardGraph>
      </Card>
   )
}
export default WeeklyEarning
