import { ReactTabulator } from '@dailykit/react-tabulator'
import {
   DropdownButton,
   Flex,
   Spacer,
   Text,
   Dropdown,
   Filler,
} from '@dailykit/ui'
import React from 'react'
import TableOptions from '../tableOptions'
import { BrandShopDateContext } from '../../../../../BrandShopDateProvider/context'
const OrderByLocationTable = props => {
   const { orderByLocationData } = props
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const { currency } = { brandShopDateState }
   const tableRef = React.useRef()
   const columns = [
      {
         id: 1,
         title: 'Order ID',
         field: 'orderId',
         toBeHide: false,
         toBeGroupBy: false,
      },
      {
         id: 2,
         title: 'Customer Name',
         field: 'customerFullName',
         toBeHide: false,
         toBeGroupBy: false,
         headerFilter: true,
      },
      {
         id: 3,
         title: 'Ordered City',
         field: 'orderCity',
         toBeHide: false,
         toBeGroupBy: true,
         headerFilter: true,
      },
      {
         id: 4,
         title: 'Ordered State',
         field: 'orderState',
         toBeHide: true,
         toBeGroupBy: true,
         headerFilter: true,
      },
      {
         id: 5,
         title: 'Ordered Country',
         field: 'orderCountry',
         toBeHide: true,
         toBeGroupBy: false,
         headerFilter: true,
      },
      {
         id: 6,
         title: 'Created At',
         field: 'created_at',
         toBeHide: false,
         toBeGroupBy: true,
      },
      {
         id: 7,
         title: `Amount Paid ${currency}`,
         field: 'amountPaid',
         toBeHide: true,
         toBeGroupBy: false,
      },
   ]
   const downloadCsvData = () => {
      tableRef.current.table.download('csv', 'order-by-location.csv')
   }

   const downloadPdfData = () => {
      tableRef.current.table.downloadToTab('pdf', 'order-by-location.pdf')
   }

   const downloadXlsxData = () => {
      tableRef.current.table.download('xlsx', 'order-by-location.xlsx')
   }
   //default ids for columns to be show dropdown
   const defaultIds = dropdown => {
      const defaultShowColumns = localStorage.getItem(
         `order-by-location-table-${dropdown}-columns`
      )
      // && JSON.parse(defaultShowColumns).length > 0&& JSON.parse(defaultShowColumns).length > 0

      const parseDefaultColumns = defaultShowColumns
         ? JSON.parse(defaultShowColumns)
         : dropdown == 'groupBy'
         ? []
         : columns.filter(x => x['toBeHide']).map(x => x.id)
      return parseDefaultColumns
   }
   //columns to be show dropdown selected option fn
   const selectedOption = (option, dropdown) => {
      //ids --> ids of columns to be show
      const ids = option.map(x => x.id)
      localStorage.setItem(
         `order-by-location-table-${dropdown}-columns`,
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
      }
   }
   //columns to be show dropdown search option
   const searchedOption = option => console.log(option)
   // fn run after table data loaded
   const dataLoaded = () => {
      const defaultShowColumns =
         localStorage.getItem('order-by-location-table-show-columns') || []

      const defaultGroupByColumns =
         localStorage.getItem('order-by-location-table-groupBy-columns') || []

      const parseDefaultShowColumns = JSON.parse(defaultShowColumns)
      const parseDefaultGroupByColumns = JSON.parse(defaultGroupByColumns)
      if (parseDefaultShowColumns) {
         columns.forEach(eachOption => {
            if (
               !parseDefaultShowColumns.includes(eachOption.id) &&
               eachOption.toBeHide
            ) {
               tableRef.current.table.hideColumn(eachOption.field)
            }
         })
      }
      if (parseDefaultGroupByColumns) {
         const groupedColumns = columns
            .filter(x => parseDefaultGroupByColumns.includes(x.id))
            .map(x => x.field)
         tableRef.current.table.setGroupBy(groupedColumns)
      }
   }
   return (
      <>
         <Flex container flexDirection="column">
            <Text as="h3" style={{ padding: '0px 10px' }}>
               Order By Location Table
            </Text>
            {orderByLocationData.length > 0 && (
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
            {orderByLocationData.length === 0 ? (
               <Filler message="No rejected orders" />
            ) : (
               <ReactTabulator
                  ref={tableRef}
                  dataLoaded={dataLoaded}
                  data={orderByLocationData}
                  columns={columns}
                  options={TableOptions}
               />
            )}
         </Flex>
      </>
   )
}
export default OrderByLocationTable
