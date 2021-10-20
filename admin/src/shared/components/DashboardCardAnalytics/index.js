import { useSubscription } from '@apollo/react-hooks'
import { Text } from '@dailykit/ui'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { get_env, logger } from '../../utils'
import { Card, CardContainer, Cards } from '../DashboardCards'
import { ErrorState } from '../ErrorState'
import { InlineLoader } from '../InlineLoader'
import {
   CustomerIcon,
   RevenueIcon,
   OrdersIcon,
   ProductIcon,
} from './assets/icons'
import { GET_TOTAL_EARNING_ORDER_CUSTOMER_TOP_PRODUCT } from './graphql/subscription'
//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}
const DashboardCards = () => {
   const [analyticsData, setAnalyticsData] = useState({})
   const [status, setStatus] = useState({
      loading: true,
   })
   const { loading: subsLoading, error: subsError } = useSubscription(
      GET_TOTAL_EARNING_ORDER_CUSTOMER_TOP_PRODUCT,
      {
         variables: {
            topProductArgs: {
               params: { where: '"paymentStatus"=\'SUCCEEDED\'' },
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            console.log('subscription data', subscriptionData)
            const total = {}
            total.totalEarnings =
               subscriptionData.data.ordersAggregate.aggregate.sum.amountPaid
            total.totalOrders =
               subscriptionData.data.ordersAggregate.aggregate.count
            total.totalCustomers =
               subscriptionData.data.customers_aggregate.aggregate.count
            total.topProduct =
               subscriptionData.data.insights_analytics[0]['getTopProducts'][0]
            setAnalyticsData(total)
            setStatus({ ...status, loading: false })
         },
      }
   )
   if (subsLoading || status.loading) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState height="320px" message="Could not get the Insight data" />
      )
   }
   return (
      <CardContainer bgColor="#FFFFFF" borderColor="#efefef">
         <CardContainer.Title>Here's your progress so far</CardContainer.Title>
         <Cards>
            <Card>
               <Card.AdditionalBox justifyContent="space-between">
                  <RevenueIcon />
               </Card.AdditionalBox>
               <Card.Value currency={currency[get_env('REACT_APP_CURRENCY')]}>
                  {analyticsData.totalEarnings}
               </Card.Value>
               <Card.Text>Total Revenue Generated So Far</Card.Text>
            </Card>
            <Card>
               <Card.AdditionalBox justifyContent="space-between">
                  <OrdersIcon />
               </Card.AdditionalBox>
               <Card.Value>{analyticsData.totalOrders}</Card.Value>
               <Card.Text>Total No. Of Orders So Far</Card.Text>
            </Card>
            <Card>
               <Card.AdditionalBox justifyContent="space-between">
                  <CustomerIcon />
               </Card.AdditionalBox>
               <Card.Value>{analyticsData.totalCustomers}</Card.Value>
               <Card.Text>Total No. Of Customer</Card.Text>
            </Card>
         </Cards>
      </CardContainer>
   )
}
export default DashboardCards
