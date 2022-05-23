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

const EarningByStoreLocationTable = ({
   earningByStoreLocation,
   setSortedEarningByStoreLocation,
}) => {
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const earningByStoreLocationRef = React.useRef()

   const downloadCsvData = () => {
      earningByStoreLocationRef.current.table.download(
         'csv',
         'earning-by-store-by-location-data.csv'
      )
   }

   const downloadPdfData = () => {
      earningByStoreLocationRef.current.table.downloadToTab(
         'pdf',
         'earning-by-store-by-location-data.pdf'
      )
   }

   const downloadXlsxData = () => {
      earningByStoreLocationRef.current.table.download(
         'xlsx',
         'earning-by-store-by-location-data.xlsx'
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
         title: 'Location Id',
         field: 'id',
         headerFilter: true,
         hozAlign: 'left',
      },
      {
         title: 'Label',
         field: 'label',
         headerFilter: true,
         hozAlign: 'center',
      },
      {
         title: '# of Orders',
         field: 'totalOrders',
         hozAlign: 'right',
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
      setSortedEarningByStoreLocation(rows.map(eachRow => eachRow._row.data))
   }

   if (earningByStoreLocation.length == 0) {
      return <Filler message="No Earning in this time interval" />
   }
   return (
      <>
         <Spacer size="15px" />
         <Flex container flexDirection="column">
            <Text as="h3" style={{ padding: '0px 10px' }}>
               Earning By Store Location Table
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
            </Flex>
            <Spacer size="10px" />
            <ReactTabulator
               dataLoaded={dataLoaded}
               ref={earningByStoreLocationRef}
               data={earningByStoreLocation}
               columns={columns}
               options={TableOptions}
               className="report-table earning-by-store-location-table"
               dataSorted={dataSorted}
            />
         </Flex>
      </>
   )
}

export default React.memo(
   EarningByStoreLocationTable,
   (prevProps, nextProps) => {
      return (
         prevProps.earningByStoreLocation === nextProps.earningByStoreLocation
      )
   }
)
