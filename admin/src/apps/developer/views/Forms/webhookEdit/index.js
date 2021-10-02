import { useParams } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {logger}  from '../../../../../shared/utils'
import InvocationLogs from './components/invocationLogs'
// import ProcessedEvents from './components/processedEvents'
import {Modify} from './components/modify'
import {
   Flex,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   Spacer
} from '@dailykit/ui'
import {
    StyledWrapper,
    StyledComp,
    InputWrapper,
    StyledDiv,
    StyledInsight,
 } from './styled'
 import {
    Banner,
    Tooltip,
    InlineLoader,
    InsightDashboard,
 } from '../../../../../shared/components'
import { GET_EVENT_URL_ADVANCE_CONFIGS } from '../../../graphql'


const WebhookEdit = ()=>{
    const { id: webhookUrl_EventId } = useParams()

    const [webhookEventDetails, setWebhookEventDetails] = useState({"eventName":undefined, "url":undefined})

    const { data, loading, error } = useSubscription(GET_EVENT_URL_ADVANCE_CONFIGS, {
      variables:{
          webhookUrl_EventId: webhookUrl_EventId
       },
       onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
         setWebhookEventDetails({"eventName":data.developer_webhookUrl_events[0]?.availableWebhookEvent.label,
          "url":data.developer_webhookUrl_events[0]?.webhookUrl.urlEndpoint
         })
       },
      })

    if (error) {
      toast.error('Something went wrong')
      logger(error)
   }



    return (<>

               {/* <h3>Event : {webhookEventDetails.eventName || "..."}</h3> 
               <h3>URL : {webhookEventDetails.url || "..."}</h3>  */}
               
               <Spacer size="24px" />

               <HorizontalTabs>
                  <div>
                     <HorizontalTabList>
                        <HorizontalTab>Modify</HorizontalTab>
                        <HorizontalTab>Processed Webhook Events</HorizontalTab>
                        <HorizontalTab>Invocation logs</HorizontalTab>
                     </HorizontalTabList>
                  </div>
                  <HorizontalTabPanels>
                     <HorizontalTabPanel>
                     <Modify webhookUrl_EventId={webhookUrl_EventId} />
                     </HorizontalTabPanel>
                     {/* <HorizontalTabPanel>
                     <ProcessedEvents webhookUrl_EventId={webhookUrl_EventId} />
                     </HorizontalTabPanel> */}
                     <HorizontalTabPanel>
                     <InvocationLogs webhookUrl_EventId={webhookUrl_EventId} />
                     </HorizontalTabPanel>
                  </HorizontalTabPanels>
               </HorizontalTabs>
         </>
    )
}

export default WebhookEdit;