import { Flex, Spacer, Text } from '@dailykit/ui'
import React, { useState } from 'react'
import {
   Bar,
   BarChart,
   CartesianGrid,
   ComposedChart,
   Legend,
   Line,
   ResponsiveContainer,
   Tooltip,
   XAxis,
   YAxis,
} from 'recharts'
import { BrandShopDateContext } from '../../../../../BrandShopDateProvider/context'
import { InlineLoader } from '../../../../../InlineLoader'
export const EarningByStoreLocationChart = ({
   earningByStoreLocationData,
   earningByStoreLocationCompareData,
}) => {
   const [isLoading, setIsLoading] = useState(true)
   const [chartData, setChartData] = useState([])
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   React.useEffect(() => {
      if (earningByStoreLocationCompareData.length > 0) {
         //present and past data merging
         const productDataWithCompareData = earningByStoreLocationData.map(
            location => {
               const foundData = earningByStoreLocationCompareData.find(
                  x => x.id == location.id
               )
               location.compareTotalAmountPaid = foundData?.totalAmountPaid || 0
               location.compareTotalOrders = foundData?.totalOrders || 0
               return location
            }
         )
         setChartData(productDataWithCompareData)
         setIsLoading(false)
      } else {
         setChartData(earningByStoreLocationData)
         setIsLoading(false)
      }
   }, [earningByStoreLocationCompareData, earningByStoreLocationData])

   const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
         return (
            <div
               style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#f9f9f9',
                  width: '11rem',
                  height: 'auto',
                  margin: '2px 2px',
                  padding: '2px 2px',
                  boxShadow: '5px 5px 10px #888888',
               }}
            >
               <Spacer size="3px" />
               <Text as="text3">Location: {payload[0].payload['label']}</Text>
               <Text as="text3">
                  Earning:{' '}
                  <span style={{ color: '#2AC981' }}>
                     {brandShopDateState.currency}
                     {payload[0].payload['totalAmountPaid']}
                  </span>{' '}
                  {!brandShopDateState.compare.isSkip &&
                     earningByStoreLocationCompareData && (
                        <span style={{ color: '#8884d8' }}>
                           {brandShopDateState.currency}
                           {payload[0].payload['compareTotalAmountPaid']}
                        </span>
                     )}
               </Text>
               <Text as="text3">
                  Orders:{' '}
                  <span style={{ color: '#187498' }}>
                     {payload[0].payload['totalOrders']}
                  </span>{' '}
                  {!brandShopDateState.compare.isSkip &&
                     earningByStoreLocationCompareData && (
                        <span style={{ color: '#EB5353' }}>
                           {payload[0].payload['compareTotalOrders']}
                        </span>
                     )}
               </Text>
            </div>
         )
      }

      return null
   }

   if (isLoading) {
      return <InlineLoader />
   }

   return (
      <Flex height="22rem">
         <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
               width={550}
               height={300}
               data={chartData}
               margin={{
                  top: 5,
                  right: 0,
                  left: 0,
                  bottom: 5,
               }}
            >
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis
                  dataKey="label"
                  tickFormatter={tick => tick.toString().slice(0, 10) + '...'}
                  ticks={earningByStoreLocationData.map(x => x.label)}
                  // tick={<CustomizedAxisTick />}
               />
               <YAxis />
               <Tooltip content={<CustomTooltip />} />
               <YAxis yAxisId="right" orientation="right" />
               <Legend />
               <Bar
                  name="Earnings"
                  type="monotone"
                  dataKey="totalAmountPaid"
                  fill="#2AC981"
               />
               <Line
                  name="Orders"
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalOrders"
                  stroke="#187498"
               />

               {!brandShopDateState.compare.isSkip &&
                  earningByStoreLocationCompareData && (
                     <>
                        <Bar
                           name="Compare Earnings"
                           type="monotone"
                           dataKey="compareTotalAmountPaid"
                           fill="#8884d8"
                        />
                        <Line
                           name="Compare Orders"
                           yAxisId="right"
                           type="monotone"
                           dataKey="compareTotalOrders"
                           stroke="#EB5353"
                        />
                     </>
                  )}
            </ComposedChart>
         </ResponsiveContainer>
      </Flex>
   )
}
