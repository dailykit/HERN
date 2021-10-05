import React from 'react'
import { TextButton, Flex, Text } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import { ReactTabulator } from '@dailykit/react-tabulator'

import { QUERIES } from '../../../graphql'
import tableOptions from '../../../tableOptions'
import { useTabs, useTooltip } from '../../../../../shared/providers'
import {
   InlineLoader,
   CreateManualOrder,
} from '../../../../../shared/components'

export const Carts = () => {
   const { tab, addTab } = useTabs()
   const [isModeTunnelOpen, setIsModeTunnelOpen] = React.useState(false)

   React.useEffect(() => {
      if (!tab) {
         addTab('Carts', '/carts')
      }
   }, [tab, addTab])

   return (
      <Flex padding="0 32px">
         <Flex
            as="header"
            container
            height="80px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Text as="h2">Carts</Text>
            <TextButton type="solid" onClick={() => setIsModeTunnelOpen(true)}>
               Create Order
            </TextButton>
         </Flex>
         <Listing />
         <CreateManualOrder
            isModeTunnelOpen={isModeTunnelOpen}
            setIsModeTunnelOpen={setIsModeTunnelOpen}
         />
      </Flex>
   )
}

const Listing = () => {
   const { addTab } = useTabs()
   const { tooltip } = useTooltip()
   const tableRef = React.createRef()
   const { loading, data: { carts = {} } = {} } = useSubscription(
      QUERIES.CART.LIST,
      { variables: { where: { status: { _eq: 'CART_PENDING' } } } }
   )

   const rowClick = (e, cell) => {
      e.stopPropagation()
      const { id = null, source = '' } = cell.getData() || {}
      if (id && source) {
         let path = source === 'subscription' ? 'subscription' : 'ondemand'
         addTab(id, `/carts/${path}/${id}`)
      }
   }

   const columns = React.useMemo(
      () => [
         {
            width: 100,
            title: 'ID',
            field: 'id',
            headerFilter: true,
            cssClass: 'linkCell',
            cellClick: (e, cell) => rowClick(e, cell),
            headerTooltip: column => {
               const identifier = 'carts_listing_column_id'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Customer Name',
            formatter: cell => {
               const { customerInfo = {} } = cell.getData()
               let name = customerInfo?.customerFirstName
               if (customerInfo?.customerLastName) {
                  name += ' ' + customerInfo?.customerLastName
                  return name.trim()
               }
               return name?.trim() || 'N/A'
            },
            headerFilter: true,
            headerTooltip: column => {
               const identifier = 'carts_listing_column_customerName'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Customer Email',
            field: 'customerInfo.customerEmail',
            headerFilter: true,
            headerTooltip: column => {
               const identifier = 'carts_listing_column_customerEmail'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Customer Contact No.',
            field: 'customerInfo.customerPhone',
            headerFilter: true,
            headerTooltip: column => {
               const identifier = 'carts_listing_column_customerPhone'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            hozAlign: 'center',
         },
         {
            title: 'Source',
            field: 'source',
            headerFilter: true,
            headerTooltip: column => {
               const identifier = 'carts_listing_column_source'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Brand',
            field: 'brand.title',
            headerFilter: true,
            headerTooltip: column => {
               const identifier = 'carts_listing_column_brandTitle'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Fulfillment Type',
            formatter: cell => {
               const { fulfillmentInfo = {} } = cell.getData()
               if (!fulfillmentInfo?.type) return 'N/A'
               switch (fulfillmentInfo?.type) {
                  case 'PREORDER_DELIVERY':
                     return 'Pre Order Delivery'
                  case 'PREORDER_PICKUP':
                     return 'Pre Order Pickup'
                  case 'ONDEMAND_PICKUP':
                     return 'On demand Pickup'
                  case 'ONDEMAND_DELIVERY':
                     return 'On Demand Delivery'
                  default:
                     return 'N/A'
               }
            },
            headerFilter: true,
            headerTooltip: column => {
               const identifier = 'carts_listing_column_fulfillmentType'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
      ],
      []
   )
   if (loading) return <InlineLoader />
   return (
      <ReactTabulator
         ref={tableRef}
         columns={columns}
         data={carts.nodes || []}
         options={{
            ...tableOptions,
            placeholder: 'No carts available yet.',
         }}
         className="cart-table"
      />
   )
}
