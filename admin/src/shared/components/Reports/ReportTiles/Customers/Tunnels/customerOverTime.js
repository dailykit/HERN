import { useSubscription } from '@apollo/react-hooks'
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { BrandShopDateContext } from '../../../../BrandShopDateProvider/context'
import { CUSTOMERS_DATA_OVERTIME } from '../graphql/subscription'
import CustomerOverTimeTable from './Listing/customerOverTime'
import { InlineLoader } from '../../../../InlineLoader'
import { ErrorState } from '../../../../ErrorState'
import { logger } from '../../../../../utils'
import { toast } from 'react-toastify'
import { Filler, Flex, Spacer } from '@dailykit/ui'
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
import DataGeneratorBetweenToDates from '../../../../../utils/dataBWtwoDate'
const CustomerOverTime = () => {
   const { brandShopDateState, brandShopDateDispatch } =
      React.useContext(BrandShopDateContext)
   const { from, to, brandShop, groupBy, compare } = brandShopDateState
   const {
      loading: subsLoading,
      error: subsError,
      data: { insights_analytics = [] } = {},
   } = useSubscription(CUSTOMERS_DATA_OVERTIME, {
      variables: {
         args: {
            params: {
               where: `${
                  from !== moment('2017 - 01 - 01') &&
                  `cc.created_at >= '${from}'`
               } ${
                  from !== moment('2017 - 01 - 01') &&
                  `AND cc.created_at < '${to}'`
               } ${
                  brandShop.brandId
                     ? `AND bc."brandId" = ${brandShop.brandId}`
                     : ''
               } ${
                  brandShop.shopTitle
                     ? `AND cc.source = \'${brandShop.shopTitle}\'`
                     : ''
               }`,
               groupingSets: `(${groupBy.toString()})`,
               columns: groupBy
                  .map(group => {
                     return `EXTRACT(${group.toUpperCase()} FROM cc.created_at) AS \"${group.toLowerCase()}\"`
                  })
                  .join(','),
            },
         },
      },
   })
   const { loading: subsCompareLoading, error: subsCompareError } =
      useSubscription(CUSTOMERS_DATA_OVERTIME, {
         variables: {
            args: {
               params: {
                  where: `${
                     compare.from !== moment('2017 - 01 - 01') &&
                     `cc.created_at >= '${compare.from}'`
                  } ${
                     compare.from !== moment('2017 - 01 - 01') &&
                     `AND cc.created_at < '${compare.to}'`
                  } ${
                     brandShop.brandId
                        ? `AND bc."brandId" = ${brandShop.brandId}`
                        : ''
                  } ${
                     brandShop.shopTitle
                        ? `AND cc.source = \'${brandShop.shopTitle}\'`
                        : ''
                  }`,
                  groupingSets: `(${groupBy.toString()})`,
                  columns: groupBy
                     .map(group => {
                        return `EXTRACT(${group.toUpperCase()} FROM cc.created_at) AS \"${group.toLowerCase()}\"`
                     })
                     .join(','),
               },
            },
         },
         isSkip: compare.isSkip,
         onSubscriptionData: ({ subscriptionData }) => {
            const compareCustomerData =
               subscriptionData.data.insights_analytics[0].getCustomersByGroupBy.slice(
                  1
               )
            brandShopDateDispatch({
               type: 'COMPARE',
               payload: { data: compareCustomerData },
            })
         },
      })
   if ((!subsError && !subsCompareError && subsLoading) || subsCompareLoading) {
      return <InlineLoader />
   }
   if (subsError || subsCompareError) {
      logger(subsError)
      toast.error('Could not get the Customer Data')
      return (
         <ErrorState height="320px" message="Could not get the Customer Data" />
      )
   }
   // if (insights_analytics[0].getCustomersByGroupBy.length == 1) {
   //    return <Filler message="No customer in these conditions" />
   // }
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
            <CustomerOverChart
               insightData={insights_analytics[0].getCustomersByGroupBy.slice(
                  1
               )}
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
            {insights_analytics[0].getCustomersByGroupBy.length == 1 ? (
               <Filler message="No customer in these conditions" />
            ) : (
               <CustomerOverTimeTable
                  tableData={insights_analytics[0].getCustomersByGroupBy[0]}
               />
            )}
         </div>
      </>
   )
}
const CustomerOverChart = props => {
   const { insightData } = props
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const { from, to, groupBy, compare } = brandShopDateState
   const [graphData, setGraphData] = useState([])
   const [status, setStatus] = useState('loading')
   useEffect(() => {
      console.log('Hello')
      const timeUnit = groupBy[groupBy.length - 1]
      const keys = {
         count: 0,
      }
      const dataset = {
         from: moment(from),
         to: moment(to),
         data: insightData,
      }
      const generatedData = DataGeneratorBetweenToDates(dataset, timeUnit, keys)
      if (compare.isSkip) {
         setGraphData(generatedData)

         setStatus('success')
      } else {
         console.log('graphData')
         console.log('graphDataHEllo')

         let merged = []
         const datasetCompare = {
            from: moment(compare.from),
            to: moment(compare.to),
            data: compare.data,
         }

         const generatedDataCompare = DataGeneratorBetweenToDates(
            datasetCompare,
            timeUnit,
            keys,
            compare.isCompare
         )
         for (let i = 0; i < generatedData.length; i++) {
            merged.push({
               ...generatedData[i],
               ...generatedDataCompare[i],
            })
         }
         setGraphData(merged)
         setStatus('success')
      }
   }, [])
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
                  <YAxis />
                  <Tooltip
                     labelFormatter={label => {
                        return labelFormatter(label)
                     }}
                  />
                  <Legend />
                  <Bar name="Customers" dataKey="countpresent" fill="#2AC981" />
                  {!compare.isSkip && (
                     <Bar
                        name="Compare Customers"
                        dataKey="countpast"
                        fill="#8884d8"
                     />
                  )}
               </BarChart>
            </ResponsiveContainer>
         </Flex>
      </>
   )
}
export default CustomerOverTime
