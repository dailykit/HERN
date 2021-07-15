import React from 'react'
import { toast } from 'react-toastify'
import { Text, Spacer, TextButton } from '@dailykit/ui'
import { useMutation } from '@apollo/react-hooks'

import {
   SelectPlan,
   SelectAddress,
   SelectDeliveryDay,
   SelectDeliveryDate,
} from './sections'
import { SubProvider, useSub } from './state'
import { useManual } from '../../../../state'
import { MUTATIONS } from '../../../../graphql'
import { logger } from '../../../../../../utils'

export const CreateSubscriber = () => {
   return (
      <SubProvider>
         <SelectPlan />
         <Spacer size="24px" />
         <SelectAddress />
         <Spacer size="24px" />
         <SelectDeliveryDay />
         <SelectDeliveryDate />
         <Save />
      </SubProvider>
   )
}

const Save = () => {
   const { brand, customer, methods } = useManual()
   const { address, deliveryDay, deliveryDate } = useSub()
   const [updateBrandCustomer] = useMutation(MUTATIONS.BRAND.CUSTOMER.UPDATE, {
      onCompleted: async () => {
         await methods.cart.create.mutate(null, deliveryDate.selected?.id)
         toast.success('Successfully subscribed the customer.')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to subscribe the customer. Please try again!')
      },
   })

   const subscribeUser = async () => {
      updateBrandCustomer({
         variables: {
            where: {
               brandId: { _eq: brand.id },
               keycloakId: { _eq: customer?.keycloakId },
            },
            _set: {
               subscriptionOnboardStatus: 'SELECT_MENU',
               subscriptionId: deliveryDay.selected.id,
               subscriptionAddressId: address?.selected?.id,
            },
         },
      })
   }
   return (
      <TextButton
         type="solid"
         onClick={subscribeUser}
         disabled={!deliveryDay?.selected?.id || !deliveryDate?.selected?.id}
      >
         Create Subscription
      </TextButton>
   )
}
