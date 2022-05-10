import { useSubscription } from '@apollo/react-hooks'
import { Filler, Flex, Spacer } from '@dailykit/ui'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { BrandShopDateContext } from '../../../../BrandShopDateProvider/context'
import { FIRST_TIME_VS_RETURNING_CUSTOMER_SALES } from '../graphql/subscription'
import { InlineLoader } from '../../../../InlineLoader'
import { ErrorState } from '../../../../ErrorState'
import { logger } from '../../../../../utils'
import { toast } from 'react-toastify'
import DataGeneratorBetweenToDates from '../../../../../utils/dataBWtwoDate'
import {
   Bar,
   BarChart,
   CartesianGrid,
   Legend,
   ResponsiveContainer,
   XAxis,
   YAxis,
   Tooltip,
} from 'recharts'
import CustomerSalesTable from './Listing/firstTimeVsReturningCustomer'
const FirstTimeVsReturningCustomerSales = () => {
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const [customerData, setCustomerData] = useState([])
   const [status, setStatus] = useState('loading')
   const { loading: subsLoading, error: subsError } = useSubscription(
      FIRST_TIME_VS_RETURNING_CUSTOMER_SALES,
      {
         variables: {
            args: {
               params: {
                  where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
                     brandShopDateState.from !== moment('2017 - 01 - 01') &&
                     `AND a.created_at >= '${brandShopDateState.from}'`
                  } ${
                     brandShopDateState.from !== moment('2017 - 01 - 01') &&
                     `AND a.created_at < '${moment(brandShopDateState.to)
                        .add(1, 'd')
                        .format('YYYY-MM-DD')}'`
                  } ${
                     brandShopDateState.brandShop.brandId
                        ? `AND a."brandId" = ${brandShopDateState.brandShop.brandId}`
                        : ''
                  } ${
                     brandShopDateState.brandShop.shopTitle
                        ? `AND b.source = \'${brandShopDateState.brandShop.shopTitle}\'`
                        : ''
                  } ${
                     brandShopDateState.brandShop.locationId
                        ? `AND b."locationId" = ${brandShopDateState.brandShop.locationId}`
                        : ''
                  }`,
                  groupingSets: `(\"keycloakId\",${brandShopDateState.groupBy.toString()})`,
                  columns:
                     brandShopDateState.groupBy
                        .map(group => {
                           return `EXTRACT(${group.toUpperCase()} FROM a.created_at) AS \"${group.toLowerCase()}\"`
                        })
                        .join(',') + `,\"keycloakId\"`,
               },
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const newData =
               subscriptionData.data.insights_analytics[0].getTotalEarnings
                  .slice(1)
                  .map(each => {
                     if (each.count == 1) {
                        each.totalFirst = each.total
                        each.countFirst = each.count
                        each.totalReturn = each.totalReturn || 0
                        each.countReturn = each.countReturn || 0
                     } else {
                        each.totalReturn = each.total
                        each.countReturn = each.count
                        each.totalFirst = each.totalFirst || 0
                        each.countFirst = each.countFirst || 0
                     }
                     return each
                  })
            console.log('newData', newData)

            setCustomerData(newData)
            setStatus('success')
         },
      }
   )

   if (!subsError && (subsLoading || status === 'loading')) {
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
      <>
         <Spacer size="20px" />
         <div
            style={{
               background: '#FFFFFF',
               boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
               borderRadius: '10px',
               padding: '40px 40px 10px 0px',
            }}
         >
            <CustomerSalesChart customerData={customerData} />
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
            {customerData.length == 0 ? (
               <Filler message="No data found for the date range selected" />
            ) : (
               <CustomerSalesTable customerData={customerData} />
            )}
         </div>
      </>
   )
}
const CustomerSalesChart = props => {
   const { customerData } = props
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const { from, to, groupBy, currency } = brandShopDateState
   const [status, setStatus] = useState('loading')
   const [graphData, setGraphData] = useState([])
   useEffect(() => {
      const dataset = {
         from: moment(from),
         to: moment(to),
         data: customerData,
      }
      const timeUnit = groupBy[groupBy.length - 1]
      const keys = {
         totalFirst: 0,
         totalReturn: 0,
      }
      const generatedData = DataGeneratorBetweenToDates(dataset, timeUnit, keys)
      setGraphData(generatedData)
      setStatus('success')
   }, [customerData])
   const tickFormatter = tick => {
      const eachTickData = graphData.find(x => x.uniqueId == tick)
      const tickTime = eachTickData.present
      if (groupBy[groupBy.length - 1] == 'hour') {
         return moment(tickTime).format('LT')
      } else if (groupBy[groupBy.length - 1] == 'day') {
         return moment(tickTime).format('DD-MMM')
      } else if (groupBy[groupBy.length - 1] == 'week') {
         return moment(tickTime).format('DD-MMM')
      } else {
         return moment(tickTime).format('MMM-YYYY')
      }
   }
   const labelFormatter = label => {
      const eachLabelData = graphData.find(x => x.uniqueId == label)
      const labelTime = eachLabelData.present
      if (groupBy[groupBy.length - 1] == 'hour') {
         return moment(labelTime).format('DD-MMM hh:mm A')
      } else if (groupBy[groupBy.length - 1] == 'day') {
         return moment(labelTime).format('DD-MMM')
      } else if (groupBy[groupBy.length - 1] == 'week') {
         return (
            moment(labelTime).format('DD-MMM-YY') +
            ' to ' +
            moment(labelTime).add(1, 'week').format('DD-MMM-YY')
         )
      } else {
         return moment(labelTime).format('MMM-YYYY')
      }
   }
   if (status === 'loading') {
      return <InlineLoader />
   }
   console.log('first graphData', graphData)
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
                  <XAxis
                     dataKey="uniqueId"
                     tickFormatter={tick => {
                        return tickFormatter(tick)
                     }}
                  />
                  <YAxis
                     label={{
                        value: `Sales (${currency})`,
                        angle: -90,
                        position: 'insideLeft',
                     }}
                  />
                  <Tooltip
                     labelFormatter={label => {
                        return labelFormatter(label)
                     }}
                  />
                  <Legend />
                  <Bar
                     name="Returning"
                     dataKey="totalReturnpresent"
                     fill="#2AC981"
                  />
                  <Bar
                     name="First time"
                     dataKey="totalFirstpresent"
                     fill="#8884d8"
                  />
               </BarChart>
            </ResponsiveContainer>
         </Flex>
      </>
   )
}
export default FirstTimeVsReturningCustomerSales
