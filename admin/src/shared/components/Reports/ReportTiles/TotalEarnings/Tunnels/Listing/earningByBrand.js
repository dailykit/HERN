import React from 'react'
import { ReactTabulator } from '@dailykit/react-tabulator'
import '../../../tableStyle.css'
import {
   Dropdown,
   DropdownButton,
   Filler,
   Flex,
   Spacer,
   Text,
} from '@dailykit/ui'
import TableOptions from '../tableOptions'
import { BrandShopDateContext } from '../../../../../BrandShopDateProvider/context'

const EarningByBrandTable = React.memo(
   ({ earningByBrand, setSortedEarningByBrandData }) => {
      const { brandShopDateState } = React.useContext(BrandShopDateContext)
      const earningByBrandRef = React.useRef()

      const downloadCsvData = () => {
         earningByBrandRef.current.table.download(
            'csv',
            'earning-by-brand-data.csv'
         )
      }

      const downloadPdfData = () => {
         earningByBrandRef.current.table.downloadToTab(
            'pdf',
            'earning-by-brand-data.pdf'
         )
      }

      const downloadXlsxData = () => {
         earningByBrandRef.current.table.download(
            'xlsx',
            'earning-by-brand-data.xlsx'
         )
      }
      //dropdown options

      const totalCalc = (values, data, calcParams) => {
         let total = 0
         values.forEach(value => {
            total += value
         })
         return `Σ = ${total.toFixed(2)}`
      }
      const columns = [
         {
            title: 'Brand Id',
            field: 'id',
            hozAlign: 'center',
            headerFilter: true,
         },
         {
            title: 'Brand',
            field: 'title',
            headerFilter: true,
            hozAlign: 'left',
         },
         {
            title: '# Of Orders',
            field: 'totalOrders',
            bottomCalc: totalCalc,
            hozAlign: 'right',
            cssClass: 'digit-col',
         },
         {
            title: `Total (${brandShopDateState.currency})`,
            field: 'totalAmountPaid',
            bottomCalc: totalCalc,
            hozAlign: 'right',
            cssClass: 'digit-col',
         },
      ]

      //columns to be show dropdown search option
      const searchedOption = option => console.log(option)

      // fn run after table data loaded
      const dataLoaded = () => {}

      const dataSorted = (_, rows) => {
         setSortedEarningByBrandData(rows.map(eachRow => eachRow._row.data))
      }

      if (earningByBrand.length == 0) {
         return <Filler message="No product sale in this time range" />
      }
      return (
         <>
            <Spacer size="15px" />
            <Flex container flexDirection="column">
               <Text as="h3" style={{ padding: '0px 10px' }}>
                  Earning By Brand Table
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
               </Flex>
               <Spacer size="10px" />
               <ReactTabulator
                  dataLoaded={dataLoaded}
                  ref={earningByBrandRef}
                  data={earningByBrand}
                  columns={columns}
                  options={TableOptions}
                  className="report-table earning-by-brand-table"
                  dataSorted={dataSorted}
               />
            </Flex>
         </>
      )
   }
)
export default EarningByBrandTable
