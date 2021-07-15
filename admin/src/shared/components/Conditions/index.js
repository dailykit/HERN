import React from 'react'
import { Tunnels, Tunnel } from '@dailykit/ui'

import FactTunnel from './FactTunnel'
import MainTunnel from './MainTunnel'

import { ConditionsProvider } from './context'

const Conditions = ({ id, onSave, tunnels, openTunnel, closeTunnel }) => {
   return (
      <ConditionsProvider>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="lg">
               <MainTunnel
                  id={id}
                  onSave={onSave}
                  closeTunnel={closeTunnel}
                  openTunnel={openTunnel}
               />
            </Tunnel>
            <Tunnel layer={2}>
               <FactTunnel closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
      </ConditionsProvider>
   )
}

export default Conditions
