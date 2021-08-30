import { useSubscription } from '@apollo/react-hooks'
import { ReactTabulator } from '@dailykit/react-tabulator'
import { Filler } from '@dailykit/ui'
import React from 'react'
import { ErrorState, InlineLoader } from '../../../../../shared/components'
import { useTooltip } from '../../../../../shared/providers/tooltip'
import { logger } from '../../../../../shared/utils/index'
import { NO_SUPPLIER_ITEMS_LISTINGS } from '../../../constants/emptyMessages'
import { useTabs } from '../../../../../shared/providers'
import { SUPPLIER_ITEM_LISTINGS } from '../../../graphql'
import tableOptions from '../tableOption'

export default function SupplierItemsListings({ tableRef }) {
   const { addTab } = useTabs()
   const {
      loading: itemsLoading,
      data: { supplierItems = [] } = {},
      error,
   } = useSubscription(SUPPLIER_ITEM_LISTINGS)

   const { tooltip } = useTooltip()

   if (error) {
      logger(error)
      return <ErrorState />
   }

   const openForm = (_, cell) => {
      const { id, name } = cell.getData()
      addTab(name, `/inventory/items/${id}`)
   }

   const columns = [
      {
         title: 'Item Name',
         field: 'name',
         frozen: true,
         width: 400,
         headerFilter: true,
         hozAlign: 'left',
         headerHozAlign: 'left',
         cssClass: 'RowClick',
         cellClick: openForm,
         headerTooltip: col => {
            const identifier = 'items_listings_item_name'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Supplier',
         field: 'supplier.name',
         headerFilter: false,
         headerTooltip: col => {
            const identifier = 'items_listings_supplier'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Bulk Items count',
         field: 'bulkItems_aggregate.aggregate.count',
         headerFilter: false,
         headerTooltip: col => {
            const identifier = 'items_listings_supplier_item_bulkItemCount'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
   ]

   if (itemsLoading) return <InlineLoader />
   if (supplierItems.length)
      return (
         <>
            <ReactTabulator
               ref={tableRef}
               columns={columns}
               data={supplierItems}
               options={tableOptions}
               style={{ marginTop: '16px' }}
            />
         </>
      )

   return <Filler message={NO_SUPPLIER_ITEMS_LISTINGS} />
}
