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
import {
   BrandTunnel,
   CustomerTunnel,
   SubscriptionTunnel,
   BrandLocationsTunnel,
} from './tunnels'
import { BrandContext } from '../../../App'

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
   const [brandContext] = React.useContext(BrandContext)

   const setMode = mode => {
      dispatch({ type: 'SET_MODE', payload: mode })
      if (brandId && brandContext.locationId && keycloakId) {
         if (mode === 'SUBSCRIPTION') {
            tunnels.open(4)
         } else {
            methods.cart.create.mutate()
         }
         return
      }

      if (brandId && brandContext.locationId) {
         dispatch({
            type: 'SET_BRAND',
            payload: {
               id: brandContext.brandId,
               title: brandContext.brandName || '',
               domain: brandContext?.domain || '',
            },
         })
         dispatch({
            type: 'SET_LOCATION',
            payload: {
               id: brandContext.locationId,
               label: brandContext.locationLabel,
            },
         })
         tunnels.open(4)
      } else if (!brandId) {
         tunnels.open(2)
      } else if (!brandContext.locationId) {
         dispatch({
            type: 'SET_BRAND',
            payload: {
               id: brandContext.brandId,
               title: brandContext.brandName || '',
               domain: brandContext?.domain || '',
            },
         })
         tunnels.open(3)
      }
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
            <BrandLocationsTunnel />
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
