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
import React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { Tooltip, Banner } from '../../../../../../shared/components'
import { InlineLoader } from '../../../../../../shared/components/InlineLoader'
import { logger } from '../../../../../../shared/utils'
import { TunnelContainer } from '../../../../components'
import { GENERAL_ERROR_MESSAGE } from '../../../../constants/errorMessages'
import { NO_USERS } from '../../../../constants/infoMessages'
import {
   SETTINGS_USERS_SUBSCRIPTION,
   UPDATE_BULK_WORK_ORDER,
} from '../../../../graphql'

const address = 'apps.inventory.views.forms.bulkworkorder.tunnels.'

export default function SelectUserTunnel({ close, state }) {
   const { t } = useTranslation()

   const [data, setData] = React.useState([])

   const [search, setSearch] = React.useState('')
   const [list, current, selectOption] = useSingleList(data)

   const { loading, error } = useSubscription(SETTINGS_USERS_SUBSCRIPTION, {
      onSubscriptionData: input => {
         const data = input.subscriptionData.data.settings_user?.map(user => ({
            ...user,
            name: `${user.firstName} ${user.lastName}`,
         }))

         setData(data)
      },
   })

   const [updateBulkWorkOrder, { loading: updating }] = useMutation(
      UPDATE_BULK_WORK_ORDER,
      {
         onError: error => {
            logger(error)
            toast.error(GENERAL_ERROR_MESSAGE)
            close(1)
         },
         onCompleted: () => {
            toast.success('User assigned!')
            close(1)
         },
      }
   )

   const handleSave = option => {
      updateBulkWorkOrder({
         variables: {
            id: state.id,
            object: {
               userId: option.id,
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
            title={t(address.concat('select user'))}
            close={() => close(1)}
            description="select user to assign to this work order"
            tooltip={
               <Tooltip identifier="bulk-work-order-select-user-tunnel" />
            }
         />
         <TunnelContainer>
            <Banner id="inventory-app-work-orders-bulk-users-tunnel-top" />
            {list.length ? (
               <List>
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder={t(
                        address.concat("type what you're looking for")
                     )}
                  />
                  <ListHeader type="SSL1" label="user" />
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
               <Filler message={NO_USERS} />
            )}
            <Banner id="inventory-app-work-orders-bulk-users-tunnel-bottom" />
         </TunnelContainer>
      </>
   )
}
