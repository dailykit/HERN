import { useSubscription } from '@apollo/react-hooks'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import './style.css'
import './tableStyle.css'
import { Expand } from '../../assets/icons'
import { toast } from 'react-toastify'
import { logger } from '../../utils'
import { Tile, Tiles } from '../DashboardTiles'
import { ErrorState } from '../ErrorState'
import { InlineLoader } from '../InlineLoader'
import { INSIGHT_ANALYTICS } from './graphQl/queries'
import 'react-day-picker/lib/style.css'
import { DatePicker, Space } from 'antd'
import 'antd/dist/antd.css'
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts'
import moment from 'moment'
import TableOptions from './tableOptions'
import {
   Dropdown,
   Text,
   Spacer,
   TextButton,
   ButtonGroup,
   Flex,
   RadioGroup,
   Tunnels,
   Tunnel,
   useTunnel,
   TunnelHeader,
} from '@dailykit/ui'
import { groupBy } from 'lodash'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { useTabs } from '../../providers'
import { BRANDS } from './graphQl/subscription'
import {
   TotalEarningTunnel,
   TotalOrderRecTunnel,
} from './Tunnels/DrillDownTunnel'
import OrderRefTable from './Tunnels/OrderRefTunnel/orderRefTunnel'
import {
   AnalyticsApiArgsContext,
   AnalyticsApiArgsProvider,
} from './context/apiArgs'
import {
   AcceptedAndRejectedAnalytics,
   OrderReceivedAnalytics,
   TotalEarningAnalytics,
   SubscribedCustomerAnalytics,
   RegisteredCustomerAnalytics,
} from './Analytics'
const { RangePicker } = DatePicker

