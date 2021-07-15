import React from 'react'
import { TunnelHeader, Tunnel, Tunnels } from '@dailykit/ui'
import { TunnelBody } from './style'
import BrandContext from '../../../../../context/Brand'
import { Banner } from '../../../../../../../shared/components'

export default function PagePreviewTunnel({ tunnels, closeTunnel, pageRoute }) {
   const [context, setContext] = React.useContext(BrandContext)

   return (
      <div>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="full">
               <TunnelHeader
                  title="Preview Page"
                  close={() => closeTunnel(1)}
               />
               <Banner id="content-app-pages-page-details-page-preview-tunnel-top" />
               <TunnelBody>
                  <iframe
                     title="page-preview"
                     src={`https://${context.brandDomain}${pageRoute.value}`}
                     style={{ width: '100%', height: '100%' }}
                  />
               </TunnelBody>
               <Banner id="content-app-pages-page-details-page-preview-tunnel-bottom" />
            </Tunnel>
         </Tunnels>
      </div>
   )
}
