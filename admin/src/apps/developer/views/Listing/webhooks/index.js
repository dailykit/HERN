import React from 'react'
import { Wrapper } from './styled'
// import { Banner } from '../../../../shared/components'
import { WebhookProvider } from './state'
import WebhookListing from './webhookEvents'
import WebhookDetails from './webhookDetails'

export const Webhooks = () => {
 
    return (
       <WebhookProvider>
          {/* <Banner id="subscription-app-menu-listing-top" /> */}
          <Wrapper>
             <div>
                <WebhookListing />
                <WebhookDetails />
             </div>
          </Wrapper>
          {/* <Banner id="subscription-app-menu-listing-bottom" /> */}
       </WebhookProvider>
    )
 }