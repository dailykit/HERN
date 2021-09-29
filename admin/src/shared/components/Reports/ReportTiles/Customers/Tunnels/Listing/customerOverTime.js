import { useSubscription } from '@apollo/react-hooks'
import { ReactTabulator } from '@dailykit/react-tabulator'
import moment from 'moment'
import '../../../tableStyle.css'
import React, { useEffect, useState } from 'react'
import { BrandShopDateContext } from '../../../../../BrandShopDateProvider/context'
import TableOptions from './tableOptions'
import { InlineLoader } from '../../../../../InlineLoader'
import { CUSTOMERS_DATA_OVERTIME } from '../../graphql/subscription'
import { Flex, Text, DropdownButton, Spacer, Dropdown } from '@dailykit/ui'

const CustomerOverTimeTable = props => {
   const { tableData } = props
   const customerTableRef = React.useRef()
   const [status, setStatus] = useState('loading')
   const [customerData, setCustomerData] = useState([])

   const columns = [
      { id: 1, title: 'ID', field: 'id', toBeHide: false, hozAlign: 'center' },
      {
         id: 2,
         title: 'Email',
         field: 'email',
         headerFilter: true,
         toBeHide: false,
         hozAlign: 'left',
         width: 350,
      },
      {
         id: 3,
         title: 'Source',
         field: 'source',
         headerFilter: true,
         toBeHide: true,
         hozAlign: 'left',
         width: 200,
      },
      {
         id: 4,
         title: 'Created at',
         field: 'date',
         toBeHide: false,
         hozAlign: 'left',
         width: 250,
      },
      {
         id: 5,
         title: 'Subscriber',
         field: 'isSubscriber',
         toBeHide: true,
         hozAlign: 'left',
      },
   ]
   const dataManipulation = () => {
      const newTableData = tableData.customerRefs.map(each => {
         each.date = moment(each.created_at).format('DD-MM-YYYY')
         return each
      })
      setCustomerData(newTableData)
      setStatus('success')
   }
   const downloadCsvData = () => {
      customerTableRef.current.table.download('csv', 'order-rejected.csv')
   }

   const downloadPdfData = () => {
      customerTableRef.current.table.downloadToTab('pdf', 'order-rejected.pdf')
   }

   const downloadXlsxData = () => {
      customerTableRef.current.table.download('xlsx', 'order-rejected.xlsx')
   }
   //default ids for columns to be show dropdown
   const defaultIds = () => {
      const defaultShowColumns = localStorage.getItem(
         'customer-overtime-table-show-columns'
      )
      // && JSON.parse(defaultShowColumns).length > 0&& JSON.parse(defaultShowColumns).length > 0
      const parseDefaultColumns = defaultShowColumns
         ? JSON.parse(defaultShowColumns)
         : columns.filter(x => x.toBeHide).map(x => x.id)
      return parseDefaultColumns
   }
   //columns to be show dropdown selected option fn
   const selectedOption = option => {
      //ids --> ids of columns to be show
      const ids = option.map(x => x.id)
      localStorage.setItem(
         'customer-overtime-table-show-columns',
         JSON.stringify(ids)
      )
      //
      columns.forEach(eachOption => {
         if (eachOption.toBeHide) {
            if (ids.includes(eachOption.id)) {
               customerTableRef.current.table.showColumn(eachOption.field)
            } else {
               customerTableRef.current.table.hideColumn(eachOption.field)
            }
         }
      })
   }
   //columns to be show dropdown search option
   const searchedOption = option => console.log(option)
   // fn run after table data loaded
   const dataLoaded = () => {
      const defaultShowColumns =
         localStorage.getItem('customer-overtime-table-show-columns') || []
      const parseDefaultColumns = JSON.parse(defaultShowColumns)
      if (parseDefaultColumns) {
         columns.forEach(eachOption => {
            if (
               !parseDefaultColumns.includes(eachOption.id) &&
               eachOption.toBeHide
            ) {
               customerTableRef.current.table.hideColumn(eachOption.field)
            }
         })
      }
   }
   useEffect(() => {
      dataManipulation()
   }, [])
   if (status === 'loading') {
      return <InlineLoader />
   }
   return (
      <>
         <Flex>
            <Text as="h2" style={{ padding: '0px 10px' }}>
               Customer Table ({tableData.count})
            </Text>
            <Spacer size="10px" />
            <Flex
               container
               justifyContent="flex-end"
               alignItems="center"
               padding="0 10px"
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
               ref={customerTableRef}
               data={customerData}
               columns={columns}
               options={TableOptions}
               dataLoaded={dataLoaded}
            />
         </Flex>
      </>
   )
}
export default CustomerOverTimeTable
