import React from 'react'
import { ReactTabulator } from '@dailykit/react-tabulator'
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

const EarningByProductTable = ({ earningByProductData }) => {
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const earningByProductRef = React.useRef()

   const downloadCsvData = () => {
      earningByProductRef.current.table.download(
         'csv',
         'earning-by-product-data.csv'
      )
   }

   const downloadPdfData = () => {
      earningByProductRef.current.table.downloadToTab(
         'pdf',
         'earning-by-product-data.pdf'
      )
   }

   const downloadXlsxData = () => {
      earningByProductRef.current.table.download(
         'xlsx',
         'earning-by-product-data.xlsx'
      )
   }
   //dropdown options
   const dropdownOptions = [
      {
         id: 1,
         title: 'Product Type',
         payload: 'type',
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
   ]
   const totalCalc = (values, data, calcParams) => {
      let total = 0
      values.forEach(value => {
         total += value
      })
      return `Σ = ${total.toFixed(2)}`
   }
   const columns = [
      {
         title: 'Product Name',
         field: 'name',
         headerFilter: true,
      },
      {
         title: 'Product Type',
         field: 'type',
         headerFilter: true,
      },
      {
         title: `Discount (${brandShopDateState.currency})`,
         field: 'totalDiscount',
         bottomCalc: totalCalc,
      },
      {
         title: `Tax (${brandShopDateState.currency})`,
         field: 'totalTax',
         bottomCalc: totalCalc,
      },
      {
         title: `Net Sales (${brandShopDateState.currency})`,
         field: 'netSale',
         bottomCalc: totalCalc,
         width: 150,
      },
      {
         title: `Total (${brandShopDateState.currency})`,
         field: 'total',
         bottomCalc: totalCalc,
      },
   ]
   //default ids for columns to be show dropdown
   const defaultIds = () => {
      const defaultShowColumns = localStorage.getItem(
         'earning-by-product-table-show-columns'
      )
      const parseDefaultColumns = defaultShowColumns
         ? JSON.parse(defaultShowColumns)
         : [1, 2, 3]
      return parseDefaultColumns
   }
   //columns to be show dropdown selected option fn
   const selectedOption = option => {
      const ids = option.map(x => x.id)
      localStorage.setItem(
         'earning-by-product-table-show-columns',
         JSON.stringify(ids)
      )
      dropdownOptions.forEach(eachOption => {
         if (ids.includes(eachOption.id)) {
            earningByProductRef.current.table.showColumn(eachOption.payload)
         } else {
            earningByProductRef.current.table.hideColumn(eachOption.payload)
         }
      })
   }

   //columns to be show dropdown search option
   const searchedOption = option => console.log(option)

   // fn run after table data loaded
   const dataLoaded = () => {
      const defaultShowColumns = localStorage.getItem(
         'earning-by-product-table-show-columns'
      )
      const parseDefaultColumns = JSON.parse(defaultShowColumns)
      if (parseDefaultColumns) {
         dropdownOptions.forEach(eachOption => {
            if (!parseDefaultColumns.includes(eachOption.id)) {
               earningByProductRef.current.table.hideColumn(eachOption.payload)
            }
         })
      }
   }

   if (earningByProductData.length == 0) {
      return <Filler message="No product sale in this time range" />
   }
   return (
      <>
         <Spacer size="15px" />
         <Flex container flexDirection="column">
            <Text as="h3">Earning By Product Table</Text>
            <Spacer size="10px" />
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
            <Spacer size="10px" />
            <ReactTabulator
               dataLoaded={dataLoaded}
               ref={earningByProductRef}
               data={earningByProductData}
               columns={columns}
               options={TableOptions}
            />
         </Flex>
      </>
   )
}
export default EarningByProductTable
