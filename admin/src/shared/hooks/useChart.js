import { generateBarChartData } from '../components/Insight/generators/generateBarChartData'
import { generateCalendarChartData } from '../components/Insight/generators/generateCalendarChartData'
import { generatePieChartData } from '../components/Insight/generators/generatePieChartData'

export const useChart = (chart, rawData, options) => {
   const chartData = genChartData(chart.config, rawData, {
      xColumn: options.xColumn,
      yColumns: options.yColumns,
      chartType: options.chartType,
      slice: options.slice,
      metrices: options.metrices,
   })

   return {
      data: chartData,
      options: chart.config[options.chartType.index].options || {},
   }
}

/**
 *
 * @param {Array<{type: string, columns: any[]}>} allowedCharts
 * @param {any[]} transformedData
 * @param {{chartTypeIndex: number, xColumn: string, yColumns: any[], chartType: {multiple: boolean, type: string, index: number}, slice: string, metrices: Array<{key: string, label: string}>, dateKeys: string[]}} option
 */
function genChartData(
   allowedCharts,
   transformedData,
   { xColumn, yColumns, chartType, slice, metrices }
) {
   let chartData = []

   switch (chartType.type) {
      case 'Bar':
         chartData = generateBarChartData(allowedCharts, transformedData, {
            xColumn,
            yColumns,
            chartTypeIndex: chartType.index,
         })
         return chartData

      case 'PieChart':
         chartData = generatePieChartData(allowedCharts, transformedData, {
            chartTypeIndex: chartType.index,
            slice,
            metrices,
         })

         return chartData

      case 'Calendar':
         chartData = generateCalendarChartData(allowedCharts, transformedData, {
            chartTypeIndex: chartType.index,
            metrices,
            slice,
         })
         return chartData

      default:
         chartData = generateBarChartData(allowedCharts, transformedData, {
            chartTypeIndex: chartType.index,
            xColumn,
            yColumns,
         })
         return chartData
   }
}
