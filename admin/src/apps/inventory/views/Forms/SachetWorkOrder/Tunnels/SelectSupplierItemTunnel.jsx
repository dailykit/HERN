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
import { NO_SUPPLIER_ITEMS } from '../../../../constants/infoMessages'
import {
   SUPPLIER_ITEMS_SUBSCRIPTION,
   UPDATE_SACHET_WORK_ORDER,
} from '../../../../graphql'
import { TunnelWrapper } from '../../utils/TunnelWrapper'

const address = 'apps.inventory.views.forms.sachetworkorder.tunnels.'

const onError = error => {
   logger(error)
   toast.error(GENERAL_ERROR_MESSAGE)
}

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
            set: { supplierItemId: option.id },
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
            description="select a supplier item to use in this work order"
            tooltip={
               <Tooltip identifier="bulk-work-order_select_supplier_item_tunnel" />
            }
         />
         <TunnelWrapper>
            <Banner id="inventory-app-work-orders-sachet-supplier-item-tunnel-top" />
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
            <Banner id="inventory-app-work-orders-sachet-supplier-item-tunnel-bottom" />
         </TunnelWrapper>
      </>
   )
}
