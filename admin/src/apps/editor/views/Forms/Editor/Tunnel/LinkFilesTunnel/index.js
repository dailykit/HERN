import React from 'react'
import { TunnelHeader, Tunnel, Tunnels } from '@dailykit/ui'
import { TunnelBody } from './style'
import { Panel } from '../../../../../components'

export default function LinkFiles({ tunnels, openTunnel, closeTunnel }) {
   return (
      <div>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="sm">
               <TunnelHeader title="Link Files" close={() => closeTunnel(1)} />
               <TunnelBody>
                  <Panel />
               </TunnelBody>
            </Tunnel>
         </Tunnels>
      </div>
   )
}
