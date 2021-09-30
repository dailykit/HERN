import { useSubscription } from '@apollo/react-hooks'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import '../../style.css'
import '../../tableStyle.css'
import { toast } from 'react-toastify'
import { logger } from '../../../../utils'
import { ErrorState } from '../../../ErrorState'
import { InlineLoader } from '../../../InlineLoader'
import 'react-day-picker/lib/style.css'
import { DatePicker } from 'antd'
import 'antd/dist/antd.css'
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
import {
   Spacer,
   Flex,
   useTunnel,
   Tunnels,
   Tunnel,
   TunnelHeader,
} from '@dailykit/ui'
import { groupBy } from 'lodash'

import { BrandAndShop, DateRangePicker } from '../..'
import { BRANDS, TOTAL_ORDER_RECEIVED } from '../../graphQl/subscription'
import OrderRefTable from '../OrderRefTunnel/orderRefTunnel'
import OrderSummaryTable from '../../../Reports/ReportTiles/TotalOrders/tunnels/listing/orderSummary'

const TotalOrderRecTunnel = ({ currency }) => {
   const [from, setFrom] = useState(moment().startOf('y').format('YYYY-MM-DD'))
   const [to, setTo] = useState(moment().format('YYYY-MM-DD'))
   const [compare, setCompare] = useState({
      isCompare: false,
      data: null,
      from: from,
      to: to,
      compareResult: null,
      isSkip: true,
   })
   const [groupBy, setGroupBy] = useState(['year', 'month', 'week'])
   const [graphTunnels, openGraphTunnel, closeGraphTunnel] = useTunnel(1)
   const [graphTunnelData, setGraphTunnelData] = useState({
      title: undefined,
      orderRefData: undefined,
      presentTime: undefined,
      pastTime: undefined,
   })
   const [brandShop, setBrandShop] = useState({
      brandId: undefined,
      shopTitle: false,
      brand: undefined,
   })
   const [brands, setBrands] = useState([])
   const { loading: brandLoading } = useSubscription(BRANDS, {
      onSubscriptionData: ({ subscriptionData }) => {
         const brandData = [
            { title: 'All', brandId: false },
            ...subscriptionData.data.brands,
         ]
         const newBrandData = brandData.map((brand, index) => ({
            ...brand,
            id: index + 1,
         }))
         setBrands(newBrandData)
      },
   })

   //initial data
   const {
      data: { insights_analytics = [] } = {},
      loading: subsLoading,
      error: subsError,
   } = useSubscription(TOTAL_ORDER_RECEIVED, {
      variables: {
         //totalOrderReceived
         args: {
            params: {
               where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
                  from !== moment('2017 - 01 - 01') &&
                  `AND a.created_at >= '${from}'`
               } ${
                  from !== moment('2017 - 01 - 01') &&
                  `AND a.created_at < '${to}'`
               } ${
                  brandShop.brandId
                     ? `AND a."brandId" = ${brandShop.brandId}`
                     : ''
               } ${
                  brandShop.shopTitle
                     ? `AND b.source = \'${brandShop.shopTitle}\'`
                     : ''
               }`,
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
   // subscription for compare data
   useSubscription(TOTAL_ORDER_RECEIVED, {
      variables: {
         //totalOrderReceived
         args: {
            params: {
               where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
                  from !== moment('2017 - 01 - 01') &&
                  `AND a.created_at >= '${from}'`
               } ${
                  from !== moment('2017 - 01 - 01') &&
                  `AND a.created_at < '${to}'`
               } ${
                  brandShop.brandId
                     ? `AND a."brandId" = ${brandShop.brandId}`
                     : ''
               } ${
                  brandShop.shopTitle
                     ? `AND b.source = \'${brandShop.shopTitle}\'`
                     : ''
               }`,
               groupingSets: `(${groupBy.toString()})`,
               columns: groupBy
                  .map(group => {
                     return `EXTRACT(${group.toUpperCase()} FROM a.created_at) AS \"${group.toLowerCase()}\"`
                  })
                  .join(','),
            },
         },
      },
      skip: compare.isSkip,
      onSubscriptionData: ({ subscriptionData }) => {
         setCompare(prevState => ({
            ...prevState,
            data: subscriptionData.data.insights_analytics[0],
         }))
      },
   })
   if (brandLoading) {
      return <InlineLoader />
   }
   return (
      <TunnelBody>
         <Tunnels tunnels={graphTunnels}>
            <Tunnel size="full" layer={1}>
               <TunnelHeader
                  title={graphTunnelData.title}
                  close={() => {
                     setGraphTunnelData({
                        title: undefined,
                        orderRefData: undefined,
                     })
                     closeGraphTunnel(1)
                  }}
                  description="This is a graph Tunnel"
               />
               <OrderRefTable
                  graphTunnelData={graphTunnelData}
                  groupBy={groupBy}
               />
            </Tunnel>
         </Tunnels>
         <BrandAndShop
            brands={brands}
            setBrandShop={setBrandShop}
            brandShop={brandShop}
         />
         <Spacer size="10px" />
         <DateRangePicker
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
            setGroupBy={setGroupBy}
            compare={compare}
            setCompare={setCompare}
         />
         <Spacer size="10px" />
         <DrillDownLineChart
            from={from}
            to={to}
            groupBy={groupBy}
            dataOf="count"
            insightAnalyticsData={
               insights_analytics[0]?.getOrdersRecieved.filter(
                  x => x.year !== null
               ) || []
            }
            compare={compare}
            compareInsightAnalyticsData={
               (!compare.isSkip &&
                  compare.data &&
                  compare.data?.getOrdersRecieved.filter(
                     x => x.year !== null
                  )) ||
               []
            }
            setGraphTunnelData={setGraphTunnelData}
            openGraphTunnel={openGraphTunnel}
            graphTunnelTitle="Total Earning"
            subsLoading={subsLoading}
            subsError={subsError}
            currency={currency}
         />
         <Spacer size="20px" />
         <OrderSummaryTable from={from} to={to} brandShop={brandShop} />
      </TunnelBody>
   )
}

