/*

   compatible with Bar, BarChart, Line, Area.

   {
      x: [{ key: 'id' }, { key: 'created_at' }], // key should match the graphql query fields
      y: [{ key: 'amountPaid' }, { key: 'deliveryPrice' }], // key should match the graphql query fields
      type: 'BarChart',
      options: {}, // google chart options https://developers.google.com/chart/interactive/docs/gallery/barchart#configuration-options
      multiple: false, // allows to show multiple sources in the y-axis
   },

*/

export function generateBarChartData(
   allowedCharts,
   transformedData,
   { chartTypeIndex, xColumn, yColumns }
) {
   let chartData = [[]]

   // add chart header
   if (
      Array.isArray(allowedCharts) &&
      allowedCharts.length &&
      allowedCharts[chartTypeIndex] &&
      allowedCharts[chartTypeIndex].x
   ) {
      if (xColumn) {
         const index = allowedCharts[chartTypeIndex].x.findIndex(
            col => col.key === xColumn
         )

         if (index >= 0)
            chartData[0].push({
               ...allowedCharts[chartTypeIndex].x[index],
               label: allowedCharts[chartTypeIndex].x[index].key,
            })
      } else {
         // push the first column from x in header
         chartData[0].push({
            ...allowedCharts[chartTypeIndex].x[0],
            label: allowedCharts[chartTypeIndex].x[0].key,
         })
      }
   }

   if (yColumns.length) {
      yColumns.forEach(column => {
         chartData[0].push({ ...column, label: column.key })
      })
   } else {
      if (
         Array.isArray(allowedCharts) &&
         allowedCharts[chartTypeIndex] &&
         allowedCharts[chartTypeIndex].y
      )
         chartData[0].push({
            ...allowedCharts[chartTypeIndex].y[0],
            label: allowedCharts[chartTypeIndex].y[0].key,
         })
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
