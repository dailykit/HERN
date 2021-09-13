import { useSubscription } from '@apollo/react-hooks'
import React, { useEffect, useState } from 'react'
import { BrandShopDateContext } from '../../../../BrandShopDateProvider/context'
import { ORDER_BY_LOCATION } from '../graphql/subscription'
import { ErrorState } from '../../../../ErrorState'
import { InlineLoader } from '../../../../InlineLoader'
import { toast } from 'react-toastify'
import { logger } from '../../../../../utils'
import { Flex, Spacer } from '@dailykit/ui'
import _ from 'lodash'
import {
   Bar,
   BarChart,
   CartesianGrid,
   Legend,
   ResponsiveContainer,
   Tooltip,
   XAxis,
   YAxis,
} from 'recharts'
import moment from 'moment'
import OrderByLocationTable from './listing/orderByLocation'
const OrderByLocation = () => {
   const { brandShopDateState, brandShopDateDispatch } =
      React.useContext(BrandShopDateContext)
   const { from, to, compare, brandShop } = brandShopDateState
   const [orderByLocationData, setORderByLocationData] = useState([])
   const [status, setStatus] = useState('loading')
   const { loading: subsLoading, error: subsError } = useSubscription(
      ORDER_BY_LOCATION,
      {
         variables: {
            where: {
               _and: [
                  {
                     created_at: {
                        _gte: from,
                     },
                  },
                  { created_at: { _lte: to } },
               ],
               isAccepted: { _eq: true },
               cart: {
                  paymentStatus: { _eq: 'SUCCEEDED' },
                  ...(brandShop.shopTitle && {
                     source: { _eq: brandShop.shopTitle },
                  }),
               },
               isRejected: { _is_null: true },
               ...(brandShop.brandId && {
                  brandId: { _eq: brandShop.brandId },
               }),
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const insightData = subscriptionData.data.orders
            if (insightData.length > 0) {
               const manipulateInsightData = insightData.map(each => {
                  const orderDetails = {
                     orderId: each.id,
                     orderCity: each.cart?.address?.city || 'N/A',
                     orderState: each.cart?.address?.state || 'N/A',
                     orderCountry: each.cart?.address?.country || 'N/A',
                     orderZipcode: each.cart?.address?.zipcode || 'N/A',
                     customerEmail:
                        each.cart?.customerInfo?.customerEmail || 'N/A',
                     customerPhone:
                        each.cart?.customerInfo?.customerPhone || 'N/A',
                     customerFullName:
                        (each.cart?.customerInfo?.customerFirstName || 'N/A') +
                        (each.cart?.customerInfo?.customerLastName || ''),
                     created_at: moment(each.created_at).format('DD MMM YYYY'),
                     amountPaid: each.amountPaid || 0,
                  }
                  return orderDetails
               })
               setORderByLocationData(manipulateInsightData)
               setStatus('success')
            } else {
               setORderByLocationData([])
               setStatus('success')
            }
         },
      }
   )
   //for compare
   const { loading: compareLoading, error: compareError } = useSubscription(
      ORDER_BY_LOCATION,
      {
         variables: {
            where: {
               _and: [
                  {
                     created_at: {
                        _gte: compare.from,
                     },
                  },
                  { created_at: { _lte: compare.to } },
               ],
               isAccepted: { _eq: true },
               cart: {
                  paymentStatus: { _eq: 'SUCCEEDED' },
                  ...(brandShop.shopTitle && {
                     source: { _eq: brandShop.shopTitle },
                  }),
               },
               isRejected: { _is_null: true },
               ...(brandShop.brandId && {
                  brandId: { _eq: brandShop.brandId },
               }),
            },
         },
         skip: compare.isSkip,
         onSubscriptionData: ({ subscriptionData }) => {
            const insightData = subscriptionData.data.orders
            if (insightData.length > 0) {
               const manipulateInsightData = insightData.map(each => {
                  const orderDetails = {
                     orderId: each.orderId,
                     orderCity: each.cart?.address?.city || 'N/A',
                  }
                  return orderDetails
               })
               brandShopDateDispatch({
                  type: 'COMPARE',
                  payload: {
                     data: manipulateInsightData,
                  },
               })
            } else {
               brandShopDateDispatch({
                  type: 'COMPARE',
                  payload: {
                     data: [],
                  },
               })
            }
         },
      }
   )
   if (subsError || compareError) {
      logger(subsError)
      toast.error('Could not get the order by location data')
      return (
         <ErrorState
            height="320px"
            message="Could not get the order by location data"
         />
      )
   }
   if (subsLoading || compareLoading || status === 'loading') {
      return <InlineLoader />
   }
   return (
      <Flex>
         <Spacer size="20px" />
         <div
            style={{
               background: '#FFFFFF',
               boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
               borderRadius: '10px',
               padding: '40px 40px 10px 0px',
            }}
         >
            <OrderByLocationChart orderByLocationData={orderByLocationData} />
         </div>
         <Spacer size="20px" />
         <div
            style={{
               background: '#FFFFFF',
               boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
               borderRadius: '10px',
               padding: '10px 0px',
            }}
         >
            <OrderByLocationTable orderByLocationData={orderByLocationData} />
         </div>
      </Flex>
   )
}
const OrderByLocationChart = props => {
   const { orderByLocationData } = props
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const { compare } = brandShopDateState
   const [graphData, setGraphData] = useState([])
   const [status, setStatus] = useState('loading')
   useEffect(() => {
      const groupByCityData = _.chain(orderByLocationData)
         .groupBy('orderCity')
         .map((value, key) => ({
            orderCity: key,
            orders: value,
            count: value.length,
            countCompare: 0,
         }))
         .value()
         .sort((a, b) => b.count - a.count) // sort by number of order in city
         .slice(0, 10) //top ten data
      if (!compare.isSkip) {
         const groupByCityDataCompare = _.chain(compare.data)
            .groupBy('orderCity')
            .map((value, key) => ({
               orderCity: key,
               count: value.length,
            }))
            .value()
         groupByCityData.forEach(each => {
            const matchedData = groupByCityDataCompare.find(
               x => x.orderCity === each.orderCity
            )
            each.countCompare = matchedData?.count || 0
         })
         setGraphData(groupByCityData)
         setStatus('success')
         return
      }
      setGraphData(groupByCityData)
      setStatus('success')
   }, [orderByLocationData, compare])

   if (status === 'loading') {
      return <InlineLoader />
   }
   return (
      <>
         <Flex height="22rem">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart
                  width={500}
                  height={300}
                  data={graphData}
                  margin={{
                     top: 5,
                     right: 30,
                     left: 20,
                     bottom: 5,
                  }}
               >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="orderCity" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar name="Orders" dataKey="count" fill="#2AC981" />
                  {!compare.isSkip && (
                     <Bar
                        name="Orders Compare"
                        dataKey="countCompare"
                        fill="#8884d8"
                     />
                  )}
               </BarChart>
            </ResponsiveContainer>
         </Flex>
      </>
   )
}
export default OrderByLocation