const DrillDownLineChart = ({
   insightAnalyticsData,
   from,
   to,
   groupBy,
   compare,
   compareInsightAnalyticsData,
   setGraphTunnelData,
   openGraphTunnel,
   graphTunnelTitle,
   subsError,
   subsLoading,
}) => {
   const [dataForGraph, setDataForGraph] = useState(undefined)

   const dataGeneratorBetweenToDates = (from, to, groupBy) => {
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
                  hourBundle[matchIndex]['pending' + compareExtension] =
                     eachData.pending.count
                  hourBundle[matchIndex]['delivered' + compareExtension] =
                     eachData.delivered.count
                  hourBundle[matchIndex]['readyToAssemble' + compareExtension] =
                     eachData.readyToAssemble.count
                  hourBundle[matchIndex]['readyToDispatch' + compareExtension] =
                     eachData.readyToDispatch.count
                  hourBundle[matchIndex]['underProcessing' + compareExtension] =
                     eachData.underProcessing.count
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
            !compare.isSkip &&
            compare.data &&
            hourBundler(
               moment(compare.from),
               moment(compare.to),
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
                  daysBundle[matchIndex]['pending' + compareExtension] =
                     eachData.pending.count
                  daysBundle[matchIndex]['delivered' + compareExtension] =
                     eachData.delivered.count
                  daysBundle[matchIndex]['readyToAssemble' + compareExtension] =
                     eachData.readyToAssemble.count
                  daysBundle[matchIndex]['readyToDispatch' + compareExtension] =
                     eachData.readyToDispatch.count
                  daysBundle[matchIndex]['underProcessing' + compareExtension] =
                     eachData.underProcessing.count
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
            !compare.isSkip &&
            compare.data &&
            dayBundler(
               moment(compare.from),
               moment(compare.to),
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
                  weekBundle[matchIndex]['pending' + compareExtension] =
                     eachData.pending.count
                  weekBundle[matchIndex]['delivered' + compareExtension] =
                     eachData.delivered.count
                  weekBundle[matchIndex]['readyToAssemble' + compareExtension] =
                     eachData.readyToAssemble.count
                  weekBundle[matchIndex]['readyToDispatch' + compareExtension] =
                     eachData.readyToDispatch.count
                  weekBundle[matchIndex]['underProcessing' + compareExtension] =
                     eachData.underProcessing.count
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
            !compare.isSkip &&
            compare.data &&
            weekBundler(
               moment(compare.from),
               moment(compare.to),
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
                  monthsBundle[matchIndex]['pending' + compareExtension] =
                     eachData.pending.count
                  monthsBundle[matchIndex]['delivered' + compareExtension] =
                     eachData.delivered.count
                  monthsBundle[matchIndex][
                     'readyToAssemble' + compareExtension
                  ] = eachData.readyToAssemble.count
                  monthsBundle[matchIndex][
                     'readyToDispatch' + compareExtension
                  ] = eachData.readyToDispatch.count
                  monthsBundle[matchIndex][
                     'underProcessing' + compareExtension
                  ] = eachData.underProcessing.count
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
            !compare.isSkip &&
            compare.data &&
            monthBundler(
               moment(compare.from),
               moment(compare.to),
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
         if (compare.isSkip) {
            dataGeneratorBetweenToDates(moment(from), moment(to), groupBy)
         } else {
            if (compare.data) {
               dataGeneratorBetweenToDates(moment(from), moment(to), groupBy)
            }
         }
      }
   }, [
      from,
      to,
      groupBy,
      compare,
      subsLoading,
      insightAnalyticsData,
      compareInsightAnalyticsData,
   ])
   const handleBarClick = (data, index) => {
      if (data.orderRefspresent || data.orderRefspast) {
         setGraphTunnelData(prevState => ({
            ...prevState,
            title: graphTunnelTitle,
            orderRefData: [data.orderRefspresent, data.orderRefspast],
            presentTime: data.present,
            pastTime: data.past,
         }))
         openGraphTunnel(1)
      }
   }
   if (subsLoading || !dataForGraph) {
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
      <div
         style={{
            background: '#FFFFFF',
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
            borderRadius: '10px',
            padding: '40px 40px 10px 0px',
         }}
      >
         <Flex height="22rem">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart
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
                  {!compare.isSkip && compare.data && (
                     <Bar
                        type="monotone"
                        name=" "
                        dataKey="pendingCompare"
                        stackId="b"
                        fill="#619ED6"
                        onClick={handleBarClick}
                        cursor="pointer"
                     />
                  )}
                  <Bar
                     type="monotone"
                     name="Pending"
                     dataKey="pending"
                     stackId="a"
                     fill="#619ED6"
                     onClick={handleBarClick}
                     cursor="pointer"
                  />
                  {!compare.isSkip && compare.data && (
                     <Bar
                        type="monotone"
                        name=" "
                        dataKey="deliveredCompare"
                        stackId="b"
                        fill="#6BA547"
                        onClick={handleBarClick}
                        cursor="pointer"
                     />
                  )}
                  <Bar
                     type="monotone"
                     name="Delivered"
                     dataKey="delivered"
                     stackId="a"
                     fill="#6BA547"
                     onClick={handleBarClick}
                     cursor="pointer"
                  />
                  {!compare.isSkip && compare.data && (
                     <Bar
                        type="monotone"
                        name=" "
                        dataKey="readyToAssembleCompare"
                        stackId="b"
                        fill="#F7D027"
                        onClick={handleBarClick}
                        cursor="pointer"
                     />
                  )}
                  <Bar
                     type="monotone"
                     name="Ready To Assemble"
                     dataKey="readyToAssemble"
                     stackId="a"
                     fill="#F7D027"
                     onClick={handleBarClick}
                     cursor="pointer"
                  />
                  {!compare.isSkip && compare.data && (
                     <Bar
                        type="monotone"
                        name=" "
                        dataKey="readyToDispatchCompare"
                        stackId="b"
                        fill="#E48F1B"
                        onClick={handleBarClick}
                        cursor="pointer"
                     />
                  )}
                  <Bar
                     type="monotone"
                     name="Ready To Dispatch"
                     dataKey="readyToDispatch"
                     stackId="a"
                     fill="#E48F1B"
                     onClick={handleBarClick}
                     cursor="pointer"
                  />
                  {!compare.isSkip && compare.data && (
                     <Bar
                        type="monotone"
                        name=" "
                        dataKey="underProcessingCompare"
                        stackId="b"
                        fill="#B77EA3"
                        onClick={handleBarClick}
                        cursor="pointer"
                     />
                  )}
                  <Bar
                     type="monotone"
                     name="Under Processing"
                     dataKey="underProcessing"
                     stackId="a"
                     fill="#B77EA3"
                     onClick={handleBarClick}
                     cursor="pointer"
                  />
               </BarChart>
            </ResponsiveContainer>
         </Flex>
      </div>
   )
}
const TunnelBody = styled.div`
   padding: 10px 16px 0px 32px;
   height: calc(100% - 103px);
   overflow: auto;
`

export default TotalOrderRecTunnel
