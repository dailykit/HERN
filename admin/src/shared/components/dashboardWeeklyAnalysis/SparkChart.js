// if you want to know more about moment, reCharts and analytics, so go to insight app home

import { Spacer, Text } from '@dailykit/ui'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts'

export const SparkChart = ({
   insightAnalyticsData,
   from,
   to,
   dataOf,
   groupBy,
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
                  width: '8rem',
                  height: 'auto',
                  margin: '2px 2px',
                  padding: '2px 2px',
                  boxShadow: '5px 5px 10px #888888',
               }}
            >
               {groupBy == 'day' && (
                  <>
                     <Text as="text3">
                        {moment(payload[0]['payload']['present']).format(
                           'YYYY-MM-DD'
                        )}
                     </Text>
                  </>
               )}
               <Spacer size="3px" />
               <Text as="text3">{`${dataOf.toUpperCase()}: ${
                  payload[0].payload[dataOf]
               }`}</Text>
            </div>
         )
      }

      return null
   }
   const dataGeneratorBetweenToDates = (from, to, groupBy) => {
      if (groupBy[groupBy.length - 1] == 'day') {
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

         setDataForGraph(dayBundlePresent)
      }
   }
   // console.log('data for graph:::::', dataForGraph)
   useEffect(() => {
      dataGeneratorBetweenToDates(moment(from), moment(to), groupBy)
   }, [from, to, groupBy])
   return (
      <>
         <AreaChart
            width={100}
            height={72}
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
               stroke="#367BF5"
               fill="#367BF5"
            />
         </AreaChart>
      </>
   )
}
