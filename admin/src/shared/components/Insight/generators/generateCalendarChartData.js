/*

   {
      type: 'Calendar',
      title: 'Revenue earned',
      options: {}, // Google chart options https://developers.google.com/chart/interactive/docs/gallery/calendar#configuration-options
      dateKeys: ['created_at'], // key should match the graphql query fields
      metrices: [
         { key: 'amountPaid', title: 'Revenue' },
         { key: 'deliveryPrice', title: 'delivery price' },
      ], // key should match the graphql query fields
      multiple: false, // this must be false all the time.
   }
   
*/

/**
 *
 * @param {Array<{type: string, columns: any[]}>} allowedCharts
 * @param {any[]} transformedData
 * @param {{chartTypeIndex: number, metrices: Array<{key: string, label: string}>, slice: string}} param2
 */
export function generateCalendarChartData(
   allowedCharts,
   transformedData,
   { chartTypeIndex, metrices, slice }
) {
   let chartData = [[]]

   // add chart headers
   if (
      Array.isArray(allowedCharts) &&
      allowedCharts.length &&
      allowedCharts[chartTypeIndex] &&
      allowedCharts[chartTypeIndex].dateKeys &&
      allowedCharts[chartTypeIndex].dateKeys.length
   ) {
      if (slice) {
         const index = allowedCharts[chartTypeIndex].dateKeys.findIndex(
            col => col === slice
         )
         if (index >= 0)
            chartData[0].push({
               key: allowedCharts[chartTypeIndex].dateKeys[index],
               type: 'date',
            })
      } else {
         chartData[0].push({
            type: 'date',
            key: allowedCharts[chartTypeIndex].dateKeys[0],
         })
      }
   }

   if (metrices.length) {
      metrices.forEach(column => {
         chartData[0].push({ ...column, type: 'number' })
      })
   } else {
      if (
         Array.isArray(allowedCharts) &&
         allowedCharts.length &&
         allowedCharts[chartTypeIndex] &&
         allowedCharts[chartTypeIndex].metrices?.length
      ) {
         chartData[0].push({
            ...allowedCharts[chartTypeIndex].metrices[0],
            type: 'number',
         })
      }
   }

   // add chart data
   transformedData.forEach(data => {
      const row = []

      chartData[0].forEach((label, i) => {
         if (i === 0) {
            row.push(new Date(data[label.key]))
         } else {
            row.push(data[label.key])
         }
      })

      chartData.push(row)
   })
   return chartData
}
