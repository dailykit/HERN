import { useSubscription } from '@apollo/react-hooks'
import { ReactTabulator } from '@dailykit/react-tabulator'
import {
   Dropdown,
   DropdownButton,
   Filler,
   Flex,
   Spacer,
   Text,
} from '@dailykit/ui'
import '../../../tableStyle.css'
import moment from 'moment'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../utils'
import { BrandShopDateContext } from '../../../../../BrandShopDateProvider/context'
import { ErrorState } from '../../../../../ErrorState'
import { InlineLoader } from '../../../../../InlineLoader'
import { ORDER_SUMMARY } from '../../graphql/subscription'
import TableOptions from '../tableOptions'
const OrderRejectTable = () => {
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const rejectedOrderTableRef = React.useRef()
   const [rejectedOrderData, setRejectedOrderData] = useState([])
   const { loading: subsLoading, error: subsError } = useSubscription(
      ORDER_SUMMARY,
      {
         variables: {
            where: {
               _and: [
                  {
                     created_at: {
                        _gte: brandShopDateState.from,
                     },
                  },
                  { created_at: { _lte: brandShopDateState.to } },
               ],
               isRejected: { _eq: true },
               ...(brandShopDateState.brandShop.brandId && {
                  brandId: { _eq: brandShopDateState.brandShop.brandId },
               }),
               cart: {
                  // paymentStatus: { _eq: 'SUCCEEDED' },
                  ...(brandShopDateState.brandShop.shopTitle && {
                     source: { _eq: brandShopDateState.brandShop.shopTitle },
                  }),
               },
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const newRejectedData = subscriptionData.data.orders.map(
               eachRejectedData => {
                  const flattenData = {}
                  flattenData.orderId = eachRejectedData.id
                  flattenData.fulfillmentDate =
                     eachRejectedData.fulfillmentTimestamp
                        ? moment(eachRejectedData.fulfillmentTimestamp).format(
                             'DD-MM-YYYY'
                          )
                        : 'N/A'
                  flattenData.created_at = moment(
                     eachRejectedData.created_at
                  ).format('DD-MM-YYYY')
                  flattenData.customerName =
                     eachRejectedData.customer?.platform_customer?.fullName ||
                     'N/A'
                  flattenData.amountPaid = eachRejectedData.amountPaid
                  return flattenData
               }
            )
            setRejectedOrderData(newRejectedData)
         },
      }
   )
   const downloadCsvData = () => {
      rejectedOrderTableRef.current.table.download('csv', 'order-rejected.csv')
   }

   const downloadPdfData = () => {
      rejectedOrderTableRef.current.table.downloadToTab(
         'pdf',
         'order-rejected.pdf'
      )
   }

   const downloadXlsxData = () => {
      rejectedOrderTableRef.current.table.download(
         'xlsx',
         'order-rejected.xlsx'
      )
   }
   //default ids for columns to be show dropdown
   const defaultIds = () => {
      const defaultShowColumns = localStorage.getItem(
         'order-rejected-table-show-columns'
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
         'order-rejected-table-show-columns',
         JSON.stringify(ids)
      )
      //
      columns.forEach(eachOption => {
         if (eachOption.toBeHide) {
            if (ids.includes(eachOption.id)) {
               rejectedOrderTableRef.current.table.showColumn(eachOption.field)
            } else {
               rejectedOrderTableRef.current.table.hideColumn(eachOption.field)
            }
         }
      })
   }
   //columns to be show dropdown search option
   const searchedOption = option => console.log(option)
   // fn run after table data loaded
   const dataLoaded = () => {
      const defaultShowColumns =
         localStorage.getItem('order-rejected-table-show-columns') || []
      const parseDefaultColumns = JSON.parse(defaultShowColumns)
      if (parseDefaultColumns) {
         columns.forEach(eachOption => {
            if (
               !parseDefaultColumns.includes(eachOption.id) &&
               eachOption.toBeHide
            ) {
               rejectedOrderTableRef.current.table.hideColumn(eachOption.field)
            }
         })
      }
   }
   const totalCalc = (values, data, calcParams) => {
      let total = 0
      values.forEach(value => {
         total += value
      })
      return `Σ = ${total.toFixed(2)}`
   }
   const columns = [
      {
         id: 1,
         title: 'Order Id',
         field: 'orderId',
         toBeHide: false,
         hozAlign: 'center',
      },
      {
         id: 2,
         title: 'Customer Name',
         field: 'customerName',
         toBeHide: false,
         hozAlign: 'left',
         width: 250,
      },
      {
         id: 3,
         title: 'Created At',
         field: 'created_at',
         toBeHide: true,
         hozAlign: 'left',
         width: 250,
      },
      {
         id: 4,
         title: 'Fulfillment Date',
         field: 'fulfillmentDate',
         toBeHide: true,
         hozAlign: 'left',
         width: 250,
      },
      {
         id: 5,
         title: `Amount Paid (${brandShopDateState.currency})`,
         field: 'amountPaid',
         toBeHide: false,
         hozAlign: 'right',
         bottomCalc: totalCalc,
         cssClass: 'digit-col',
      },
   ]
   if (!subsError && subsLoading) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      toast.error('Could not get the rejected order')
      return (
         <ErrorState
            height="320px"
            message="Could not get Earning by customer data"
         />
      )
   }
   return (
      <>
         <Flex>
            <div
               style={{
                  background: '#FFFFFF',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                  borderRadius: '10px',
                  padding: '10px 0px',
               }}
            >
               <Flex container flexDirection="column">
                  <Text as="h3" style={{ padding: '0px 10px' }}>
                     Rejected Orders Table
                  </Text>
               </Flex>
               {rejectedOrderData.length > 0 && (
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
                        options={columns.filter(x => x.toBeHide)}
                        defaultIds={defaultIds()}
                        searchedOption={searchedOption}
                        selectedOption={selectedOption}
                        placeholder="Columns to be show..."
                        typeName="option"
                        selectedOptionsVisible={false}
                     />
                  </Flex>
               )}
               <Spacer size="10px" />
               {rejectedOrderData.length === 0 ? (
                  <Filler message="No rejected orders" />
               ) : (
                  <ReactTabulator
                     ref={rejectedOrderTableRef}
                     dataLoaded={dataLoaded}
                     data={rejectedOrderData}
                     columns={columns}
                     options={TableOptions}
                     className="report-table order-rejected-table"
                  />
               )}
            </div>
         </Flex>
      </>
   )
}
export default React.memo(OrderRejectTable)
