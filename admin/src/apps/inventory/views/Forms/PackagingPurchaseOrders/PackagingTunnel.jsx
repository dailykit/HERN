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
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
   Banner,
   ErrorState,
   InlineLoader,
   Tooltip,
} from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils/errorLog'
import { GENERAL_ERROR_MESSAGE } from '../../../constants/errorMessages'
import { NO_PACKAGINGS } from '../../../constants/infoMessages'
import {
   PURCHASE_ORDERS_PACKAGING_SUBSCRIPTION,
   UPDATE_PURCHASE_ORDER_ITEM,
} from '../../../graphql'
import { TunnelWrapper } from '../utils/TunnelWrapper'

function onError(error) {
   logger(error)
   toast.error(GENERAL_ERROR_MESSAGE)
}

export default function AddressTunnel({ close }) {
   const [search, setSearch] = useState('')
   const [data, setData] = useState([])
   const { id } = useParams()

   const [list, current, selectOption] = useSingleList(data)

   const { loading, error } = useSubscription(
      PURCHASE_ORDERS_PACKAGING_SUBSCRIPTION,
      {
         onSubscriptionData: input => {
            const data = input.subscriptionData.data.packagings
            setData(data)
         },
      }
   )

   const [updatePurchaseOrderItem] = useMutation(UPDATE_PURCHASE_ORDER_ITEM, {
      onError,
      onCompleted: () => {
         toast.success('Packaging added.')
         close(1)
      },
   })

   const handleSave = option => {
      updatePurchaseOrderItem({
         variables: {
            id,
            set: { packagingId: option.id, supplierId: option.supplier?.id },
         },
      })
   }

   if (error) {
      onError(error)
      return <ErrorState />
   }

   if (loading) return <InlineLoader />

   return (
      <>
         <TunnelHeader
            title="Select Packaging"
            close={() => close(1)}
            description="select a packaging to use in this purchase order"
            tooltip={
               <Tooltip identifier="packaging_purchase_orders-select-packaging-tunnel" />
            }
         />
         <TunnelWrapper>
            <Banner id="inventory-app-purchase-orders-packaging-select-packaging-tunnel-top" />
            {list.length ? (
               <List>
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder="type what you’re looking for..."
                  />
                  <ListHeader type="SSL1" label="packaging" />
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
               <Filler message={NO_PACKAGINGS} />
            )}
            <Banner id="inventory-app-purchase-orders-packaging-select-packaging-tunnel-bottom" />
         </TunnelWrapper>
      </>
   )
}
