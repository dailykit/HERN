import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Filler,
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   TunnelHeader,
   useSingleList,
} from '@dailykit/ui'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
   Banner,
   ErrorState,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils/errorLog'
import { GENERAL_ERROR_MESSAGE } from '../../../../../constants/errorMessages'
import { NO_SUPPLIER_ITEMS } from '../../../../../constants/infoMessages'
import {
   SUPPLIER_ITEMS_SUBSCRIPTION,
   UPDATE_PURCHASE_ORDER_ITEM,
} from '../../../../../graphql'
import { TunnelWrapper } from '../../../utils/TunnelWrapper'

const address =
   'apps.inventory.views.forms.purchaseorders.tunnels.selectsupplieritemtunnel.'

export default function AddressTunnel({ close, state }) {
   const { t } = useTranslation()
   const [search, setSearch] = useState('')
   const [data, setData] = useState([])

   const [list, current, selectOption] = useSingleList(data)

   const { loading, error } = useSubscription(SUPPLIER_ITEMS_SUBSCRIPTION, {
      onSubscriptionData: input => {
         const data = input.subscriptionData.data.supplierItems
         setData(data)
      },
   })

   const [updatePurchaseOrder] = useMutation(UPDATE_PURCHASE_ORDER_ITEM, {
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
         close(1)
      },
      onCompleted: () => {
         toast.success('Supplier Item added!')
         close(1)
      },
   })

   const handleSave = option => {
      updatePurchaseOrder({
         variables: {
            id: state.id,
            set: {
               supplierItemId: option.id,
               bulkItemId: option.bulkItemAsShippedId,
               supplierId: option.supplier?.id,
            },
         },
      })
   }

   if (error) {
      logger(error)
      return <ErrorState />
   }

   if (loading) return <InlineLoader />

   return (
      <>
         <TunnelHeader
            title={t(address.concat('select supplier item'))}
            close={() => close(1)}
            description="select a supplier item to use in this purchase order"
            tooltip={
               <Tooltip identifier="purchase-order_select_supplier_item_tunnel" />
            }
         />
         <TunnelWrapper>
            <Banner id="inventory-app-purchase-orders-item-select-supplier-item-tunnel-top" />
            {list.length ? (
               <List>
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder="type what you’re looking for..."
                  />
                  <ListHeader type="SSL1" label="supplier item" />
                  <ListOptions>
                     {list
                        .filter(option =>
                           option.name.toLowerCase().includes(search)
                        )
                        .map(option => (
                           <ListItem
                              type="SSL1"
                              key={option.id}
                              title={option.name}
                              isActive={option.id === current.id}
                              onClick={() => handleSave(option)}
                           />
                        ))}
                  </ListOptions>
               </List>
            ) : (
               <Filler message={NO_SUPPLIER_ITEMS} />
            )}
            <Banner id="inventory-app-purchase-orders-item-select-supplier-item-tunnel-bottom" />
         </TunnelWrapper>
      </>
   )
}
