import { useSubscription } from '@apollo/react-hooks'
import React from 'react'
import moment from 'moment'
import { ErrorState, InlineLoader } from '..'
import { toast } from 'react-toastify'
import { logger } from '../../utils'
import { SUBSCRIBED_CUSTOMER } from '../DashboardAnalytics/graphQl/subscription'
import { SparkChart } from './SparkChart'
import { Card, CardGraph, CardText, CardTotal } from './styled'

const WeeklySubscribers = () => {
   const groupBy = ['year', 'month', 'week', 'day']
   const from = moment().subtract(7, 'day').format('YYYY-MM-DD')
   const to = moment().format('YYYY-MM-DD')
   const {
      data: { insights_analytics = [] } = {},
      loading: subsLoading,
      error: subsError,
   } = useSubscription(SUBSCRIBED_CUSTOMER, {
      variables: {
         args: {
            params: {
               where: `a.\"isSubscriber\" = true AND  a.\"isSubscriberTimeStamp\" IS NOT NULL AND a.created_at >= '${from}' AND a.created_at < '${to}'`,
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

   if (subsLoading) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      console.log(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState height="320px" message="Could not get the Insight data" />
      )
   }
   return (
      <Card>
         <CardText>Total subscribers in last week</CardText>
         <CardTotal>
            {insights_analytics[0].getSubscribedCustomers[0]['count']}
         </CardTotal>
         <CardGraph>
            {insights_analytics[0].getSubscribedCustomers.length > 1 && (
               <>
                  <SparkChart
                     insightAnalyticsData={insights_analytics[0].getSubscribedCustomers.slice(
                        1
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
export default WeeklySubscribers
