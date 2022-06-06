import React from 'react'
import { Flex, TunnelHeader } from '@dailykit/ui'

import { useManual } from '../../state'
import { CreateSubscriber, SelectOccurence } from './sections'

export const SubscriptionTunnel = () => {
   const { customer, methods, tunnels } = useManual()
   const [occurence, setOccurence] = React.useState(null)
   return (
      <>
         <TunnelHeader
            title="Select Subscription"
            close={() => tunnels.close(5)}
            right={{
               ...(customer?.subscriptionId && {
                  title: 'Save',
                  disabled: !occurence,
                  isLoading: methods.cart.create.loading,
                  action: () => {
                     methods.cart.create.mutate(null, occurence)
                  },
               }),
            }}
         />
         <Flex padding="16px" overflowY="auto" height="calc(100vh - 196px)">
            {customer?.subscriptionId ? (
               <SelectOccurence
                  occurence={occurence}
                  setOccurence={setOccurence}
               />
            ) : (
               <CreateSubscriber />
            )}
         </Flex>
      </>
   )
}
