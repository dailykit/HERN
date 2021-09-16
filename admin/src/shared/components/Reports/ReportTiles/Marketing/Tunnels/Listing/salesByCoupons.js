import React from 'react'
import '../../../tableStyle.css'
import { ReactTabulator } from '@dailykit/react-tabulator'
import TableOptions from './tableOptions'
import {
   DropdownButton,
   Flex,
   Spacer,
   Text,
   Dropdown,
   Filler,
} from '@dailykit/ui'
import { BrandShopDateContext } from '../../../../../BrandShopDateProvider/context'
import './tableStyle.css'
const SalesByCouponsTable = props => {
   const { salesByCouponsData } = props
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const { currency } = brandShopDateState
   const tableRef = React.useRef()

   const totalCalc = values => {
      let total = 0
      values.forEach(value => (total += value))
      return `Σ = ${currency}` + total.toFixed(2)
   }

   const columns = [
      {
         id: 1,
         title: 'Coupon ID',
         field: 'id',
         toBeGroupBy: false,
         toBeHide: false,
         width: 111,
         hozAlign: 'center',
      },
      {
         id: 2,
         title: 'Coupon Code',
         field: 'code',
         toBeGroupBy: false,
         toBeHide: false,
         headerFilter: true,
         width: 200,
         hozAlign: 'left',
      },
      {
         id: 3,
         title: 'Active',
         field: 'isActive',
         toBeGroupBy: true,
         toBeHide: true,
         width: 111,
         hozAlign: 'center',
      },
      {
         id: 4,
         title: `Sales (${currency})`,
         field: 'totalEarning',
         toBeGroupBy: false,
         toBeHide: false,
         width: 111,
         hozAlign: 'right',
         bottomCalc: totalCalc,
         cssClass: 'digit-col',
      },
      {
         id: 5,
         title: 'Coupon Start Time',
         field: 'startTimeStamp',
         toBeGroupBy: true,
         toBeHide: true,
         headerFilter: true,
         width: 259,
         hozAlign: 'left',
      },
      {
         id: 6,
         title: 'Coupon End Time',
         field: 'endTimeStamp',
         toBeGroupBy: true,
         toBeHide: true,
         headerFilter: true,
         width: 259,
         hozAlign: 'left',
      },
   ]
   const downloadCsvData = () => {
      tableRef.current.table.download('csv', 'sales-by-coupons.csv')
   }

   const downloadPdfData = () => {
      tableRef.current.table.downloadToTab('pdf', 'sales-by-coupons.pdf')
   }

   const downloadXlsxData = () => {
      tableRef.current.table.download('xlsx', 'sales-by-coupons.xlsx')
   }

   //columns to be show dropdown selected option fn
   const selectedOption = (option, dropdown) => {
      //ids --> ids of columns to be show
      //use id because in dropdown for initial check there is need of id/s
      const ids = option.map(x => x.id)
      localStorage.setItem(
         `sales-by-coupons-table-${dropdown}-columns`,
         JSON.stringify(ids)
      )
      //
      if (dropdown == 'show') {
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
      if (dropdown == 'groupBy') {
         const groupedColumns = option.map(x => x.field)
         tableRef.current.table.setGroupBy(groupedColumns)
         tableRef.current.table.setGroupHeader(function (
            value,
            count,
            data1,
            group
         ) {
            let newHeader
            switch (group._group.field) {
               case 'isActive':
                  newHeader = 'Active'
                  break
               case 'startTimeStamp':
                  newHeader = 'Start Time Stamp'
                  break
               case 'endTimeStamp':
                  newHeader = 'End Time Stamp'
                  break
               default:
                  break
            }
            return `${newHeader} - ${value} || ${count} Coupons`
         })
      }
   }

   //columns to be show dropdown search option
   const searchedOption = option => console.log(option)

   //default ids for columns to be show dropdown
   const defaultIds = dropdown => {
      const defaultShowColumns = localStorage.getItem(
         `sales-by-coupons-table-${dropdown}-columns`
      )
      // && JSON.parse(defaultShowColumns).length > 0&& JSON.parse(defaultShowColumns).length > 0

      const parseDefaultColumns = defaultShowColumns
         ? JSON.parse(defaultShowColumns)
         : dropdown == 'groupBy'
         ? []
         : columns.filter(x => x['toBeHide']).map(x => x.id)
      return parseDefaultColumns
   }

   // fn run after table data loaded
   const dataLoaded = () => {
      const defaultShowColumns =
         localStorage.getItem('sales-by-coupons-table-show-columns') || []

      const defaultGroupByColumns =
         localStorage.getItem('sales-by-coupons-table-groupBy-columns') || []

      if (defaultShowColumns.length > 0) {
         const parseDefaultShowColumns = JSON.parse(defaultShowColumns)
         columns.forEach(eachOption => {
            if (
               !parseDefaultShowColumns.includes(eachOption.id) &&
               eachOption.toBeHide
            ) {
               tableRef.current.table.hideColumn(eachOption.field)
            }
         })
      }

      if (defaultGroupByColumns.length > 0) {
         const parseDefaultGroupByColumns = JSON.parse(defaultGroupByColumns)
         const groupedColumns = columns
            .filter(x => parseDefaultGroupByColumns.includes(x.id))
            .map(x => x.field)
         tableRef.current.table.setGroupBy(groupedColumns)
         tableRef.current.table.setGroupHeader(function (
            value,
            count,
            data1,
            group
         ) {
            let newHeader
            switch (group._group.field) {
               case 'isActive':
                  newHeader = 'Active'
                  break
               case 'startTimeStamp':
                  newHeader = 'Start Time Stamp'
                  break
               case 'endTimeStamp':
                  newHeader = 'End Time Stamp'
                  break
               default:
                  break
            }
            return `${newHeader} - ${value} || ${count} Coupons`
         })
      }
   }

   return (
      <>
         <Flex container flexDirection="column">
            <Text as="h3" style={{ padding: '0px 10px' }}>
               Sales From Coupons Table
            </Text>
            {salesByCouponsData.length > 0 && (
               <Flex
                  container
                  justifyContent="flex-end"
                  alignItems="center"
                  padding="0px 10px"
               >
                  <DropdownButton title="Download" width="150px">
                     <DropdownButton.Options>
                        <DropdownButton.Option
                           onClick={() => downloadCsvData()}
                        >
                           CSV
                        </DropdownButton.Option>
                        <DropdownButton.Option
                           onClick={() => downloadPdfData()}
                        >
                           PDF
                        </DropdownButton.Option>
                        <DropdownButton.Option
                           onClick={() => downloadXlsxData()}
                        >
                           XLSX
                        </DropdownButton.Option>
                     </DropdownButton.Options>
                  </DropdownButton>
                  <Spacer xAxis size="20px" />
                  <Dropdown
                     type="multi"
                     options={columns.filter(x => x.toBeGroupBy)}
                     defaultIds={defaultIds('groupBy')}
                     searchedOption={searchedOption}
                     selectedOption={option =>
                        selectedOption(option, 'groupBy')
                     }
                     placeholder="GroupBy..."
                     typeName="option"
                     selectedOptionsVisible={false}
                  />
                  <Spacer xAxis size="20px" />
                  <Dropdown
                     type="multi"
                     options={columns.filter(x => x.toBeHide)}
                     defaultIds={defaultIds('show')}
                     searchedOption={searchedOption}
                     selectedOption={option => selectedOption(option, 'show')}
                     placeholder="Columns to be show..."
                     typeName="option"
                     selectedOptionsVisible={false}
                  />
               </Flex>
            )}
            <Spacer size="10px" />
            {salesByCouponsData.length === 0 ? (
               <Filler message="No sales from coupons" />
            ) : (
               <ReactTabulator
                  ref={tableRef}
                  columns={columns}
                  data={salesByCouponsData}
                  options={TableOptions}
                  dataLoaded={dataLoaded}
                  className="sales-from-coupons report-table"
               />
            )}
         </Flex>
      </>
   )
}
export default SalesByCouponsTable
