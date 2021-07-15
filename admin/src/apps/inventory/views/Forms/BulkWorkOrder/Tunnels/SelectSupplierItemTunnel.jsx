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
import { Banner, Tooltip } from '../../../../../../shared/components'
import { InlineLoader } from '../../../../../../shared/components/InlineLoader'
import { logger } from '../../../../../../shared/utils'
import { TunnelContainer } from '../../../../components'
import { GENERAL_ERROR_MESSAGE } from '../../../../constants/errorMessages'
import { NO_SUPPLIER_ITEMS } from '../../../../constants/infoMessages'
import {
   SUPPLIER_ITEMS_SUBSCRIPTION,
   UPDATE_BULK_WORK_ORDER,
} from '../../../../graphql'

const address = 'apps.inventory.views.forms.bulkworkorder.tunnels.'

export default function SelectSupplierTunnel({ close, state }) {
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

   const [updateBulkWorkOrder, { loading: updating }] = useMutation(
      UPDATE_BULK_WORK_ORDER,
      {
         onError: error => {
            logger(error)
            toast.error(GENERAL_ERROR_MESSAGE)
         },
         onCompleted: () => {
            toast.success('Supplier Item added!')
            close(1)
         },
      }
   )

   const handleSave = option => {
      // save supplierItem
      updateBulkWorkOrder({
         variables: {
            id: state.id,
            object: {
               supplierItemId: option.id,
            },
         },
      })
   }

   if (loading || updating) return <InlineLoader />
   if (error) {
      logger(error)
      return toast.error(GENERAL_ERROR_MESSAGE)
   }

   return (
      <>
         <TunnelHeader
            title={t(address.concat('select supplier item'))}
            close={() => close(1)}
            description="select a supplier item to use in this work order"
            tooltip={
               <Tooltip identifier="bulk-work-order_select_supplier_item_tunnel" />
            }
         />
         <Banner id="inventory-app-work-orders-bulk-supplier-item-tunnel-top" />
         <TunnelContainer>
            {list.length ? (
               <List>
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder={t(
                        address.concat("type what you're looking for")
                     )}
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
         </TunnelContainer>
         <Banner id="inventory-app-work-orders-bulk-supplier-item-tunnel-bottom" />
      </>
   )
}
