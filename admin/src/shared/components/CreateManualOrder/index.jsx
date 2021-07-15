import React from 'react'
import {
   Flex,
   Tunnel,
   Tunnels,
   Spacer,
   OptionTile,
   TunnelHeader,
} from '@dailykit/ui'

import { Provider, useManual } from './state'
import { BrandTunnel, CustomerTunnel, SubscriptionTunnel } from './tunnels'

export const CreateManualOrder = ({
   isModeTunnelOpen,
   brandId = null,
   keycloakId = null,
   setIsModeTunnelOpen,
}) => {
   if (!isModeTunnelOpen) return null
   return (
      <Provider
         brandId={brandId}
         keycloakId={keycloakId}
         isModeTunnelOpen={isModeTunnelOpen}
      >
         <Content
            brandId={brandId}
            keycloakId={keycloakId}
            setIsModeTunnelOpen={setIsModeTunnelOpen}
         />
      </Provider>
   )
}

const Content = ({ brandId, keycloakId, setIsModeTunnelOpen }) => {
   const { methods, tunnels, dispatch } = useManual()

   const setMode = mode => {
      dispatch({ type: 'SET_MODE', payload: mode })
      if (brandId && keycloakId) {
         if (mode === 'SUBSCRIPTION') {
            tunnels.open(4)
         } else {
            methods.cart.create.mutate()
         }
         return
      }
      tunnels.open(2)
   }
   return (
      <Tunnels tunnels={tunnels.list}>
         <Tunnel size="md">
            <TunnelHeader
               title="Select Store"
               close={() => {
                  setIsModeTunnelOpen(false)
                  tunnels.close(1)
               }}
            />
            <Flex padding="16px" overflowY="auto" height="calc(100vh - 196px)">
               <OptionTile
                  title="On-demand Store"
                  onClick={() => setMode('ONDEMAND')}
               />
               <Spacer size="16px" />
               <OptionTile
                  title="Subscription Store"
                  onClick={() => setMode('SUBSCRIPTION')}
               />
            </Flex>
         </Tunnel>
         <Tunnel size="md">
            <BrandTunnel />
         </Tunnel>
         <Tunnel size="md">
            <CustomerTunnel />
         </Tunnel>
         <Tunnel size="lg">
            <SubscriptionTunnel />
         </Tunnel>
      </Tunnels>
   )
}
