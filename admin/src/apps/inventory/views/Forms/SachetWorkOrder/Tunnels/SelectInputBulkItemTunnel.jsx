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
   ErrorState,
   InlineLoader,
   Tooltip,
   Banner,
} from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import { GENERAL_ERROR_MESSAGE } from '../../../../constants/errorMessages'
import { NO_BULK_ITEMS } from '../../../../constants/infoMessages'
import {
   GET_BULK_ITEMS_SUBSCRIPTION,
   UPDATE_SACHET_WORK_ORDER,
} from '../../../../graphql'
import { TunnelWrapper } from '../../utils/TunnelWrapper'

const address = 'apps.inventory.views.forms.sachetworkorder.tunnels.'

const onError = error => {
   logger(error)
   toast.error(GENERAL_ERROR_MESSAGE)
}

export default function SelectInputBulkItemTunnel({ close, state }) {
   const { t } = useTranslation()
   const [search, setSearch] = useState('')
   const [data, setData] = useState([])

   const [list, current, selectOption] = useSingleList(data)

   const { loading, error } = useSubscription(GET_BULK_ITEMS_SUBSCRIPTION, {
      variables: {
         supplierItemId: state.supplierItem.id,
      },
      onSubscriptionData: resp => {
         const data = resp.subscriptionData.data?.bulkItems
         setData(data)
      },
   })

   const [updateSachetWorkOrder] = useMutation(UPDATE_SACHET_WORK_ORDER, {
      onCompleted: () => {
         toast.info('Work Order updated successfully!')
         close(1)
      },
      onError,
   })

   const handleSave = option => {
      updateSachetWorkOrder({
         variables: {
            id: state.id,
            set: {
               inputBulkItemId: option.id,
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
            title={t(address.concat('select input bulk item processing'))}
            close={() => close(1)}
            description="Select input bulk item to use for this work order"
            tooltip={
               <Tooltip identifier="bulk-work-order_add_input_bulk_item_tunnel" />
            }
         />
         <TunnelWrapper>
            <Banner id="inventory-app-work-orders-sachet-input-bulk-item-tunnel-top" />
            {list.length ? (
               <List>
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder={t(
                        address.concat("type what you're looking for")
                     )}
                  />
                  <ListHeader type="SSL2" label="bulk item" />
                  <ListOptions>
                     {list
                        .filter(option =>
                           option.processingName.toLowerCase().includes(search)
                        )
                        .map(option => (
                           <ListItem
                              type="SSL2"
                              key={option.id}
                              isActive={option.id === current.id}
                              onClick={() => handleSave(option)}
                              content={{
                                 title: option.processingName,
                                 description: `Shelf Life: ${
                                    option.shelfLife?.value || 'N/A'
                                 } ${option.shelfLife?.unit || ''} On Hand: ${
                                    option.onHand
                                 }`,
                              }}
                           />
                        ))}
                  </ListOptions>
               </List>
            ) : (
               <Filler message={NO_BULK_ITEMS} />
            )}
            <Banner id="inventory-app-work-orders-sachet-input-bulk-item-tunnel-bottom" />
         </TunnelWrapper>
      </>
   )
}
