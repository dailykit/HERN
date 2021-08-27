import React, { useEffect, useState } from 'react'
import {
   ButtonGroup,
   Dropdown,
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
      return 'Total = ' + total.toFixed(2)
   }
   const downloadCsvData = () => {
      earningTableRef.current.table.download('csv', 'earning_table.csv')
   }

   const downloadPdfData = () => {
      earningTableRef.current.table.downloadToTab('pdf', 'earning_table.pdf')
   }

   const downloadXlsxData = () => {
      earningTableRef.current.table.download('xlsx', 'earning_table.xlsx')
   }

   //dropdown options
   const dropdownOptions = [
      {
         id: 1,
         title: 'Orders',
         payload: 'count',
      },
      {
         id: 2,
         title: 'Tax',
         payload: 'totalTax',
      },
      {
         id: 3,
         title: 'Discount',
         payload: 'totalDiscount',
      },
      {
         id: 4,
         title: 'Shipping',
         payload: 'totalDeliveryPrice',
      },
   ]

   //default ids for columns to be show dropdown
   const defaultIds = () => {
      const defaultShowColumns = localStorage.getItem(
         'earning-table-show-columns'
      )
      const parseDefaultColumns = defaultShowColumns
         ? JSON.parse(defaultShowColumns)
         : [1, 2, 3, 4]
      return parseDefaultColumns
   }

   //columns to be show dropdown selected option fn
   const selectedOption = option => {
      const ids = option.map(x => x.id)
      localStorage.setItem('earning-table-show-columns', JSON.stringify(ids))
      dropdownOptions.forEach(eachOption => {
         if (ids.includes(eachOption.id)) {
            earningTableRef.current.table.showColumn(eachOption.payload)
         } else {
            earningTableRef.current.table.hideColumn(eachOption.payload)
         }
      })
   }

   //columns to be show dropdown search option
   const searchedOption = option => console.log(option)

   //columns for table
   const columns = [
      {
         title: 'Time',
         field: 'date',
         width: 270,
      },
      {
         title: 'Orders',
         field: 'count',
         bottomCalc: 'sum',
         visible: true,
         width: 120,
      },
      {
         title: `Tax (${analyticsApiArgState.currency})`,
         field: 'totalTax',
         bottomCalc: totalCalc,
         visible: true,
         width: 150,
      },
      {
         title: `Discount (${analyticsApiArgState.currency})`,
         field: 'totalDiscount',
         bottomCalc: totalCalc,
         visible: true,
         width: 150,
      },
      {
         title: `Shipping (${analyticsApiArgState.currency})`,
         field: 'totalDeliveryPrice',
         bottomCalc: totalCalc,
         visible: true,
         width: 150,
      },
      {
         title: `Net Sales (${analyticsApiArgState.currency})`,
         field: 'netSale',
         bottomCalc: totalCalc,
         width: 150,
      },
      {
         title: `Total (${analyticsApiArgState.currency})`,
         field: 'total',
         bottomCalc: totalCalc,
         width: 150,
      },
   ]

   // fn run after table data loaded
   const dataLoaded = () => {
      const defaultShowColumns = localStorage.getItem(
         'earning-table-show-columns'
      )
      const parseDefaultColumns = JSON.parse(defaultShowColumns)
      if (parseDefaultColumns) {
         dropdownOptions.forEach(eachOption => {
            if (!parseDefaultColumns.includes(eachOption.id)) {
               earningTableRef.current.table.hideColumn(eachOption.payload)
            }
         })
      }
   }

   const earningDataManipulation = data => {
      const manipulateData = data.map(each => {
         if (Object.keys(each).includes('hour')) {
            const newDate = `${each.month}-${each.day}-${each.year} ${each.hour}:00`
            each.date = moment(newDate).format('DD MMM YYYY hh:mm a')
         } else if (Object.keys(each).includes('day')) {
            const newDate = `${each.month}-${each.day}-${each.year}`
            each.date = moment(newDate).format('DD MMM YYYY')
         } else if (Object.keys(each).includes('week')) {
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
               <Spacer xAxis size="20px" />
               <Dropdown
                  type="multi"
                  options={dropdownOptions}
                  defaultIds={defaultIds()}
                  searchedOption={searchedOption}
                  selectedOption={selectedOption}
                  placeholder="Columns to be show..."
                  typeName="option"
                  selectedOptionsVisible={false}
               />
            </Flex>
         </Flex>
         <Spacer size="20px" />
         <ReactTabulator
            ref={earningTableRef}
            dataLoaded={dataLoaded}
            data={data}
            columns={columns}
            options={TableOptions}
         />
         <Spacer size="20px" />
      </>
   )
}

export default EarningTable
