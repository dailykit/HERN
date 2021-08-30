import { useSubscription } from '@apollo/react-hooks'
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'
import {
   Flex,
   HorizontalTab,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   HorizontalTabs,
} from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { v4 as uuid } from 'uuid'
import { InlineLoader, Tooltip } from '../../../../../shared/components'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import { logger } from '../../../../../shared/utils'
import { dateFmt } from '../../../../../shared/utils/dateFmt'
import { GENERAL_ERROR_MESSAGE } from '../../../constants/errorMessages'
import { PURCHASE_ORDERS_SUBSCRIPTION } from '../../../graphql'
import tableOptions from '../tableOption'

export default function ItemPurchaseOrders() {
   const { addTab } = useTabs()
   const { tooltip } = useTooltip()

   const {
      loading,
      data: { purchaseOrderItems = [] } = {},
      error,
   } = useSubscription(PURCHASE_ORDERS_SUBSCRIPTION, {
      variables: { type: 'SUPPLIER_ITEM' },
   })

   if (error) {
      toast.error(GENERAL_ERROR_MESSAGE)
      logger(error)
   }

   const openForm = (_, cell) => {
      const { id } = cell.getData()
      const tabTitle = `Purchase Order-${uuid().substring(30)}`
      addTab(tabTitle, `/inventory/purchase-orders/item/${id}`)
   }

   const columns = [
      {
         title: 'Id',
         field: 'id',
         frozen: true,
         width: 80,  
         headerFilter: false,
         cssClass: 'RowClick',
         cellClick: openForm,
         headerTooltip: col => {
            const identifier = 'purchase_orders_listings_table_id'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Item',
         field: 'supplierItem.name',
         frozen: true,
         width: 400,
         cssClass: 'RowClick',
         cellClick: openForm,
         headerFilter: false,
         headerTooltip: col => {
            const identifier = 'purchase_orders_listings_table_item_name'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Order quantity',
         field: 'orderQuantity',
         formatter: reactFormatter(<RenderQuantity />),
         headerFilter: false,
         headerTooltip: col => {
            const identifier = 'purchase_orders_listings_table_order-quantity'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Created at',
         field: 'created_at',
         headerFilter: false,
         formatter: reactFormatter(<ShowDate />),
         headerTooltip: col => {
            const identifier = 'purchase_orders_listings_table_order-created_at'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
   ]

   if (loading) return <InlineLoader />

   return (
      <HorizontalTabs>
         <HorizontalTabList>
            <HorizontalTab>
               <Flex container alignItems="center">
                  COMPLETED
                  <Tooltip identifier="purchase-orders-listings_COMPLETED_tab" />
               </Flex>
            </HorizontalTab>
            <HorizontalTab>
               <Flex container alignItems="center">
                  PENDING
                  <Tooltip identifier="purchase-orders-listings_PENDING_tab" />
               </Flex>
            </HorizontalTab>
            <HorizontalTab>
               <Flex container alignItems="center">
                  CANCELLED
                  <Tooltip identifier="purchase-orders-listings_CANCELLED_tab" />
               </Flex>
            </HorizontalTab>
            <HorizontalTab>
               <Flex container alignItems="center">
                  UNPUBLISHED
                  <Tooltip identifier="purchase-orders-listings_UNPUBLISHED_tab" />
               </Flex>
            </HorizontalTab>
         </HorizontalTabList>
         <HorizontalTabPanels>
            <HorizontalTabPanel>
               <ReactTabulator
                  columns={columns}
                  data={purchaseOrderItems.filter(
                     col => col.status === 'COMPLETED'
                  )}
                  options={tableOptions}
               />
            </HorizontalTabPanel>
            <HorizontalTabPanel>
               <ReactTabulator
                  columns={columns}
                  data={purchaseOrderItems.filter(
                     col => col.status === 'PENDING'
                  )}
                  options={tableOptions}
               />
            </HorizontalTabPanel>
            <HorizontalTabPanel>
               <ReactTabulator
                  columns={columns}
                  data={purchaseOrderItems.filter(
                     col => col.status === 'CANCELLED'
                  )}
                  options={tableOptions}
               />
            </HorizontalTabPanel>
            <HorizontalTabPanel>
               <ReactTabulator
                  columns={columns}
                  data={purchaseOrderItems.filter(
                     col => col.status === 'UNPUBLISHED'
                  )}
                  options={tableOptions}
               />
            </HorizontalTabPanel>
         </HorizontalTabPanels>
      </HorizontalTabs>
   )
}

function ShowDate({
   cell: {
      _cell: { value },
   },
}) {
   return <>{dateFmt.format(new Date(value))}</>
}

function RenderQuantity({ cell }) {
   const { orderQuantity, unit } = cell.getData()

   return `${orderQuantity} ${unit || ''}`
}
