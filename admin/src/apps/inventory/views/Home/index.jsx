import { DashboardTile } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { useSubscription } from '@apollo/react-hooks'
import { useTranslation } from 'react-i18next'

// import { Context } from '../../context/tabs'
import { StyledCardList, StyledHome } from './styled'
import {
   ALL_AVAILABLE_SUPPLIERS_COUNT_SUBSCRIPTION,
   SUPPLIERS_COUNT_SUBSCRIPTION,
   SUPPLIER_ITEMS_COUNT_SUBSCRIPTION,
} from '../../graphql'
import {
   BULK_WORK_ORDERS_COUNT_SUBSCRIPTION,
   SACHET_WORK_ORDERS_COUNT_SUBSCRIPTION,
   PURCHASE_ORDERS_COUNT_SUBSCRIPTION,
   PACKAGINGS_COUNT_SUBSCRIPTION,
} from '../../graphql/subscriptions/index'
import { useTabs } from '../../../../shared/providers'
import { Banner } from '../../../../shared/components'

const address = 'apps.inventory.views.home.'

const Home = () => {
   const { t } = useTranslation()
   const { addTab } = useTabs()

   const logError = error => {
      console.log(error)
      toast.error('Error! Please try reloading the page')
   }

   const { data: availableSuppliers } = useSubscription(
      ALL_AVAILABLE_SUPPLIERS_COUNT_SUBSCRIPTION
   )
   const { data: suppliers } = useSubscription(SUPPLIERS_COUNT_SUBSCRIPTION, {
      onError: logError,
   })
   const { data: supplierItems } = useSubscription(
      SUPPLIER_ITEMS_COUNT_SUBSCRIPTION,
      {
         onError: logError,
      }
   )
   const { data: bulkOrders } = useSubscription(
      BULK_WORK_ORDERS_COUNT_SUBSCRIPTION,
      {
         onError: logError,
      }
   )
   const { data: sachetOrders } = useSubscription(
      SACHET_WORK_ORDERS_COUNT_SUBSCRIPTION,
      {
         onError: logError,
      }
   )
   const { data: purchaseOrders } = useSubscription(
      PURCHASE_ORDERS_COUNT_SUBSCRIPTION,
      {
         onError: logError,
      }
   )
   const { data: packagings } = useSubscription(PACKAGINGS_COUNT_SUBSCRIPTION, {
      onError: logError,
   })

   return (
      <StyledHome>
         <Banner id="inventory-app-home-top" />
         <h1>{t(address.concat('inventory app'))}</h1>
         <StyledCardList>
            <DashboardTile
               title={t(address.concat('suppliers'))}
               count={suppliers?.suppliersAggregate?.aggregate?.count || '...'}
               conf={`${
                  availableSuppliers?.suppliersAggregate?.aggregate?.count ||
                  '...'
               } available`}
               onClick={() => addTab('Suppliers', '/inventory/suppliers')}
            />
            <DashboardTile
               title={t(address.concat('items'))}
               count={
                  supplierItems?.supplierItemsAggregate?.aggregate?.count ||
                  '...'
               }
               conf="All available"
               onClick={() => addTab('Supplier Items', '/inventory/items')}
            />
            <DashboardTile
               title={t(address.concat('work orders'))}
               count={
                  bulkOrders?.bulkWorkOrdersAggregate?.aggregate?.count +
                     sachetOrders?.sachetWorkOrdersAggregate?.aggregate
                        ?.count || '...'
               }
               conf={`${
                  bulkOrders?.bulkWorkOrdersAggregate?.aggregate?.count || '...'
               } Bulk and ${
                  sachetOrders?.sachetWorkOrdersAggregate?.aggregate?.count ||
                  '...'
               } Sachets`}
               onClick={() => addTab('Work Orders', '/inventory/work-orders')}
            />
            <DashboardTile
               title={t(address.concat('purchase orders'))}
               count={
                  purchaseOrders?.purchaseOrderItemsAggregate?.aggregate
                     ?.count || '...'
               }
               onClick={() =>
                  addTab('Purchase Orders', '/inventory/purchase-orders')
               }
            />
            <DashboardTile
               title="Packagings"
               count={packagings?.packagingAggregate?.aggregate?.count || '...'}
               onClick={() => addTab('Packagings', '/inventory/packagings')}
            />
         </StyledCardList>
         <Banner id="inventory-app-home-bottom" />
      </StyledHome>
   )
}

export default Home
