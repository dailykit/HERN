import { Filler, Flex, Spacer, Text } from '@dailykit/ui'
import React, { useEffect, useState } from 'react'
import OrderRejectTable from './listing/orderReject'
import { TOTAL_ORDER_RECEIVED } from '../graphql/subscription'
import moment from 'moment'
import { useSubscription } from '@apollo/react-hooks'
import { BrandShopDateContext } from '../../../../BrandShopDateProvider/context'
import {
   CartesianGrid,
   Legend,
   Line,
   LineChart,
   ResponsiveContainer,
   Tooltip,
   XAxis,
   YAxis,
} from 'recharts'
import { logger } from '../../../../../utils'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../../ErrorState'
import { InlineLoader } from '../../../../InlineLoader'
const OrderRejectReport = () => {
   const { brandShopDateState, brandShopDateDispatch } =
      React.useContext(BrandShopDateContext)
   const [dataForGraph, setDataForGraph] = useState([])

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
               where: ` COALESCE("isRejected", false) = true   ${
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
               groupingSets: `(${brandShopDateState.groupBy.toString()})`,
               columns: brandShopDateState.groupBy
                  .map(group => {
                     return `EXTRACT(${group.toUpperCase()} FROM a.created_at) AS \"${group.toLowerCase()}\"`
                  })
                  .join(','),
            },
         },
      },
   })

   //subscription for compare data
   const { loading: compareLoading } = useSubscription(TOTAL_ORDER_RECEIVED, {
      variables: {
         //totalOrderReceived
         args: {
            params: {
               where: `COALESCE("isRejected", false) = true ${
                  brandShopDateState.compare.from !==
                     moment('2017 - 01 - 01') &&
                  `AND a.created_at >= '${brandShopDateState.compare.from}'`
               } ${
                  brandShopDateState.compare.from !==
                     moment('2017 - 01 - 01') &&
                  `AND a.created_at < '${brandShopDateState.compare.to}'`
               } ${
                  brandShopDateState.brandShop.brandId
                     ? `AND a."brandId" = ${brandShopDateState.brandShop.brandId}`
                     : ''
               } ${
                  brandShopDateState.brandShop.shopTitle
                     ? `AND b.source = \'${brandShopDateState.brandShop.shopTitle}\'`
                     : ''
               }`,
               groupingSets: `(${brandShopDateState.groupBy.toString()})`,
               columns: brandShopDateState.groupBy
                  .map(group => {
                     return `EXTRACT(${group.toUpperCase()} FROM a.created_at) AS \"${group.toLowerCase()}\"`
                  })
                  .join(','),
            },
         },
      },
      skip: brandShopDateState.compare.isSkip,
      onSubscriptionData: ({ subscriptionData }) => {
         brandShopDateDispatch({
            type: 'COMPARE',
            payload: { data: subscriptionData.data.insights_analytics[0] },
         })
         // setOrderCompare(prevState => ({
         //    ...prevState,
         //    data: subscriptionData.data.insights_analytics[0],
         // }))
      },
   })

   const dataGeneratorBetweenToDates = (from, to, groupBy) => {
      const insightAnalyticsData =
         insights_analytics[0]?.getOrdersRecieved.filter(
            x => x.year !== null
         ) || []
      const compareInsightAnalyticsData =
         (!brandShopDateState.compare.isSkip &&
            brandShopDateState.compare.data &&
            brandShopDateState.compare.data?.getOrdersRecieved.filter(
               x => x.year !== null
            )) ||
         []
      if (groupBy[groupBy.length - 1] == 'hour') {
         const hourBundler = (from, to, data, key1, key2, type) => {
            let hourBundle = []
            let startHourWithDate = from
            let uniqueId = 1
            const compareExtension = type == 'present' ? '' : 'Compare'
            //loop use to create a number of data (newBundle) per hour between 'from' to 'to' date
            while (startHourWithDate.diff(to, 'hours') <= 0) {
               //data in needed format
               let newBundle = {
                  [type]: moment(from).format(),
                  [key1]: 0,
                  [key2]: 0,
                  ['orderRefs' + type]: null,
                  uniqueId: uniqueId,
               }
               hourBundle.push(newBundle)
               startHourWithDate = startHourWithDate.add(1, 'hour')
               uniqueId++
            }

            /*create date in available data to easily differentiate when have same hour ex. 14 from 15-12-2020 and 14 from 14-11-2021*/
            const dataForHourWithDate = data.map(each => {
               let newDate = `${each.year}-${each.month}-${each.day}`
               each[type] = newDate
               return each
            })
            //merging process
            dataForHourWithDate.forEach(eachData => {
               //check, where available data's day and hour match
               const matchIndex = hourBundle.findIndex(eachHour => {
                  return (
                     moment(eachHour[type]).isSame(eachData[type], 'day') &&
                     moment(eachHour[type]).format('HH') == eachData.hour
                  )
               })
               //if match not found then matchIndex = -1 else...
               if (matchIndex >= 0) {
                  hourBundle[matchIndex][key1] = eachData.total
                  hourBundle[matchIndex][key2] = eachData.count
                  hourBundle[matchIndex]['rejected' + compareExtension] =
                     eachData.pending.count
                  hourBundle[matchIndex]['orderRefs' + type] =
                     eachData.orderRefs.count
               }
            })
            return hourBundle
         }
         const hourBundlePresent = hourBundler(
            from,
            to,
            insightAnalyticsData,
            'count',
            'total',
            'present'
         )
         const hourBundlePast =
            !brandShopDateState.compare.isSkip &&
            brandShopDateState.compare.data &&
            hourBundler(
               moment(brandShopDateState.compare.from),
               moment(brandShopDateState.compare.to),
               compareInsightAnalyticsData,
               'countCompare',
               'totalCompare',
               'past'
            )
         if (!hourBundlePast) {
            setDataForGraph(hourBundlePresent)
            return
         } else {
            let merged = []
            for (let i = 0; i < hourBundlePresent.length; i++) {
               merged.push({
                  ...hourBundlePresent[i],
                  ...hourBundlePast[i],
               })
            }
            setDataForGraph(merged)
         }
         return
      } else if (groupBy[groupBy.length - 1] == 'day') {
         //key1 = count //key2=total
         const dayBundler = (from, to, data, key1, key2, type) => {
            let daysBundle = []
            let startDate = from
            let uniqueId = 1
            const compareExtension = type == 'present' ? '' : 'Compare'

            while (startDate.diff(to, 'days') <= 0) {
               const newBundle = {
                  [type]: moment(startDate).format(),
                  [key1]: 0,
                  [key2]: 0,
                  ['orderRefs' + type]: null,
                  uniqueId: uniqueId,
               }
               daysBundle.push(newBundle)
               startDate = startDate.add(1, 'day')
               uniqueId++
            }

            const dataWithDate = data.map(eachData => {
               let newDate = `${eachData.year}-${eachData.month}-${eachData.day}`
               eachData[type] = newDate
               return eachData
            })
            dataWithDate.forEach(eachData => {
               const matchIndex = daysBundle.findIndex(eachDay =>
                  moment(eachDay[type]).isSame(eachData[type])
               )
               if (matchIndex >= 0) {
                  daysBundle[matchIndex][key2] = eachData.total
                  daysBundle[matchIndex][key1] = eachData.count
                  daysBundle[matchIndex]['rejected' + compareExtension] =
                     eachData.rejected.count
                  daysBundle[matchIndex]['orderRefs' + type] =
                     eachData.orderRefs.count
               }
            })
            return daysBundle
         }
         const dayBundlePresent = dayBundler(
            from,
            to,
            insightAnalyticsData,
            'count',
            'total',
            'present'
         )
         const dayBundlePast =
            !brandShopDateState.compare.isSkip &&
            brandShopDateState.compare.data &&
            dayBundler(
               moment(brandShopDateState.compare.from),
               moment(brandShopDateState.compare.to),
               compareInsightAnalyticsData,
               'countCompare',
               'totalCompare',
               'past'
            )

         if (!dayBundlePast) {
            setDataForGraph(dayBundlePresent)
            return
         } else {
            let merged = []
            for (let i = 0; i < dayBundlePresent.length; i++) {
               merged.push({
                  ...dayBundlePresent[i],
                  ...dayBundlePast[i],
               })
            }
            setDataForGraph(merged)
         }
         return
      } else if (groupBy[groupBy.length - 1] == 'week') {
         //key1 = count key2 = total
         const weekBundler = (from, to, data, key1, key2, type) => {
            let weekBundle = []
            let startWeek = from
            let uniqueId = 1
            const compareExtension = type == 'present' ? '' : 'Compare'

            while (startWeek.diff(to, 'weeks') <= 0) {
               const newBundle = {
                  [type]: moment(startWeek).format(),
                  [key1]: 0,
                  [key2]: 0,
                  ['orderRefs' + type]: null,
                  weekNumber: moment(startWeek).format('WW'),
                  uniqueId: uniqueId,
               }
               weekBundle.push(newBundle)
               startWeek = startWeek.add(1, 'week').startOf('isoWeek')
               uniqueId++
            }
            data.forEach(eachData => {
               const matchIndex = weekBundle.findIndex(
                  eachWeek =>
                     moment(eachWeek[type]).format('YYYY') == eachData.year &&
                     eachWeek.weekNumber == eachData.week
               )
               if (matchIndex >= 0) {
                  weekBundle[matchIndex][key1] = eachData.count
                  weekBundle[matchIndex][key2] = eachData.total
                  weekBundle[matchIndex]['rejected' + compareExtension] =
                     eachData.rejected.count
                  weekBundle[matchIndex]['orderRefs' + type] =
                     eachData.orderRefs
               }
            })
            return weekBundle
         }
         const weekBundlePresent = weekBundler(
            from,
            to,
            insightAnalyticsData,
            'count',
            'total',
            'present'
         )
         const weekBundlePast =
            !brandShopDateState.compare.isSkip &&
            brandShopDateState.compare.data &&
            weekBundler(
               moment(brandShopDateState.compare.from),
               moment(brandShopDateState.compare.to),
               compareInsightAnalyticsData,
               'countCompare',
               'totalCompare',
               'past'
            )

         if (!weekBundlePast) {
            setDataForGraph(weekBundlePresent)
            return
         } else {
            let merged = []
            for (let i = 0; i < weekBundlePresent.length; i++) {
               merged.push({
                  ...weekBundlePresent[i],
                  ...weekBundlePast[i],
               })
            }
            setDataForGraph(merged)
         }
         return
      } else {
         //key1 = count key2 = total
         const monthBundler = (from, to, data, key1, key2, type) => {
            let monthsBundle = []
            let startMonth = from
            let uniqueId = 1
            const compareExtension = type == 'present' ? '' : 'Compare'

            //create an array for group with year, month with data count and total call monthBundle
            while (startMonth.diff(to, 'months') <= 0) {
               const newBundle = {
                  [type]: moment(startMonth).format(),
                  [key1]: 0,
                  [key2]: 0,
                  ['orderRefs' + type]: null,

                  uniqueId: uniqueId,
               }
               monthsBundle.push(newBundle)
               startMonth = startMonth.add(1, 'month')
               uniqueId++
            }

            //in a monthBundle change to month data which has some value by dataForMonths
            data.forEach(eachData => {
               const matchIndex = monthsBundle.findIndex(
                  eachMonth =>
                     moment(eachMonth[type]).isSame(eachData[type], 'year') &&
                     moment(eachMonth[type]).format('MM') == eachData.month
               )
               if (matchIndex >= 0) {
                  monthsBundle[matchIndex][key1] = eachData.count
                  monthsBundle[matchIndex][key2] = eachData.total
                  monthsBundle[matchIndex]['rejected' + compareExtension] =
                     eachData.rejected.count
                  monthsBundle[matchIndex]['orderRefs' + type] =
                     eachData.orderRefs
               }
            })
            return monthsBundle
         }
         const monthBundlePresent = monthBundler(
            from,
            to,
            insightAnalyticsData,
            'count',
            'total',
            'present'
         )
         const monthBundlePast =
            !brandShopDateState.compare.isSkip &&
            brandShopDateState.compare.data &&
            monthBundler(
               moment(brandShopDateState.compare.from),
               moment(brandShopDateState.compare.to),
               compareInsightAnalyticsData,
               'countCompare',
               'totalCompare',
               'past'
            )
         if (!monthBundlePast) {
            setDataForGraph(monthBundlePresent)
            return
         } else {
            let merged = []
            for (let i = 0; i < monthBundlePresent.length; i++) {
               merged.push({
                  ...monthBundlePresent[i],
                  ...monthBundlePast[i],
               })
            }
            // set this monthsBundle value after change available data
            setDataForGraph(merged)
         }
         return
      }
   }

   useEffect(() => {
      if (!subsLoading) {
         if (brandShopDateState.compare.isSkip) {
            dataGeneratorBetweenToDates(
               moment(brandShopDateState.from),
               moment(brandShopDateState.to),
               brandShopDateState.groupBy
            )
         } else {
            if (brandShopDateState.compare.data) {
               dataGeneratorBetweenToDates(
                  moment(brandShopDateState.from),
                  moment(brandShopDateState.to),
                  brandShopDateState.groupBy
               )
            }
         }
      }
   }, [
      brandShopDateState.from,
      brandShopDateState.to,
      brandShopDateState.groupBy,
      brandShopDateState.compare.isSkip,
      brandShopDateState.compare.data,
      subsLoading,
   ])

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
               <OrderRejectedChart
                  dataForGraph={dataForGraph}
                  subsLoading={subsLoading}
                  subsError={subsError}
                  compareLoading={compareLoading}
               />
            </div>
            <Spacer size="20px" />
            <OrderRejectTable />
         </Flex>
      </>
   )
}
const OrderRejectedChart = ({
   dataForGraph,
   subsError,
   subsLoading,
   compareLoading,
}) => {
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const { groupBy } = brandShopDateState
   if (subsLoading || compareLoading || !dataForGraph) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState
            height="320px"
            message="Could not get the Rejected Order"
         />
      )
   }
   if (dataForGraph.length === 0) {
      return <Text as="subtitle">No Data available for graph</Text>
   }
   return (
      <>
         <Flex height="22rem">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart
                  width={500}
                  height={300}
                  data={dataForGraph}
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
                        const eachTickData = dataForGraph.find(
                           x => x.uniqueId == tick
                        )
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
                     }}
                  />
                  <YAxis />
                  <Tooltip
                     labelFormatter={label => {
                        const eachLabelData = dataForGraph.find(
                           x => x.uniqueId == label
                        )
                        const labelTime = eachLabelData.present
                        if (groupBy[groupBy.length - 1] == 'hour') {
                           return moment(labelTime).format('LT')
                        } else if (groupBy[groupBy.length - 1] == 'day') {
                           return moment(labelTime).format('DD-MMM')
                        } else if (groupBy[groupBy.length - 1] == 'week') {
                           return (
                              moment(labelTime).format('DD-MMM-YY') +
                              ' to ' +
                              moment(labelTime)
                                 .add(1, 'week')
                                 .format('DD-MMM-YY')
                           )
                        } else {
                           return moment(labelTime).format('MMM-YYYY')
                        }
                     }}
                  />
                  <Legend />
                  <Line
                     type="monotone"
                     name="Rejected Orders"
                     dataKey="count"
                     stroke="#2AC981"
                     activeDot={{ r: 8 }}
                  />
                  {!brandShopDateState.compare.isSkip &&
                     brandShopDateState.compare.data && (
                        <Line
                           type="monotone"
                           name="Rejected Orders Compare"
                           dataKey="countCompare"
                           stroke="#8884d8"
                           activeDot={{ r: 8 }}
                        />
                     )}
               </LineChart>
            </ResponsiveContainer>
         </Flex>
      </>
   )
}
export default OrderRejectReport
