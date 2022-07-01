import { useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
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
import { ErrorState, InlineLoader } from '../../../../../shared/components'
import { useTabs } from '../../../../../shared/providers'
import { logger } from '../../../../../shared/utils'
import { ORDERS_ACCOUNTS } from '../../../graphql'
import TableOptions from '../tableOptions'
import '../tableStyle.css'
const OrdersAccounts = () => {
   const [orderData, setOrderData] = useState([])
   const [status, setStatus] = useState({ loading: true })

   //get orders data (subscription)
   const { loading: subsLoading, error: subsError } = useSubscription(
      ORDERS_ACCOUNTS,
      {
         variables: {
            where: { orderId: { _is_null: false } },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const cartData = subscriptionData.data.carts.map(cart => {
               cart.loyaltyPointRedeem =
                  cart.loyaltyPointTransactions.amountRedeemed
               cart.created_at = moment(cart.created_at).format('ll')
               cart.customerFullName =
                  (cart.customerInfo?.customerFirstName || 'N/A') +
                  ' ' +
                  cart.customerInfo?.customerLastName
               cart.customerEmail = cart.customerInfo?.customerEmail
               cart.customerPhone = cart.customerInfo?.customerPhone
               return cart
            })
            setOrderData(cartData)
            setStatus({ ...status, loading: false })
         },
      }
   )

   console.log('orderData', orderData)

   if ((!subsError && subsLoading) || status.loading) {
      return <InlineLoader />
   }

   if (subsError) {
      logger(subsError)
      toast.error('Could not get the Orders data')
      return (
         <ErrorState height="320px" message="Could not get the Orders data" />
      )
   }

   if (orderData.length == 0) {
      return <Filler message="No  Order Data Available" />
   }

   return (
      <>
         <Flex container flexDirection="column" width="100%" margin="10px">
            <Flex>
               <Text as="h2">Orders Accounting Table</Text>
            </Flex>
            <Flex container flexDirection="column" justifyContent="center">
               <DataTable data={orderData} />
            </Flex>
         </Flex>
      </>
   )
}

const DataTable = ({ data }) => {
   const orderAccountTableRef = React.useRef()
   const { addTab, tab } = useTabs()

   const [groupByOptions] = React.useState([
      { id: 1, title: 'Customer Name', payload: 'customerFullName' },
      { id: 2, title: 'Created At', payload: 'created_at' },
   ])

   const defaultIDs = () => {
      let arr = []
      const recipeGroup = localStorage.getItem(
         'tabulator-order-accountancy-group'
      )
      const recipeGroupParse =
         recipeGroup !== undefined &&
         recipeGroup !== null &&
         recipeGroup.length !== 0
            ? JSON.parse(recipeGroup)
            : null
      if (recipeGroupParse !== null) {
         recipeGroupParse.forEach(x => {
            const foundGroup = groupByOptions.find(y => y.payload == x)
            arr.push(foundGroup.id)
         })
      }
      return arr.length == 0 ? [] : arr
   }

   const totalCalc = (values, data, calcParams) => {
      let total = 0
      values.forEach(value => {
         total += value
      })
      console.log('hi', total)
      return `Σ = ${total.toFixed(2)}`
   }
   const columns = [
      {
         title: 'Order Id',
         field: 'orderId',
         cellClick: (e, cell) => {
            const { orderId } = cell._cell.row.data
            addTab(`ORD${orderId}`, `/order/orders/${orderId}`)
         },
         cssClass: 'colHover',
         width: 100,
         headerFilter: true,
      },
      {
         title: 'Customer Name',
         field: 'customerFullName',
         headerFilter: true,
      },
      {
         title: 'Amount Paid',
         field: 'amount',
         bottomCalc: totalCalc,
         width: 150,
      },
      {
         title: 'Discount',
         field: 'couponDiscount',
         bottomCalc: totalCalc,
         width: 100,
      },
      {
         title: 'Wallet Amount Used',
         field: 'walletAmountUsed',
         bottomCalc: totalCalc,
         width: 100,
      },
      {
         title: 'Loyalty Point Used',
         field: 'loyaltyPointsUsed',
         bottomCalc: totalCalc,
         width: 100,
      },
      {
         title: 'Created At',
         field: 'created_at',
         headerFilter: true,
         width: 150,
      },
   ]
   console.log('orderRef', orderAccountTableRef)
   const downloadCsvData = () => {
      orderAccountTableRef.current.table.download(
         'csv',
         'order-accountancy.csv'
      )
   }
   const downloadPdfData = () => {
      orderAccountTableRef.current.table.download(
         'pdf',
         'order-accountancy.pdf'
      )
   }
   const downloadXlsxData = () => {
      orderAccountTableRef.current.table.download(
         'xlsx',
         'order-accountancy.xlsx'
      )
   }
   const handleGroupBy = options => {
      orderAccountTableRef.current.table.setGroupBy(options)
   }
   const tableDataLoaded = () => {
      //setGroupBy On data loaded by persists group options
      const orderAccountGroup = localStorage.getItem(
         'tabulator-order-accountancy-group'
      )
      const parseOrderAccountGroup = orderAccountGroup
         ? JSON.parse(orderAccountGroup)
         : null
      orderAccountTableRef.current.table.setGroupBy(
         parseOrderAccountGroup ? parseOrderAccountGroup : []
      )

      //setGroupHeader
      orderAccountTableRef.current.table.setGroupHeader(function (
         value,
         count,
         data1,
         group
      ) {
         let newHeader
         switch (group._group.field) {
            case 'customerFullName':
               newHeader = 'Customer Name'
               break
            case 'created_at':
               newHeader = 'Created At'
               break
            default:
               break
         }
         return `${newHeader} - ${value} || ${count} ${
            count == 1 ? 'Order' : 'Orders'
         }`
      })
   }
   const selectedOption = option => {
      localStorage.setItem(
         'tabulator-order-accountancy-group',
         JSON.stringify(option.map(val => val.payload))
      )
      const newOptions = option.map(val => val.payload)
      handleGroupBy(newOptions)
   }
   const searchedOption = option => console.log(option)
   return (
      <>
         <Flex container justifyContent="flex-end">
            <Flex container alignItems="center">
               <Text as="text1">Group By:</Text>
               <Spacer size="5px" xAxis />
               <Dropdown
                  type="multi"
                  variant="revamp"
                  disabled={true}
                  options={groupByOptions}
                  selectedOption={selectedOption}
                  searchedOption={searchedOption}
                  defaultIds={defaultIDs()}
                  typeName=" "
               />
               <Spacer xAxis size="15px" />
            </Flex>
            <Flex>
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
            </Flex>
         </Flex>
         <Spacer size="35px" />
         <Flex>
            <ReactTabulator
               dataLoaded={tableDataLoaded}
               ref={orderAccountTableRef}
               columns={columns}
               data={data}
               options={TableOptions}
               className="order-account"
            />
         </Flex>
      </>
   )
}

export default OrdersAccounts
