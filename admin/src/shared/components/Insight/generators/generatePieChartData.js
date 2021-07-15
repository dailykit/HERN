/*

   {
      type: 'PieChart',
      options: {}, // Google chart options https://developers.google.com/chart/interactive/docs/gallery/piechart#configuration-options
      slices: [{ key: 'id' }, { key: 'created_at' }], // key should match the graphql query 
      metrices: [
         {
            key: 'amountPaid',
            title: 'Revenue',
         },
         {
            key: 'deliveryPrice',
            title: 'delivery price',
         },
      ], // key should match the graphql query 
      multiple: false, // this must be false.
   }

*/

export function generatePieChartData(
   allowedCharts,
   transformedData,
   { chartTypeIndex, slice, metrices }
) {
   let chartData = [[]]

   // add chart headers
   if (
      Array.isArray(allowedCharts) &&
      allowedCharts.length &&
      allowedCharts[chartTypeIndex] &&
      allowedCharts[chartTypeIndex].slices?.length
   ) {
      if (slice) {
         const index = allowedCharts[chartTypeIndex].slices.findIndex(
            col => col.key === slice
         )

         if (index >= 0)
            chartData[0].push({
               ...allowedCharts[chartTypeIndex].slices[index],
               label: allowedCharts[chartTypeIndex].slices[index].key,
            })
      } else {
         chartData[0].push({
            ...allowedCharts[chartTypeIndex].slices[0],
            label: allowedCharts[chartTypeIndex].slices[0].key,
         })
      }
   }

   if (metrices.length) {
      metrices.forEach(column => {
         chartData[0].push({
            ...column,
            label: column.key,
         })
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
            label: allowedCharts[chartTypeIndex].metrices[0].key,
         })
      }
   }

   // add chart data
   transformedData.forEach(data => {
      const row = []

      chartData[0].forEach(label => {
         row.push(data[label.key])
      })

      chartData.push(row)
   })

   return chartData
}
