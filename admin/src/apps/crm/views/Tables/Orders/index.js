import React, { useEffect, useState, useRef, useContext } from 'react'
import { Text, Flex } from '@dailykit/ui'
import { useQuery } from '@apollo/react-hooks'
import { useHistory } from 'react-router-dom'
import { ReactTabulator } from '@dailykit/react-tabulator'
import OrderPage from './Order'
import { ORDERS_LISTING } from '../../../graphql'
import { Tooltip, InlineLoader } from '../../../../../shared/components'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import options from '../../tableOptions'
import { toast } from 'react-toastify'
import { currencyFmt, logger } from '../../../../../shared/utils'
// import BrandContext from '../../../context/Brand'
import * as moment from 'moment'
import { BrandContext } from '../../../../../App'

const OrdersTable = ({ id }) => {
   // const [context, setContext] = useContext(BrandContext)
   const [brandContext, setBrandContext] = useContext(BrandContext)

   const { dispatch, tab } = useTabs()
   const { tooltip } = useTooltip()
   const [orders, setOrders] = useState([])
   const tableRef = useRef(null)
   const history = useHistory()
   const { loading: listLoading } = useQuery(ORDERS_LISTING, {
      variables: {
         keycloakId: id,
         brandId: brandContext.brandId,
      },
      onCompleted: ({ brand: { brand_customers = [] } = {} } = {}) => {
         const result = brand_customers[0]?.customer?.orders.map(order => ({
            id: order?.id,
            products: order?.cart?.cartItems?.length || '0',
            walletAmountUsed: currencyFmt(order?.cart?.walletAmountUsed),
            loyaltyPointsUsed: order?.cart?.loyaltyPointsUsed,
            discount: currencyFmt(order?.discount),
            amountPaid: `${currencyFmt(order?.amountPaid) || 'N/A'}`,
            channel: order?.cart?.source || 'N/A',
            orderedOn:
               moment(order?.created_at).format('MMMM Do YYYY, h:mm:ss a') ||
               'N/A',
            deliveredOn: 'N/A',
         }))
         setOrders(result)
      },
      onError: error => {
         toast.error('Something went wrong Orders !')
         logger(error)
      },
   })
   useEffect(() => {
      if (!tab) {
         history.push('/crm/customers')
      }
   }, [history, tab])

   const columns = [
      {
         title: 'Order Id',
         field: 'id',
         headerFilter: true,
         hozAlign: 'right',
         cssClass: 'rowClick',
         headerTooltip: function (column) {
            const identifier = 'order_listing_id_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         cellClick: (e, cell) => {
            rowClick(e, cell)
         },
         width: 150,
      },
      {
         title: 'Products',
         field: 'products',
         hozAlign: 'right',
         headerTooltip: function (column) {
            const identifier = 'order_listing_products_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 150,
      },
      {
         title: 'Loyalty Points Used',
         field: 'loyaltyPointsUsed',
         hozAlign: 'right',
         headerTooltip: function (column) {
            const identifier = 'order_listing_loyalty_points_used_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         formatter: cell => cell.getValue(),
         width: 150,
      },
      {
         title: 'Wallet Amount Used',
         field: 'walletAmountUsed',
         hozAlign: 'right',
         headerTooltip: function (column) {
            const identifier = 'order_listing_wallet_used_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         formatter: cell => cell.getValue(),
         width: 150,
      },
      {
         title: 'Discount',
         field: 'discount',
         hozAlign: 'right',
         headerTooltip: function (column) {
            const identifier = 'order_listing_discount_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         formatter: cell => cell.getValue(),
         width: 150,
      },
      {
         title: 'Total Paid',
         field: 'amountPaid',
         hozAlign: 'right',
         headerTooltip: function (column) {
            const identifier = 'order_listing_paid_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         formatter: cell => cell.getValue(),
         width: 150,
      },
      {
         title: 'Channel',
         field: 'channel',
         hozAlign: 'left',
         headerTooltip: function (column) {
            const identifier = 'order_listing_channel_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },

         width: 150,
      },
      {
         title: 'Ordered On',
         field: 'orderedOn',
         hozAlign: 'right',
         headerTooltip: function (column) {
            const identifier = 'order_listing_ordered_on_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 150,
      },
      {
         title: 'Delivered On',
         field: 'deliveredOn',
         hozAlign: 'right',
         headerTooltip: function (column) {
            const identifier = 'order_listing_delivered_on_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 150,
      },
   ]

   const setOrder = React.useCallback(
      (orderId, order) => {
         dispatch({
            type: 'STORE_TAB_DATA',
            payload: {
               path: tab?.path,
               data: { oid: orderId, isOrderClicked: order },
            },
         })
      },
      [tab, dispatch]
   )

   const rowClick = (e, cell) => {
      const orderId = cell._cell.row.data.id
      setOrder(orderId, true)
   }

   console.log(orders)

   if (listLoading) return <InlineLoader />
   return (
      <Flex maxWidth="1280px" width="calc(100vw-64px)" margin="0 auto">
         {tab.data.isOrderClicked ? (
            <OrderPage />
         ) : (
            <>
               <Flex container alignItems="center">
                  <Text as="title">
                     Orders(
                     {orders?.length || 0})
                  </Text>
                  <Tooltip identifier="order_list_heading" />
               </Flex>
               {Boolean(orders) && (
                  <ReactTabulator
                     columns={columns}
                     data={orders}
                     options={{
                        ...options,
                        placeholder: 'No Order Available Yet !',
                     }}
                     ref={tableRef}
                  />
               )}
            </>
         )}
      </Flex>
   )
}

export default OrdersTable
