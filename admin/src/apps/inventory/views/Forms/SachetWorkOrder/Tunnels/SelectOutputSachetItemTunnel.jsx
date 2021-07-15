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
import { NO_SACHETS } from '../../../../constants/infoMessages'
import {
   SACHET_ITEMS_SUBSCRIPTION,
   UPDATE_SACHET_WORK_ORDER,
} from '../../../../graphql'
import { TunnelWrapper } from '../../utils/TunnelWrapper'

const address = 'apps.inventory.views.forms.sachetworkorder.tunnels.'

const onError = error => {
   logger(error)
   toast.error(GENERAL_ERROR_MESSAGE)
}

export default function SelectOutputSachetItemTunnel({ close, state }) {
   const { t } = useTranslation()

   const [search, setSearch] = useState('')
   const [data, setData] = useState([])

   const [list, current, selectOption] = useSingleList(data)

   const { loading, error } = useSubscription(SACHET_ITEMS_SUBSCRIPTION, {
      variables: { bulkItemId: state.bulkItem.id },
      onSubscriptionData: input => {
         const data = input.subscriptionData.data.sachetItems
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
               outputSachetItemId: option.id,
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
            title={t(address.concat('select output bulk sachet'))}
            close={() => close(1)}
            description="select output sachet to use in this work order"
            tooltip={
               <Tooltip identifier="sachet-work-order_select_output_sachet_item_tunnel" />
            }
         />
         <TunnelWrapper>
            <Banner id="inventory-app-work-orders-sachet-output-sachet-item-tunnel-top" />
            {list.length ? (
               <List>
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder={t(
                        address.concat("type what you're looking for")
                     )}
                  />
                  <ListHeader type="SSL2" label="sachet" />
                  <ListOptions>
                     {list
                        .filter(option =>
                           option.unitSize
                              .toString()
                              .toLowerCase()
                              .includes(search)
                        )
                        .map(option => (
                           <ListItem
                              type="SSL2"
                              key={option.id}
                              isActive={option.id === current.id}
                              onClick={() => handleSave(option)}
                              content={{
                                 title: `${option.unitSize} ${option.unit}`,
                                 description: `onHand: ${option.onHand} |  Par: ${option.parLevel}`,
                              }}
                           />
                        ))}
                  </ListOptions>
               </List>
            ) : (
               <Filler message={NO_SACHETS} />
            )}
            <Banner id="inventory-app-work-orders-sachet-output-sachet-item-tunnel-bottom" />
         </TunnelWrapper>
      </>
   )
}
