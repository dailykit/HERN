import React from 'react'
import { TunnelHeader, Tunnel, Tunnels } from '@dailykit/ui'
import Panel from './Panel'

const LinkFilesTunnel = ({ tunnels, closeTunnel }) => (
   <div>
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1} size="sm">
            <TunnelHeader title="Link Files" close={() => closeTunnel(1)} />
            <Panel />
         </Tunnel>
      </Tunnels>
   </div>
)
export default LinkFilesTunnel
