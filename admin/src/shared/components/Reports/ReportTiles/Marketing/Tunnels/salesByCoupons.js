import { useSubscription } from '@apollo/react-hooks'
import React, { useEffect, useState } from 'react'
import { BrandShopDateContext } from '../../../../BrandShopDateProvider/context'
import { SALES_BY_COUPONS } from '../graphql/subscription'
import moment from 'moment'
import { Flex, Spacer } from '@dailykit/ui'
import SalesByCouponsTable from './Listing/salesByCoupons'
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
import { logger } from '../../../../../utils'
import { toast } from 'react-toastify'
import { ErrorState, InlineLoader } from '../../../..'
const SalesByCoupons = () => {
   const [salesByCouponsData, setSalesByCouponsData] = useState([])
   const [status, setStatus] = useState('loading')
   const { brandShopDateState, brandShopDateDispatch } =
      React.useContext(BrandShopDateContext)
   const { from, to, currency, compare, brandShop } = brandShopDateState
   const {
      loading: subsLoading,
      error: subsError,
      data: { insights_analytics = [] } = {},
   } = useSubscription(SALES_BY_COUPONS, {
      variables: {
         args: {
            params: {
               where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
                  from !== moment('2017 - 01 - 01') &&
                  `AND oo.created_at >= '${from}'`
               } ${
                  from !== moment('2017 - 01 - 01') &&
                  `AND oo.created_at < '${to}'`
               } ${
                  brandShop.brandId
                     ? `AND oo."brandId" = ${brandShop.brandId}`
                     : ''
               } ${
                  brandShop.shopTitle
                     ? `AND oc.source = \'${brandShop.shopTitle}\'`
                     : ''
               }`,
               couponWhere: 'id IS NOT NULL',
            },
         },
      },
      onSubscriptionData: ({ subscriptionData }) => {
         const newData =
            subscriptionData.data.insights_analytics[0].getEarningByCoupons.map(
               each => {
                  each.startTimeStamp = each.couponStartTimeStamp
                     ? moment(each.couponStartTimeStamp).format(
                          'DD-MMM-YYYY HH:mm'
                       )
                     : 'N/A'
                  each.endTimeStamp = each.couponEndTimeStamp
                     ? moment(each.couponEndTimeStamp).format(
                          'DD-MMM-YYYY HH:mm'
                       )
                     : 'N/A'
                  return each
               }
            )
         setSalesByCouponsData(newData)
         setStatus('success')
      },
   })
   const {
      loading: compareLoading,
      error: compareError,
      data: compareSalesData,
   } = useSubscription(SALES_BY_COUPONS, {
      variables: {
         args: {
            params: {
               where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
                  compare.from !== moment('2017 - 01 - 01') &&
                  `AND oo.created_at >= '${compare.from}'`
               } ${
                  compare.from !== moment('2017 - 01 - 01') &&
                  `AND oo.created_at < '${compare.to}'`
               } ${
                  brandShop.brandId
                     ? `AND oo."brandId" = ${brandShop.brandId}`
                     : ''
               } ${
                  brandShop.shopTitle
                     ? `AND oc.source = \'${brandShop.shopTitle}\'`
                     : ''
               }`,
               couponWhere: `id IN (${salesByCouponsData
                  .slice(0, 10)
                  .map(x => x.id)
                  .toString()})`,
            },
         },
      },
      skip: compare.isSkip,
   })

   if (subsError || compareError) {
      logger(subsError || compareError)
      toast.error(
         `Could not get the ${
            compareError ? 'compare' : ''
         } sales by coupon data`
      )
      return (
         <ErrorState
            height="320px"
            message={`Could not get the ${
               compareError ? 'compare' : ''
            } sales by coupon data`}
         />
      )
   }
   if (subsLoading || status == 'loading' || compareLoading) {
      return <InlineLoader />
   }
   return (
      <>
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
               <SalesByCouponsChart
                  salesByCouponsData={salesByCouponsData.slice(0, 10)}
                  compareSalesData={
                     compareSalesData?.insights_analytics[0]
                        ?.getEarningByCoupons || []
                  }
               />
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
               <SalesByCouponsTable salesByCouponsData={salesByCouponsData} />
            </div>
         </Flex>
      </>
   )
}
const SalesByCouponsChart = props => {
   const { salesByCouponsData, compareSalesData } = props
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const { currency, compare } = brandShopDateState
   const [graphData, setGraphData] = useState([])
   // salesByCouponsData -> top 10 coupon data which generate highest revenues
   const [status, setStatus] = useState('loading')
   useEffect(() => {
      if (!compare.isSkip) {
         const dataWithCompare = salesByCouponsData.map(each => {
            each.totalEarningsCompare =
               compareSalesData.find(eachCompare => eachCompare.id == each.id)
                  ?.totalEarning || 0
            return each
         })
         setGraphData(dataWithCompare)
         setStatus('success')
      } else {
         setGraphData(salesByCouponsData)
         setStatus('success')
      }
   }, [compare])
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
                  <XAxis dataKey="code" />
                  <YAxis
                     label={{
                        value: `Sales (${currency})`,
                        angle: -90,
                        position: 'insideLeft',
                     }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar name="Earning" dataKey="totalEarning" fill="#2AC981" />
                  {!compare.isSkip && (
                     <Bar
                        name="Earning Compare"
                        dataKey="totalEarningsCompare"
                        fill="#8884d8"
                     />
                  )}
               </BarChart>
            </ResponsiveContainer>
         </Flex>
      </>
   )
}
export default SalesByCoupons
