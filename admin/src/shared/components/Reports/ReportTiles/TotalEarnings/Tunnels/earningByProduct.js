import { useSubscription } from '@apollo/react-hooks'
import { Flex, Spacer, Text } from '@dailykit/ui'

import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
   CartesianGrid,
   Legend,
   Line,
   LineChart,
   ResponsiveContainer,
   XAxis,
   YAxis,
   Tooltip,
} from 'recharts'
import { logger } from '../../../../../utils'
import { BrandShopDateContext } from '../../../../BrandShopDateProvider/context'
import { ErrorState } from '../../../../ErrorState'
import { InlineLoader } from '../../../../InlineLoader'
import { EARNING_BY_PRODUCT } from '../../../graphql/subscription'
import EarningByProductTable from './Listing/earningByProduct'

const EarningByProduct = () => {
   const [tableData, setTableData] = useState([])
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const [status, setStatus] = useState({ loading: true })
   //subscription for earning by product data
   const { loading: subsLoading, error: subsError } = useSubscription(
      EARNING_BY_PRODUCT,
      {
         variables: {
            earningByProductArgs: {
               params: {
                  where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
                     brandShopDateState.from !== moment('2017 - 01 - 01') &&
                     `AND a.created_at >= '${brandShopDateState.from}'`
                  } ${
                     brandShopDateState.from !== moment('2017 - 01 - 01') &&
                     `AND a.created_at < '${brandShopDateState.to}'`
                  } ${
                     brandShopDateState.brandShop.brandId
                        ? `AND a."brandId" = ${brandShopDateState.brandShop.brandId}`
                        : ''
                  } ${
                     brandShopDateState.brandShop.shopTitle
                        ? `AND b.source = \'${brandShopDateState.brandShop.shopTitle}\'`
                        : ''
                  }`,
               },
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const newData =
               subscriptionData.data.insights_analytics[0].getEarningsByProducts.map(
                  each => {
                     each.netSale = parseFloat(
                        (
                           each.total -
                           each.totalTax -
                           each.totalDiscount
                        ).toFixed(2)
                     )
                     return each
                  }
               )
            setTableData(newData)
            setStatus({ ...status, loading: false })
         },
      }
   )
   useEffect(() => {
      if (subsLoading) {
         setStatus({ ...status, loading: true })
      }
   }, [subsLoading])

   if (status.loading || (subsLoading && !subsError)) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState
            height="320px"
            message="Could not get Earning by product data"
         />
      )
   }
   return (
      <>
         <Flex>
            <Spacer size="20px" />
            <Flex>
               <div
                  style={{
                     background: '#FFFFFF',
                     boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                     borderRadius: '10px',
                     padding: '40px 40px 10px 0px',
                  }}
               >
                  <EarningByProductChart
                     earningByProductChartData={tableData.slice(0, 10)}
                  />
               </div>
            </Flex>
            <Spacer size="20px" />

            <Flex>
               <div
                  style={{
                     background: '#FFFFFF',
                     boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                     borderRadius: '10px',
                     padding: '10px 0px',
                  }}
               >
                  <EarningByProductTable
                     earningByProductData={tableData}
                     currency={brandShopDateState.currency}
                  />
               </div>
            </Flex>
         </Flex>
      </>
   )
}

const EarningByProductChart = ({ earningByProductChartData, currency }) => {
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
         return (
            <div
               style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#f9f9f9',
                  color: '#8884d8 !important',
                  width: '11rem',
                  height: 'auto',
                  margin: '2px 2px',
                  padding: '2px 2px',
                  boxShadow: '5px 5px 10px #888888',
               }}
            >
               <Spacer size="3px" />
               <Text as="text3">Product: {payload[0].payload['name']}</Text>
               <Text as="text3">
                  Earning: {brandShopDateState.currency}
                  {payload[0].payload['total']}
               </Text>
               <Text as="text3">
                  Tax: {brandShopDateState.currency}
                  {payload[0].payload['totalTax']}
               </Text>
               <Text as="text3">
                  Discount: {brandShopDateState.currency}
                  {payload[0].payload['totalDiscount']}
               </Text>
            </div>
         )
      }

      return null
   }
   return (
      <>
         <Flex height="22rem">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart
                  width={550}
                  height={300}
                  data={earningByProductChartData}
                  margin={{
                     top: 5,
                     right: 0,
                     left: 0,
                     bottom: 5,
                  }}
               >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                     dataKey="name"
                     tickFormatter={tick => tick.toString().slice(0, 14)}
                     ticks={earningByProductChartData.map(x => x.name)}
                     // tick={<CustomizedAxisTick />}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                     name="Earning"
                     type="monotone"
                     dataKey="total"
                     stroke="#8884d8"
                  />
               </LineChart>
            </ResponsiveContainer>
         </Flex>
      </>
   )
}
export default EarningByProduct
