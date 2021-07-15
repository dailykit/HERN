import { useMutation } from '@apollo/react-hooks'
import { Loader, Text, TunnelHeader } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { v4 as uuid } from 'uuid'
import { logger } from '../../../../../shared/utils'
import { TunnelContainer } from '../../../components'
import { GENERAL_ERROR_MESSAGE } from '../../../constants/errorMessages'
import {
   ITEM_PURCHASE_ORDERS_CREATE_TUNNEL,
   PACKAGING_PURCHASE_ORDERS_CREATE_TUNNEL,
} from '../../../constants/infoMessages'
import { useTabs } from '../../../../../shared/providers'
import { Banner } from '../../../../../shared/components'
import {
   CREATE_ITEM_PURCHASE_ORDER,
   CREATE_PURCHASE_ORDER,
} from '../../../graphql'
import { SolidTile } from '../styled'

function onError(error) {
   toast.error(GENERAL_ERROR_MESSAGE)
   logger(error)
}

export default function SelectPurchaseOrderTypeTunnel({ close }) {
   const { addTab } = useTabs()

   const [createPackagingOrder, { loading }] = useMutation(
      CREATE_PURCHASE_ORDER,
      {
         onCompleted: data => {
            const { id } = data.item
            const tabTitle = `Purchase Order-${uuid().substring(30)}`
            addTab(tabTitle, `/inventory/purchase-orders/packaging/${id}`)
         },
         onError,
      }
   )

   const [createItemPurchaseOrder, { loading: itemOrderLoading }] = useMutation(
      CREATE_ITEM_PURCHASE_ORDER,
      {
         onCompleted: data => {
            const { id } = data.item
            const tabTitle = `Purchase Order-${uuid().substring(30)}`
            addTab(tabTitle, `/inventory/purchase-orders/item/${id}`)
         },
         onError,
      }
   )

   const createPackagingPurchaseOrder = () => {
      createPackagingOrder()
   }

   const createSupplierItemPurchaseOrder = () => {
      createItemPurchaseOrder()
   }

   if (loading || itemOrderLoading) return <Loader />

   return (
      <>
         <TunnelHeader
            title="select type of packaging"
            close={() => {
               close(1)
            }}
         />
         <Banner id="inventory-app-purchase-orders-select-packaging-type-tunnel-top" />
         <TunnelContainer>
            <SolidTile onClick={createPackagingPurchaseOrder}>
               <Text as="h1">Packaging</Text>
               <Text as="subtitle">
                  Purchase orders associated with inventory packagings.
               </Text>
            </SolidTile>
            <br />
            <SolidTile onClick={createSupplierItemPurchaseOrder}>
               <Text as="h1">Supplier Item</Text>
               <Text as="subtitle">
                  Purchase orders associated with inventory supplier items.
               </Text>
            </SolidTile>
            <Banner id="inventory-app-purchase-orders-select-packaging-type-tunnel-bottom" />
         </TunnelContainer>
      </>
   )
}
