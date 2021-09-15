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
import { DatePicker, Space } from 'antd'
import 'antd/dist/antd.css'
import {
   CartesianGrid,
   Legend,
   Line,
   LineChart,
   ResponsiveContainer,
   Text,
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

import { BrandAndShop, DateRangePicker } from '../..'
import { BRANDS, GET_TOTAL_EARNING } from '../../graphQl/subscription'
import OrderRefTable from '../OrderRefTunnel/orderRefTunnel'
import EarningTable from './Listing/TotalEarningListing'

const TotalEarningTunnel = ({ currency }) => {
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
   const [groupBy, setGroupBy] = useState([
      'year',
      'month',
      'week',
      'day',
      'hour',
   ])
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
   } = useSubscription(GET_TOTAL_EARNING, {
      fetchPolicy: 'network-only',
      variables: {
         //totalEarning
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
               columns:
                  groupBy
                     .map(group => {
                        return `EXTRACT(${group.toUpperCase()} FROM a.created_at) AS \"${group.toLowerCase()}\"`
                     })
                     .join(',') +
                  `,SUM(tax) AS \"totalTax\",SUM(discount) AS \"totalDiscount\",SUM(\"deliveryPrice\") AS \"totalDeliveryPrice\"`,
            },
         },
      },
   })
   console.log('newEarning', insights_analytics)
   // subscription for compare data
   useSubscription(GET_TOTAL_EARNING, {
      fetchPolicy: 'network-only',
      variables: {
         //totalEarning
         args: {
            params: {
               where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
                  compare.from !== moment('2017 - 01 - 01') &&
                  `AND a.created_at >= '${compare.from}'`
               } ${
                  compare.from !== moment('2017 - 01 - 01') &&
                  `AND a.created_at < '${compare.to}'`
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
         <Flex padding="0 52px">
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
         </Flex>
         <Spacer size="10px" />
         <DrillDownLineChart
            from={from}
            to={to}
            groupBy={groupBy}
            dataOf="total"
            insightAnalyticsData={
               insights_analytics[0]?.getTotalEarnings.slice(1) || []
            }
            compare={compare}
            compareInsightAnalyticsData={
               !compare.isSkip &&
               compare.data &&
               compare.data.getTotalEarnings.slice(1)
            }
            setGraphTunnelData={setGraphTunnelData}
            openGraphTunnel={openGraphTunnel}
            graphTunnelTitle="Total Earning"
            subsLoading={subsLoading}
            subsError={subsError}
            currency={currency}
         />
      </TunnelBody>
   )
}

const DrillDownLineChart = ({
   insightAnalyticsData,
   from,
   to,
   dataOf,
   groupBy,
   compare,
   compareInsightAnalyticsData,
   setGraphTunnelData,
   openGraphTunnel,
   graphTunnelTitle,
   subsError,
   subsLoading,
   currency,
}) => {
   const [dataForGraph, setDataForGraph] = useState([])

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
                  ['onDemand' + compareExtension]: 0,
                  ['subscription' + compareExtension]: 0,
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
                  hourBundle[matchIndex]['onDemand' + compareExtension] =
                     eachData.onDemand || 0
                  hourBundle[matchIndex]['subscription' + compareExtension] =
                     eachData.subscription || 0
                  hourBundle[matchIndex]['orderRefs' + type] =
                     eachData.orderRefs
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
                  daysBundle[matchIndex]['onDemand' + compareExtension] =
                     eachData.onDemand || 0
                  daysBundle[matchIndex]['subscription' + compareExtension] =
                     eachData.subscription || 0
                  daysBundle[matchIndex]['orderRefs' + type] =
                     eachData.orderRefs
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
                  weekBundle[matchIndex]['onDemand' + compareExtension] =
                     eachData.onDemand || 0
                  weekBundle[matchIndex]['subscription' + compareExtension] =
                     eachData.subscription || 0
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
                  monthsBundle[matchIndex]['onDemand' + compareExtension] =
                     eachData.onDemand || 0
                  monthsBundle[matchIndex]['subscription' + compareExtension] =
                     eachData.subscription || 0
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
            setDataForGraph(merged)
         }
         // set this monthsBundle value after change available data
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

   if (subsLoading) {
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
         <div
            style={{
               background: '#FFFFFF',
               boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
               borderRadius: '10px',
               padding: '40px 40px 10px 0px',
               margin: '0 42px',
            }}
         >
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
                        dataKey="present"
                        tickFormatter={tick =>
                           moment(tick).format('YYYY-MM-DD')
                        }
                        ticks={dataForGraph.map(x => x.present)}
                     />
                     <YAxis />
                     <Tooltip
                        content={
                           <CustomTooltip
                              groupBy={groupBy[groupBy.length - 1]}
                              dataOf={dataOf}
                              currency={currency}
                              isCompareSkip={compare.isSkip}
                           />
                        }
                     />
                     <Legend />
                     <Line
                        type="monotone"
                        name="Earning"
                        dataKey={dataOf}
                        stroke="#2AC981"
                        strokeWidth={2}
                        activeDot={{
                           onClick: (event, payload) => {
                              if (
                                 payload.payload.orderRefspresent ||
                                 payload.payload.orderRefspast
                              ) {
                                 setGraphTunnelData(prevState => ({
                                    ...prevState,
                                    title: graphTunnelTitle,
                                    orderRefData: [
                                       payload.payload.orderRefspresent,
                                       payload.payload.orderRefspast,
                                    ],
                                    presentTime: payload.payload.present,
                                    pastTime: payload.payload.past,
                                 }))
                                 openGraphTunnel(1)
                              }
                           },
                           cursor: 'pointer',
                        }}
                     />
                     {!compare.isSkip && compare.data && (
                        <Line
                           type="monotone"
                           name="Compare Earning"
                           dataKey={dataOf + 'Compare'}
                           stroke="#8884d8"
                           activeDot={{ r: 4 }}
                           strokeWidth={2}
                        />
                     )}
                  </LineChart>
               </ResponsiveContainer>
            </Flex>
         </div>
         <Spacer size="20px" />
         <div
            style={{
               background: '#FFFFFF',
               boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
               borderRadius: '10px',
               padding: '10px 0px',
               margin: '0 42px',
            }}
         >
            <EarningTable data={insightAnalyticsData} />
         </div>
      </>
   )
}
const TunnelBody = styled.div`
   padding: 10px 16px 0px 32px;
   height: calc(100% - 103px);
   overflow: auto;
`
const CustomTooltip = ({
   active,
   payload,
   dataOf,
   currency,
   isCompareSkip,
   groupBy,
}) => {
   if (active && payload && payload.length) {
      const date = payload[0].payload['present']
      let timeToBeShow = ''
      if (groupBy == 'hour') {
         timeToBeShow = moment(date).format('LT')
      } else if (groupBy == 'day') {
         timeToBeShow = moment(date).format('DD-MMM')
      } else if (groupBy == 'week') {
         timeToBeShow =
            moment(date).format('DD-MMM-YY') +
            ' to ' +
            moment(date).add(1, 'week').format('DD-MMM-YY')
      } else {
         timeToBeShow = moment(date).format('MMM-YYYY')
      }
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
            <Text as="text3">{timeToBeShow}</Text>
            <Flex>
               {`${dataOf.toUpperCase()}: `}{' '}
               <span style={{ color: '#2AC981' }}>
                  {`${currency}${payload[0].payload[dataOf]} `}
               </span>
               {!isCompareSkip ? (
                  <span style={{ color: '#8884d8' }}>
                     {`${currency}${
                        payload[0].payload[dataOf + 'Compare'] || 0
                     }`}
                  </span>
               ) : null}
            </Flex>
            <Flex>
               {`onDemand`}{' '}
               <span style={{ color: '#2AC981' }}>
                  {`${currency}${payload[0].payload['onDemand'] || 0} `}
               </span>
               {!isCompareSkip ? (
                  <span style={{ color: '#8884d8' }}>
                     {`${currency}${
                        payload[0].payload['onDemand' + 'Compare'] || 0
                     }`}
                  </span>
               ) : null}
            </Flex>
            <Flex>
               {`Subscription`}{' '}
               <span style={{ color: '#2AC981' }}>
                  {`${currency}${payload[0].payload['subscription'] || 0} `}
               </span>
               {!isCompareSkip ? (
                  <span style={{ color: '#8884d8' }}>
                     {`${currency}${
                        payload[0].payload['subscription' + 'Compare'] || 0
                     }`}
                  </span>
               ) : null}
            </Flex>
         </div>
      )
   }

   return null
}

export default TotalEarningTunnel
