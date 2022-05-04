import { useSubscription } from '@apollo/react-hooks'
import { Flex, Spacer, Text,Filler } from '@dailykit/ui'

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
   BarChart,
   Bar,
   Cell,
} from 'recharts'
import { logger } from '../../../../../utils'
import { BrandShopDateContext } from '../../../../BrandShopDateProvider/context'
import { ErrorState } from '../../../../ErrorState'
import { InlineLoader } from '../../../../InlineLoader'
import { EARNING_BY_PRODUCT } from '../graphql/subscription'
import EarningByProductTable from './Listing/earningByProduct'

const EarningByProduct = () => {
   const [earningByProductData, setEarningByProductData] = useState([])
   const [earningByProductCompareData, setEarningByProductCompareData] =
      useState([])
   const { brandShopDateState, brandShopDateDispatch } =
      React.useContext(BrandShopDateContext)
   const [status, setStatus] = useState({ loading: true })
   const [sortedEarningByProductData, setSortedEarningByProductData] = useState(
      []
   )
   //subscription for earning by product data
   const { loading: subsLoading, error: subsError } = useSubscription(
      EARNING_BY_PRODUCT,
      {
         variables: {
            earningByProductArgs: {
               params: {
                  where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
                     brandShopDateState.from !== moment('2017 - 01 - 01') &&
                     `AND o.created_at >= '${brandShopDateState.from}'`
                  } ${
                     brandShopDateState.from !== moment('2017 - 01 - 01') &&
                     `AND o.created_at < '${brandShopDateState.to}'`
                  } ${
                     brandShopDateState.brandShop.brandId
                        ? `AND o."brandId" = ${brandShopDateState.brandShop.brandId}`
                        : ''
                  } ${
                     brandShopDateState.brandShop.shopTitle
                        ? `AND c.source = \'${brandShopDateState.brandShop.shopTitle}\'`
                        : ''
                  }
                  ${
                     brandShopDateState.brandShop.locationId
                        ? `AND c."locationId" = ${brandShopDateState.brandShop.locationId}`
                        : ''
                  }
                  `,
                  productWhere: 'id IS NOT NULL',
               },
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const newData =
               subscriptionData.data.insights_analytics[0].getEarningsByProducts.map(
                  each => {
                     return each
                  }
               )

            setEarningByProductData(newData)
            setSortedEarningByProductData(newData)
            setStatus({ ...status, loading: false })
         },
      }
   )

   //subscription for earning by product compare data
   const { loading: subsCompareLoading, error: subsCompareError } =
      useSubscription(EARNING_BY_PRODUCT, {
         skip: brandShopDateState.compare.isSkip,
         variables: {
            earningByProductArgs: {
               params: {
                  where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
                     brandShopDateState.compare.from !==
                        moment('2017 - 01 - 01') &&
                     `AND o.created_at >= '${brandShopDateState.compare.from}'`
                  } ${
                     brandShopDateState.compare.from !==
                        moment('2017 - 01 - 01') &&
                     `AND o.created_at < '${brandShopDateState.compare.to}'`
                  } ${
                     brandShopDateState.brandShop.brandId
                        ? `AND o."brandId" = ${brandShopDateState.brandShop.brandId}`
                        : ''
                  } ${
                     brandShopDateState.brandShop.shopTitle
                        ? `AND c.source = \'${brandShopDateState.brandShop.shopTitle}\'`
                        : ''
                  }
                  ${
                     brandShopDateState.brandShop.locationId
                        ? `AND c."locationId" = ${brandShopDateState.brandShop.locationId}`
                        : ''
                  }`,
                  productWhere: `id IN (${sortedEarningByProductData
                     .map(x => x.id)
                     .toString()})`,
               },
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const newData =
               subscriptionData.data.insights_analytics[0].getEarningsByProducts.map(
                  each => {
                     return each
                  }
               )
            setEarningByProductCompareData(newData)
         },
      })

   useEffect(() => {
      if (subsLoading) {
         setStatus({ ...status, loading: true })
      }
   }, [subsLoading])

   if (!subsError && (status.loading || subsLoading)) {
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
   if (earningByProductData.length == 0) {
      return <Filler message="Product Report Not Available" />
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
                     earningByProductChartData={sortedEarningByProductData.slice(
                        0,
                        10
                     )}
                     earningByProductCompareData={earningByProductCompareData}
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
                     earningByProductData={earningByProductData}
                     currency={brandShopDateState.currency}
                     setSortedEarningByProductData={
                        setSortedEarningByProductData
                     }
                  />
               </div>
            </Flex>
         </Flex>
      </>
   )
}

const EarningByProductChart = ({
   earningByProductChartData,
   earningByProductCompareData,
}) => {
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const [chartData, setChartData] = useState([])
   const [isLoading, setIsLoading] = useState(true)
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
               <Text as="text3">Product: {payload[0].payload['name']}</Text>
               <Text as="text3">
                  Earning:{' '}
                  <span style={{ color: '#2AC981' }}>
                     {brandShopDateState.currency}
                     {payload[0].payload['total']}
                  </span>{' '}
                  {!brandShopDateState.compare.isSkip &&
                     earningByProductCompareData && (
                        <span style={{ color: '#8884d8' }}>
                           {brandShopDateState.currency}
                           {payload[0].payload['compareTotal']}
                        </span>
                     )}
               </Text>
            </div>
         )
      }

      return null
   }
   useEffect(() => {
      if (earningByProductCompareData.length > 0) {
         //present and past data merging
         const productDataWithCompareData = earningByProductChartData.map(
            product => {
               product.compareTotal =
                  earningByProductCompareData.find(x => x.id == product.id)
                     ?.total || 0
               return product
            }
         )
         setChartData(productDataWithCompareData)
         setIsLoading(false)
      } else {
         setChartData(earningByProductChartData)
         setIsLoading(false)
      }
   }, [earningByProductCompareData, earningByProductChartData])
   if (isLoading) {
      return <InlineLoader />
   }
   return (
      <>
         <Flex height="22rem">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart
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
                     dataKey="name"
                     tickFormatter={tick =>
                        tick.toString().slice(0, 10) + '...'
                     }
                     ticks={earningByProductChartData.map(x => x.name)}
                     // tick={<CustomizedAxisTick />}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                     name="Earning"
                     type="monotone"
                     dataKey="total"
                     fill="#2AC981"
                  />

                  {!brandShopDateState.compare.isSkip &&
                     earningByProductCompareData && (
                        <Bar
                           name="Compare Earning"
                           type="monotone"
                           dataKey="compareTotal"
                           fill="#8884d8"
                        />
                     )}
               </BarChart>
            </ResponsiveContainer>
         </Flex>
      </>
   )
}
export default EarningByProduct