//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}
const DashboardAnalyticsProvider = ({ children }) => {
   return (
      <AnalyticsApiArgsProvider>
         <DashboardAnalytics>{children}</DashboardAnalytics>
      </AnalyticsApiArgsProvider>
   )
}
const DashboardAnalytics = ({ children }) => {
   const [from, setFrom] = useState(moment().startOf('y').format('YYYY-MM-DD'))
   const [to, setTo] = useState(
      localStorage.getItem('analyticsDateTo') || moment().format('YYYY-MM-DD')
   )
   const [compare, setCompare] = useState({
      isCompare: false,
      data: null,
      isRun: false,
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

   if (brandLoading) {
      return <InlineLoader />
   }
   return (
      <>
         <Spacer size="10px" />
         <Flex padding="0px 0px">
            <BrandAndShop
               brands={brands}
               setBrandShop={setBrandShop}
               brandShop={brandShop}
               global
            />
            <Spacer size="10px" />
            <DateRangePicker
               from={from}
               to={to}
               setFrom={setFrom}
               setTo={setTo}
               compare={compare}
               setCompare={setCompare}
               setGroupBy={setGroupBy}
               global
            />
            <Spacer size="10px" />
            <DashboardAnalyticsTiles>{children}</DashboardAnalyticsTiles>
         </Flex>
      </>
   )
}
export default DashboardAnalyticsProvider
export const BrandAndShop = ({ brands, setBrandShop, brandShop, global }) => {
   const { analyticsApiArgsDispatch } = React.useContext(
      AnalyticsApiArgsContext
   )
   const [shopSource] = useState([
      {
         id: 1,
         title: 'All',
         payload: false,
      },
      {
         id: 2,
         title: 'Subscription',
         payload: 'subscription',
      },
      {
         id: 3,
         title: 'A-la-Carte',
         payload: 'a-la-carte',
      },
   ])
   const selectedOptionShop = option => {
      if (global) {
         analyticsApiArgsDispatch({
            type: 'BRANDSHOP',
            payload: {
               shopTitle: option.payload,
            },
         })
      } else {
         setBrandShop(prevState => ({
            ...prevState,
            shopTitle: option.payload,
         }))
      }
   }
   const selectedOptionBrand = option => {
      if (global) {
         analyticsApiArgsDispatch({
            type: 'BRANDSHOP',
            payload: {
               brandId: option.brandId,
            },
         })
      } else {
         setBrandShop(prevState => ({ ...prevState, brandId: option.id }))
      }
   }
   const searchedOption = option => console.log(option)
   return (
      <Flex container flexDirection="row" width="40rem" alignItems="center">
         <Flex container flexDirection="column" width="30rem">
            <Text as="text1">Shop Type:</Text>
            <Spacer size="3px" />
            <Dropdown
               type="single"
               defaultValue={1}
               options={shopSource}
               searchedOption={searchedOption}
               selectedOption={selectedOptionShop}
               typeName="Shop"
            />
         </Flex>
         <Spacer size="20px" xAxis />
         <Flex container flexDirection="column" width="30rem">
            <Text as="text1">Brand:</Text>
            <Spacer size="3px" />
            <Dropdown
               type="single"
               options={brands}
               defaultValue={1}
               searchedOption={searchedOption}
               selectedOption={selectedOptionBrand}
               typeName="Brand"
            />
         </Flex>
      </Flex>
   )
}
export const DateRangePicker = ({
   setFrom,
   setTo,
   from,
   to,
   setGroupBy,
   setCompare,
   compare,
   global,
}) => {
   const [compareOptions, setCompareOptions] = useState(undefined)
   const { analyticsApiArgsDispatch } = React.useContext(
      AnalyticsApiArgsContext
   )
   useEffect(() => {
      handleCompareClick()
   }, [from, to])

   //handle date change in datePicker
   const onChange = (dates, dateStrings) => {
      if (dates) {
         setFrom(dateStrings[0])
         setTo(dateStrings[1])
         if (global) {
            analyticsApiArgsDispatch({ type: 'FROM', payload: dateStrings[0] })
            analyticsApiArgsDispatch({ type: 'TO', payload: dateStrings[1] })
         }
         // localStorage.setItem('analyticsDateFrom', dateStrings[0])
         // localStorage.setItem('analyticsDateTo', dateStrings[1])
      } else {
         setFrom(moment().format('YYYY-MM-DD'))
         setTo(moment().add(1, 'd').format('YYYY-MM-DD'))
         if (global) {
            analyticsApiArgsDispatch({
               type: 'FROM',
               payload: moment().format('YYYY-MM-DD'),
            })
            analyticsApiArgsDispatch({
               type: 'TO',
               payload: moment().add(1, 'd').format('YYYY-MM-DD'),
            })
         }
      }
   }

   const handleCompareClick = () => {
      // this function will manage compare dropdown options according to date range
      /*
      option would be Last period, Last Week, Last Month, Last Year
      */
      const dateDifference = moment(to).diff(from, 'days')

      const toBeDropdownOptions = [
         {
            id: 1,
            title: 'Last Period',
            description: `${moment(from)
               .subtract(moment(to).diff(from, 'days') + 1, 'day')
               .format('ll')} to ${moment(from)
               .subtract(1, 'day')
               .format('ll')}`,
            payload: {
               from: moment(from)
                  .subtract(moment(to).diff(from, 'days') + 1, 'day')
                  .format('YYYY-MM-DD'),
               to: moment(from).subtract(1, 'day').format('YYYY-MM-DD'),
            },
         },
      ]

      if (dateDifference <= 7) {
         const newOption = {
            id: toBeDropdownOptions.length + 1,
            title: 'Last Week',
            description: `${moment(from)
               .subtract(1, 'week')
               .format('ll')} to ${moment(to)
               .subtract(1, 'week')
               .format('ll')}`,
            payload: {
               from: moment(from).subtract(1, 'week').format('YYYY-MM-DD'),
               to: moment(to).subtract(1, 'week').format('YYYY-MM-DD'),
            },
         }
         toBeDropdownOptions.push(newOption)
      }
      if (dateDifference <= 30) {
         const newOption = {
            id: toBeDropdownOptions.length + 1,
            title: 'Last Month',
            description: `${moment(from)
               .subtract(1, 'month')
               .format('ll')} to ${moment(to)
               .subtract(1, 'month')
               .format('ll')}`,
            payload: {
               from: moment(from).subtract(1, 'month').format('YYYY-MM-DD'),
               to: moment(to).subtract(1, 'month').format('YYYY-MM-DD'),
            },
         }
         toBeDropdownOptions.push(newOption)
      }
      if (dateDifference < 365) {
         const newOption = {
            id: toBeDropdownOptions.length + 1,
            title: 'Last Year',
            description: `${moment(from)
               .subtract(1, 'year')
               .format('ll')} to ${moment(to)
               .subtract(1, 'year')
               .format('ll')}`,
            payload: {
               from: moment(from).subtract(1, 'year').format('YYYY-MM-DD'),
               to: moment(to).subtract(1, 'year').format('YYYY-MM-DD'),
            },
         }
         toBeDropdownOptions.push(newOption)
      }
      setCompareOptions(toBeDropdownOptions)
   }

   const selectedOption = option => {
      setCompare(prevState => ({
         ...prevState,
         isSkip: false,
         from: option.payload.from,
         to: option.payload.to,
      }))
      if (global) {
         analyticsApiArgsDispatch({
            type: 'COMPARE',
            payload: {
               isSkip: false,
               from: option.payload.from,
               to: option.payload.to,
            },
         })
      }
   }
   const searchedOption = option => console.log(option)
   return (
      <>
         <Flex container justifyContent="space-between" alignItems="center">
            <Flex container alignItems="center">
               <Space direction="vertical" size={12}>
                  <RangePicker
                     allowClear={false}
                     defaultValue={[
                        moment(from, 'YYYY-MM-DD'),
                        moment(to, 'YYYY-MM-DD'),
                     ]}
                     ranges={{
                        Today: [moment(), moment()],
                        'This Week': [moment().startOf('week'), moment()],
                        'Last Week': [
                           moment().subtract(1, 'week').startOf('week'),
                           moment().subtract(1, 'week').endOf('week'),
                        ],
                        'This Month': [
                           moment().startOf('month'),
                           moment().endOf('month'),
                        ],
                        'Last Month': [
                           moment().subtract(1, 'month').startOf('month'),
                           moment().subtract(1, 'month').endOf('month'),
                        ],
                        'This Year': [moment().startOf('year'), moment()],
                        'Last Year': [
                           moment().subtract(1, 'year').startOf('year'),
                           moment().subtract(1, 'year').endOf('year'),
                        ],
                        'All Time': [moment('2017-01-01'), moment()],
                     }}
                     onChange={onChange}
                  />
               </Space>
               <Spacer xAxis size="10px" />
               {!compare.isCompare && (
                  <ButtonGroup align="left">
                     <TextButton
                        type="ghost"
                        size="sm"
                        onClick={() => {
                           setCompare(prevState => ({
                              ...prevState,
                              isCompare: true,
                           }))
                           if (global) {
                              analyticsApiArgsDispatch({
                                 type: 'COMPARE',
                                 payload: {
                                    isCompare: true,
                                 },
                              })
                           }
                           handleCompareClick()
                        }}
                     >
                        Compare
                     </TextButton>
                  </ButtonGroup>
               )}
               {compare.isCompare && (
                  <>
                     {compareOptions && (
                        <Flex container width="14rem">
                           <Dropdown
                              type="single"
                              options={compareOptions}
                              searchedOption={searchedOption}
                              selectedOption={selectedOption}
                              typeName="compare range"
                           />
                        </Flex>
                     )}
                     <ButtonGroup align="left">
                        <TextButton
                           type="ghost"
                           size="sm"
                           onClick={() => {
                              setCompare(prevState => ({
                                 ...prevState,
                                 isCompare: false,
                                 isSkip: true,
                              }))
                              if (global) {
                                 analyticsApiArgsDispatch({
                                    type: 'COMPARE',
                                    payload: {
                                       compare: false,
                                       isSkip: true,
                                    },
                                 })
                              }
                              setCompareOptions(undefined)
                           }}
                        >
                           Close
                        </TextButton>
                     </ButtonGroup>
                  </>
               )}
            </Flex>
            <Flex>
               <GroupByButtons
                  from={from}
                  to={to}
                  setGroupBy={setGroupBy}
                  global={global}
               />
            </Flex>
         </Flex>
      </>
   )
}

const DashboardAnalyticsTiles = ({ children }) => {
   return (
      <>
         <Tiles>{children}</Tiles>
      </>
   )
}

export const SparkChart = ({
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
}) => {
   const [dataForGraph, setDataForGraph] = useState(undefined)

   const CustomTooltip = ({ active, payload, label, groupBy, dataOf }) => {
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
               {groupBy == 'hour' && (
                  <>
                     <Text as="text3">
                        {moment(payload[0]['payload']['present']).format(
                           'YYYY-MM-DD'
                        )}
                        {'  '}
                        {moment(payload[0]['payload']['present']).format('LT')}
                     </Text>
                     {!compare.isSkip && (
                        <Text as="text3">
                           {moment(payload[0]['payload']['past']).format(
                              'YYYY-MM-DD'
                           )}
                           {'  '}
                           {moment(payload[0]['payload']['past']).format('LT')}
                        </Text>
                     )}
                  </>
               )}
               {groupBy == 'day' && (
                  <>
                     <Text as="text3">
                        {moment(payload[0]['payload']['present']).format(
                           'YYYY-MM-DD'
                        )}
                     </Text>
                     {!compare.isSkip && (
                        <Text as="text3">
                           {moment(payload[0]['payload']['past']).format(
                              'YYYY-MM-DD'
                           )}
                        </Text>
                     )}
                  </>
               )}
               {groupBy == 'week' && (
                  <>
                     <Text as="text3">
                        {moment(payload[0]['payload']['present']).format('ll')}{' '}
                        {'- '}
                        {moment(payload[0]['payload']['present'])
                           .add(1, 'week')
                           .format('ll')}
                     </Text>
                     {!compare.isSkip && (
                        <Text as="text3">
                           {moment(payload[0]['payload']['past']).format('ll')}{' '}
                           {'- '}
                           {moment(payload[0]['payload']['past'])
                              .add(1, 'week')
                              .format('ll')}
                        </Text>
                     )}
                  </>
               )}
               {groupBy == 'month' && (
                  <>
                     <Text as="text3">
                        {moment(payload[0]['payload']['present']).format(
                           'MMM-YYYY'
                        )}
                     </Text>
                     {!compare.isSkip && (
                        <Text as="text3">
                           {moment(payload[0]['payload']['past']).format(
                              'MMM-YYYY'
                           )}
                        </Text>
                     )}
                  </>
               )}
               <Spacer size="3px" />
               <Text as="text3">{`${dataOf.toUpperCase()}: ${
                  payload[0].payload[dataOf]
               }`}</Text>
               {!compare.isSkip && (
                  <Text as="text3">{`${dataOf.toUpperCase()}: ${
                     payload[0].payload[dataOf + 'Compare']
                  }`}</Text>
               )}
            </div>
         )
      }

      return null
   }

   const dataGeneratorBetweenToDates = (from, to, groupBy) => {
      if (groupBy[groupBy.length - 1] == 'hour') {
         const hourBundler = (from, to, data, key1, key2, type) => {
            let hourBundle = []
            let startHourWithDate = from
            let uniqueId = 1
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
            compareInsightAnalyticsData &&
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
            compareInsightAnalyticsData &&
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
            compareInsightAnalyticsData &&
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
            compareInsightAnalyticsData &&
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
      if (compare.isSkip) {
         dataGeneratorBetweenToDates(moment(from), moment(to), groupBy)
      } else {
         if (compareInsightAnalyticsData) {
            dataGeneratorBetweenToDates(moment(from), moment(to), groupBy)
         }
      }
   }, [from, to, groupBy, compare, compareInsightAnalyticsData])
   return (
      <>
         <AreaChart
            width={300}
            height={200}
            data={dataForGraph}
            margin={{
               top: 10,
               right: 30,
               left: 0,
               bottom: 0,
            }}
         >
            <XAxis dataKey="uniqueId" hide={true}></XAxis>
            <YAxis hide={true} />
            <Tooltip
               content={
                  <CustomTooltip
                     groupBy={groupBy[groupBy.length - 1]}
                     dataOf={dataOf}
                  />
               }
            />
            <Area
               type="monotone"
               dataKey={dataOf}
               stroke="#8884d8"
               fill="#8884d8"
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
            {!compare.isSkip && compareInsightAnalyticsData && (
               <Area
                  type="monotone"
                  dataKey={dataOf + 'Compare'}
                  stroke="#C9D8B6"
                  fill="#C9D8B6"
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
            )}
         </AreaChart>
         <Flex
            container
            flexDirection="row"
            width="100%"
            justifyContent="space-between"
            padding="4px 4px"
         >
            <Text as="helpText">
               {from ? moment(from).format('MMM Do YY') : 'Starting'}
            </Text>
            <Text as="helpText">
               {to
                  ? moment(to).format('MMM Do YY')
                  : moment().format('MMM Do YY')}
            </Text>
         </Flex>
      </>
   )
}

const GroupByButtons = ({ from, to, setGroupBy, global }) => {
   const [options, setOptions] = React.useState(null)
   const { analyticsApiArgsDispatch } = React.useContext(
      AnalyticsApiArgsContext
   )
   const groupByDispatcher = groupArr => {
      if (global) {
         analyticsApiArgsDispatch({ type: 'GROUPBY', payload: groupArr })
      }
   }
   const buttonMagic = () => {
      if (moment(to).diff(from, 'days') <= 7) {
         setGroupBy(['year', 'month', 'week', 'day', 'hour'])
         groupByDispatcher(['year', 'month', 'week', 'day', 'hour'])
         return setOptions([
            {
               id: 1,
               title: 'Hour',
            },
            {
               id: 2,
               title: 'Day',
            },
         ])
      } else if (
         moment(to).diff(from, 'days') > 7 &&
         moment(to).diff(from, 'days') <= 28
      ) {
         setGroupBy(['year', 'month', 'week', 'day'])
         groupByDispatcher(['year', 'month', 'week', 'day'])
         return setOptions([
            {
               id: 1,
               title: 'Day',
            },
            {
               id: 2,
               title: 'Week',
            },
         ])
      } else if (
         moment(to).diff(from, 'days') > 28 &&
         moment(to).diff(from, 'days') <= 365
      ) {
         setGroupBy(['year', 'month', 'week'])
         groupByDispatcher(['year', 'month', 'week'])
         return setOptions([
            {
               id: 1,
               title: 'Week',
            },
            {
               id: 2,
               title: 'Month',
            },
         ])
      } else {
         setGroupBy(['year', 'month'])
         groupByDispatcher(['year', 'month'])
         return setOptions([
            {
               id: 1,
               title: 'Week',
            },
            {
               id: 2,
               title: 'Month',
            },
         ])
      }
   }
   useEffect(() => {
      buttonMagic()
   }, [from, to])
   const handleOnChangeRadio = option => {
      if (option == null) {
         setGroupBy(options.map(x => x.title))
         groupByDispatcher(options.map(x => x.title))
      } else {
         if (option.title == 'Hour') {
            groupByDispatcher(['year', 'month', 'week', 'day', 'hour'])
            return setGroupBy(['year', 'month', 'week', 'day', 'hour'])
         } else if (option.title == 'Day') {
            groupByDispatcher(['year', 'month', 'week', 'day'])
            return setGroupBy(['year', 'month', 'week', 'day'])
         } else if (option.title == 'Week') {
            groupByDispatcher(['year', 'month', 'week'])
            return setGroupBy(['year', 'month', 'week'])
         } else {
            groupByDispatcher(['year', 'month'])
            return setGroupBy(['year', 'month'])
         }
      }
   }
   if (options == null) {
      return <InlineLoader />
   }
   return (
      <>
         <RadioGroup
            options={options}
            active={1}
            onChange={option => handleOnChangeRadio(option)}
         />
      </>
   )
}

const TunnelBody = styled.div`
   padding: 10px 16px 0px 32px;
   height: calc(100% - 103px);
   overflow: auto;
`
