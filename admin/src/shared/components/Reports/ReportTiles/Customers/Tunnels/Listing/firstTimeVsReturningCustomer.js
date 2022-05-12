import {
   Filler,
   Flex,
   Text,
   DropdownButton,
   Spacer,
   Dropdown,
} from '@dailykit/ui'
import '../../../tableStyle.css'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import DataGeneratorBetweenToDates from '../../../../../../utils/dataBWtwoDate'
import { BrandShopDateContext } from '../../../../../BrandShopDateProvider/context'
import { ReactTabulator } from '@dailykit/react-tabulator'
import { InlineLoader } from '../../../../../InlineLoader'
import TableOptions from './tableOptions'

const CustomerSalesTable = props => {
   const tableRef = React.useRef()
   const { customerData } = props
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const { from, to, groupBy, currency } = brandShopDateState
   const [tableData, setTableData] = useState([])
   const [status, setStatus] = useState('loading')
   const dateManipulation = data => {
      const manipulateData = data.map((each, index) => {
         if (groupBy[groupBy.length - 1] === 'hour') {
            each.date = moment(each.present).format('DD MMM YYYY hh:mm a')
         } else if (groupBy[groupBy.length - 1] === 'day') {
            each.date = moment(each.present).format('DD MMM YYYY')
         } else if (groupBy[groupBy.length - 1] === 'week') {
            const newDate = moment(each.present)
               .startOf('isoWeek')
               .format('DD MMM YYYY')
            const nextNewDate = moment(newDate)
               .add(1, 'w')
               .format('DD MMM YYYY')
            each.date = `${newDate} to ${nextNewDate}`
         } else {
            each.date = moment(each.present).format('MMM YYYY')
         }
         each.totalSale =
            (each.totalFirstpresent || 0) + (each.totalReturnpresent || 0)
         return each
      })
      setTableData(manipulateData)
      setStatus('success')
   }
   useEffect(() => {
      if (customerData.length > 0) {
         const dataset = {
            from: moment(from),
            to: moment(to),
            data: customerData,
         }
         const timeUnit = groupBy[groupBy.length - 1]
         const keys = {
            totalFirst: 0,
            countFirst: 0,
            totalReturn: 0,
            countReturn: 0,
         }
         const generatedData = DataGeneratorBetweenToDates(
            dataset,
            timeUnit,
            keys
         )
         dateManipulation(generatedData)
      }
   }, [customerData])
   const totalCalc = values => {
      let total = 0
      values.forEach(value => (total += value))
      return `Σ = ${currency}` + total.toFixed(2)
   }
   const downloadCsvData = () => {
      tableRef.current.table.download(
         'csv',
         'first-time-vs-returning-customer-sales.csv'
      )
   }

   const downloadPdfData = () => {
      tableRef.current.table.downloadToTab(
         'pdf',
         'first-time-vs-returning-customer-sales.pdf'
      )
   }

   const downloadXlsxData = () => {
      tableRef.current.table.download(
         'xlsx',
         'first-time-vs-returning-customer-sales.xlsx'
      )
   }
   //default ids for columns to be show dropdown
   const defaultIds = () => {
      const defaultShowColumns = localStorage.getItem(
         'first-time-vs-return-customer-table-show-columns'
      )
      // && JSON.parse(defaultShowColumns).length > 0&& JSON.parse(defaultShowColumns).length > 0
      const parseDefaultColumns = defaultShowColumns
         ? JSON.parse(defaultShowColumns)
         : columns.filter(x => x.toBeHide).map(x => x.id)
      return parseDefaultColumns
   }
   const columns = [
      {
         id: 1,
         title: 'Time',
         field: 'date',
         toBeHide: false,
         hozAlign: 'center',
      },
      {
         id: 2,
         title: '# of First Time Customer',
         field: 'countFirstpresent',
         headerTooltip: true,
         bottomCalc: 'sum',
         width: 160,
         toBeHide: true,
         hozAlign: 'right',
         cssClass: 'digit-col',
      },
      {
         id: 3,
         title: '# of Returning Customer',
         field: 'countReturnpresent',
         headerTooltip: true,
         bottomCalc: 'sum',
         width: 160,
         toBeHide: true,
         hozAlign: 'right',
         cssClass: 'digit-col',
      },
      {
         id: 4,
         title: 'Sale by First Time Customer',
         field: 'totalFirstpresent',
         headerTooltip: true,
         bottomCalc: totalCalc,
         width: 160,
         toBeHide: true,
         hozAlign: 'right',
         cssClass: 'digit-col',
      },
      {
         id: 5,
         title: 'Sale by Retuning Customer',
         field: 'totalReturnpresent',
         headerTooltip: true,
         bottomCalc: totalCalc,
         width: 160,
         toBeHide: true,
         hozAlign: 'right',
         cssClass: 'digit-col',
      },
      {
         id: 6,
         title: 'Total Sale',
         field: 'totalSale',
         bottomCalc: totalCalc,
         toBeHide: false,
         hozAlign: 'right',
         cssClass: 'digit-col',
      },
   ]
   //columns to be show dropdown selected option fn
   const selectedOption = option => {
      //ids --> ids of columns to be show
      const ids = option.map(x => x.id)
      localStorage.setItem(
         'first-time-vs-return-customer-table-show-columns',
         JSON.stringify(ids)
      )
      //
      columns.forEach(eachOption => {
         if (eachOption.toBeHide) {
            if (ids.includes(eachOption.id)) {
               tableRef.current.table.showColumn(eachOption.field)
            } else {
               tableRef.current.table.hideColumn(eachOption.field)
            }
         }
      })
   }
   //columns to be show dropdown search option
   const searchedOption = option => console.log(option)
   // fn run after table data loaded
   const dataLoaded = () => {
      const defaultShowColumns = localStorage.getItem(
         'first-time-vs-return-customer-table-show-columns'
      )
      const parseDefaultColumns =
         defaultShowColumns && JSON.parse(defaultShowColumns)
      if (parseDefaultColumns) {
         columns.forEach(eachOption => {
            if (
               !parseDefaultColumns.includes(eachOption.id) &&
               eachOption.toBeHide
            ) {
               tableRef.current.table.hideColumn(eachOption.field)
            }
         })
      }
   }

   if (customerData.length === 0) {
      return <Filler message="No data found for the date range selected" />
   }

   if (status === 'loading') {
      return <InlineLoader />
   }
   return (
      <>
         <Flex>
            <Text as="h2" style={{ padding: '0px 10px' }}>
               Sales Table
            </Text>
            <Spacer size="10px" />
            <Flex
               container
               justifyContent="flex-end"
               alignItems="center"
               padding="0px 10px"
            >
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
                  options={columns.filter(x => x.toBeHide)}
                  defaultIds={defaultIds()}
                  searchedOption={searchedOption}
                  selectedOption={selectedOption}
                  placeholder="Columns to be show..."
                  typeName="option"
                  selectedOptionsVisible={false}
               />
            </Flex>
            <Spacer size="10px" />

            <ReactTabulator
               ref={tableRef}
               columns={columns}
               data={tableData}
               options={TableOptions}
               dataLoaded={dataLoaded}
               className="report-table first-return-customer-table"
            />
         </Flex>
      </>
   )
}
export default CustomerSalesTable
