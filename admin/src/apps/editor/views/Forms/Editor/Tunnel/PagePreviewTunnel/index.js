import React from 'react'
import { TunnelHeader, Tunnel, Tunnels, Dropdown } from '@dailykit/ui'
import { TunnelBody } from './style'

export default function PagePreviewTunnel({
   tunnels,
   openTunnel,
   closeTunnel,
   query,
}) {
   console.log(query)
   return (
      <div>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="full">
               <TunnelHeader
                  title="Preview Page"
                  close={() => closeTunnel(1)}
               />
               <TunnelBody>
                  {/* <iframe
                     src={`https://${context.brandDomain}${pageRoute.value}`}
                     style={{ width: '100%', height: '100%' }}
                  /> */}
               </TunnelBody>
            </Tunnel>
         </Tunnels>
      </div>
   )
}
