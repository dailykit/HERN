import React, { useEffect, useState } from 'react'
import {
   ButtonGroup,
   DropdownButton,
   Filler,
   Flex,
   Spacer,
   Text,
   TextButton,
} from '@dailykit/ui'

import { ReactTabulator } from '@dailykit/react-tabulator'
import TableOptions from '../tableOptions'
import { InlineLoader } from '../../../../../InlineLoader'
import moment from 'moment'
import { AnalyticsApiArgsContext } from '../../../../context/apiArgs'
const EarningTable = ({ data }) => {
   return (
      <>
         <Flex>
            <Flex>
               <Text as="h2">Earning Table</Text>
            </Flex>
            <Flex container>
               <Flex></Flex>
            </Flex>
            <Flex>
               <DataTable data={data} />
            </Flex>
         </Flex>
      </>
   )
}

const DataTable = ({ data }) => {
   const earningTableRef = React.useRef()
   const { analyticsApiArgState } = React.useContext(AnalyticsApiArgsContext)
   const [earningTableData, setEarningTableData] = useState([])
   const [status, setStatus] = useState({ loading: true })
   const totalCalc = values => {
      let total = 0
      values.forEach(value => (total += value))
      console.log('totalis', total)
      return 'Total = ' + total.toFixed(2)
   }
   const downloadCsvData = () => {
      earningTableRef.current.table.download('csv', 'earning_table.csv')
   }

   const downloadPdfData = () => {
      earningTableRef.current.table.downloadToTab('pdf', 'earning_table.pdf')
   }

   const downloadXlsxData = () => {
      console.log('hell0')
      earningTableRef.current.table.download('xlsx', 'earning_table.xlsx')
   }
   const columns = [
      {
         title: 'Time',
         field: 'date',
      },
      {
         title: 'Orders',
         field: 'count',
         bottomCalc: 'sum',
      },
      {
         title: `Tax (${analyticsApiArgState.currency})`,
         field: 'totalTax',
         bottomCalc: totalCalc,
      },
      {
         title: `Discount (${analyticsApiArgState.currency})`,
         field: 'totalDiscount',
         bottomCalc: totalCalc,
      },
      {
         title: `Shipping (${analyticsApiArgState.currency})`,
         field: 'totalDeliveryPrice',
         bottomCalc: totalCalc,
      },
      {
         title: `Net Sales (${analyticsApiArgState.currency})`,
         field: 'netSale',
         bottomCalc: totalCalc,
      },
      {
         title: `Total (${analyticsApiArgState.currency})`,
         field: 'total',
         bottomCalc: totalCalc,
      },
   ]
   const earningDataManipulation = data => {
      const manipulateData = data.map(each => {
         if (Object.keys(each).includes('hour')) {
            const newDate = `${each.month}-${each.day}-${each.year} ${each.hour}:00`
            each.date = moment(newDate).format('DD MMM YYYY hh:mm a')
         } else if (Object.keys(each).includes('day')) {
            const newDate = `${each.month}-${each.day}-${each.year}`
            each.date = moment(newDate).format('DD MMM YYYY')
         } else if (Object.keys(each).includes('week')) {
            console.log('week', each.week)
            const newDate = moment(`${each.week} ${each.year}`, 'WW YYYY')
               .startOf('isoWeek')
               .format('DD MMM YYYY')
            const nextNewDate = moment(newDate)
               .add(1, 'w')
               .format('DD MMM YYYY')
            each.date = `${newDate} to ${nextNewDate}`
         } else {
            const newDate = `${each.month} ${each.year}`
            each.date = moment(newDate, 'MM YYYY').format('MMM YYYY')
         }
         each.netSale = parseFloat(
            (each.total - each.totalTax - each.totalDiscount).toFixed(2)
         )
         return each
      })
      setStatus({ ...status, loading: false })
      setEarningTableData(manipulateData)
   }
   useEffect(() => {
      earningDataManipulation(data)
   }, [data])
   if (status.loading) {
      return <InlineLoader />
   }
   if (earningTableData.length === 0) {
      return <Filler message="Data not available" />
   }
   return (
      <>
         <Flex>
            <Flex container justifyContent="flex-end" alignItems="center">
               <DropdownButton title="Download" width="150px">
                  <DropdownButton.Options>
                     <DropdownButton.Option onClick={() => downloadCsvData()}>
                        CSV
                     </DropdownButton.Option>
                     <DropdownButton.Option onClick={() => downloadPdfData()}>
                        PDF
                     </DropdownButton.Option>
                     <DropdownButton.Option onClick={() => downloadXlsxData()}>
                        XLSX
                     </DropdownButton.Option>
                  </DropdownButton.Options>
               </DropdownButton>
            </Flex>
         </Flex>
         <Spacer size="20px" />
         <ReactTabulator
            ref={earningTableRef}
            data={data}
            columns={columns}
            options={TableOptions}
         />
         <Spacer size="20px" />
      </>
   )
}

export default EarningTable
