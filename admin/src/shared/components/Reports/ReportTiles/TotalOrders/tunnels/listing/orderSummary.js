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
import moment from 'moment'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../utils'
import { ErrorState } from '../../../../../ErrorState'
import { InlineLoader } from '../../../../../InlineLoader'
import { ORDER_SUMMARY } from '../../graphql/subscription'
import TableOptions from '../tableOptions'
const OrderSummaryTable = props => {
   const { from, to, brandShop } = props
   const orderSummaryTableRef = React.useRef()
   const [orderSummaryData, setOrderSummaryData] = useState([])
   const { loading: subsLoading, error: subsError } = useSubscription(
      ORDER_SUMMARY,
      {
         variables: {
            where: {
               _and: [
                  {
                     created_at: {
                        _gte: from,
                     },
                  },
                  { created_at: { _lte: to } },
               ],
               isAccepted: { _eq: true },
               cart: {
                  paymentStatus: { _eq: 'SUCCEEDED' },
                  ...(brandShop.shopTitle && {
                     source: { _eq: brandShop.shopTitle },
                  }),
               },
               isRejected: { _is_null: true },
               ...(brandShop.brandId && {
                  brandId: { _eq: brandShop.brandId },
               }),
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const flattenData = subscriptionData.data.orders.map(eachOrder => {
               const flattenEachOrder = {}
               flattenEachOrder.orderId = eachOrder.id
               flattenEachOrder.customerName =
                  eachOrder.customer?.platform_customer_?.fullName || 'N/A'
               flattenEachOrder.created_at = moment(
                  eachOrder.created_at
               ).format('DD MMM YYYY')
               flattenEachOrder.fulfillmentDate = eachOrder.fulfillmentTimestamp
                  ? moment(eachOrder.fulfillmentTimestamp).format('DD MM YYYY')
                  : 'N/A'
               switch (eachOrder.cart.status) {
                  case 'ORDER_PENDING':
                     flattenEachOrder.orderStatus = 'Pending'
                     break
                  case 'ORDER_UNDER_PROCESSING':
                     flattenEachOrder.orderStatus = 'Under Processing'
                     break
                  case 'ORDER_READY_TO_ASSEMBLE':
                     flattenEachOrder.orderStatus = 'Ready To Assemble'
                     break
                  case 'ORDER_READY_TO_DISPATCH':
                     flattenEachOrder.orderStatus = 'Ready To Dispatch'
                     break
                  case 'ORDER_OUT_FOR_DELIVERY':
                     flattenEachOrder.orderStatus = 'Out For Delivery'
                     break
                  case 'ORDER_DELIVERED':
                     flattenEachOrder.orderStatus = 'Delivered'
                     break
                  default:
                     flattenEachOrder.orderStatus = 'Status Not Available'
               }
               return flattenEachOrder
            })
            setOrderSummaryData(flattenData)
         },
      }
   )

   const downloadCsvData = () => {
      orderSummaryTableRef.current.table.download(
         'csv',
         'earning-by-product-data.csv'
      )
   }

   const downloadPdfData = () => {
      orderSummaryTableRef.current.table.downloadToTab(
         'pdf',
         'earning-by-product-data.pdf'
      )
   }

   const downloadXlsxData = () => {
      orderSummaryTableRef.current.table.download(
         'xlsx',
         'earning-by-product-data.xlsx'
      )
   }
   //default ids for columns to be show dropdown
   const defaultIds = () => {
      const defaultShowColumns = localStorage.getItem(
         'order-summary-table-show-columns'
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
         'order-summary-table-show-columns',
         JSON.stringify(ids)
      )
      //
      columns.forEach(eachOption => {
         if (eachOption.toBeHide) {
            if (ids.includes(eachOption.id)) {
               orderSummaryTableRef.current.table.showColumn(eachOption.field)
            } else {
               orderSummaryTableRef.current.table.hideColumn(eachOption.field)
            }
         }
      })
   }
   //columns to be show dropdown search option
   const searchedOption = option => console.log(option)
   // fn run after table data loaded
   const dataLoaded = () => {
      const defaultShowColumns =
         localStorage.getItem('order-summary-table-show-columns') || []
      const parseDefaultColumns = JSON.parse(defaultShowColumns)
      if (parseDefaultColumns) {
         columns.forEach(eachOption => {
            if (
               !parseDefaultColumns.includes(eachOption.id) &&
               eachOption.toBeHide
            ) {
               orderSummaryTableRef.current.table.hideColumn(eachOption.field)
            }
         })
      }
   }
   const columns = [
      {
         id: 1,
         title: 'Order Id',
         field: 'orderId',
         toBeHide: false,
      },
      { id: 2, title: 'Customer Name', field: 'customerName', toBeHide: false },
      { id: 3, title: 'Created At', field: 'created_at', toBeHide: true },
      {
         id: 4,
         title: 'Fulfillment Date',
         field: 'fulfillmentDate',
         toBeHide: true,
      },
      {
         id: 5,
         title: 'Status',
         field: 'orderStatus',
         toBeHide: false,
      },
   ]
   if (!subsError && subsLoading) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      toast.error('Could not get the order summary')
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
                     Order Summary Table
                  </Text>
                  {orderSummaryData.length > 0 && (
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
                  {orderSummaryData.length === 0 ? (
                     <Filler message="Data not available" />
                  ) : (
                     <ReactTabulator
                        ref={orderSummaryTableRef}
                        dataLoaded={dataLoaded}
                        data={orderSummaryData}
                        columns={columns}
                        options={TableOptions}
                     />
                  )}
               </Flex>
            </div>
         </Flex>
      </>
   )
}

export default OrderSummaryTable
