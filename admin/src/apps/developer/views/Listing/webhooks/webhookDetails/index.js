import React from 'react';
import ProcessedEvents from './processedEvents';
import { Wrapper } from './styled';
import {EventDetails} from './eventDetails';
import { AdvanceConfig, Headers} from './advanceConfig';
import { useWebhook } from '../state';
import { Text, TextButton, Flex, HorizontalTab, HorizontalTabs, HorizontalTabList, HorizontalTabPanel, HorizontalTabPanels } from '@dailykit/ui';
import { Element } from 'react-scroll'

const WebhookDetails = ()=>{
   const {state, dispatch} = useWebhook()

   return (
      <Wrapper> 
         <Flex container alignItems="center" justifyContent="space-between">
            <Flex container height="80px" alignItems="center">
               <Text as="h2">
                  Webhook Details
               </Text>
            </Flex>
            {state.webhookDetails.webhookUrl_EventId &&
            <TextButton size="sm" type="ghost" style={{"color":"red"}} onClick={()=>{
            if (window.confirm("Are you sure you wan to delete this webhook ?")){
               state.deleteFunction(state.webhookDetails.webhookUrl_EventId)
               dispatch({type:'SET_WEBHOOK_DETAILS', payload:{
                  webhookDetails: {
                     "webhookUrl_EventId":undefined,
                     "webhookUrl_EventLabel": undefined,
                     "webhookUrlEndpoint":undefined,
                     "advanceConfig":undefined
                  },
                  deleteFunction:undefined
               }})
            }
            
         }}>Delete</TextButton>}
         </Flex>
         <div style={{
               height: 'calc(100vh - 32px)'
            }}>
            <HorizontalTabs>
               <HorizontalTabList>
                  <HorizontalTab>Info</HorizontalTab>
                  <HorizontalTab>Processed Events</HorizontalTab>
                  <HorizontalTab>Advance Configs</HorizontalTab>
               </HorizontalTabList>
               <HorizontalTabPanels>
                  <HorizontalTabPanel>
                     {state.webhookDetails.webhookUrl_EventId ?
                     <EventDetails />:
                     <Text as="h3">Select a Webhook event to see details</Text>}
                  </HorizontalTabPanel>
                  <HorizontalTabPanel>
                     {state.webhookDetails.webhookUrl_EventId ?
                     <ProcessedEvents />:
                     <Text as="h3">Select a Webhook event to see details</Text>}
                  </HorizontalTabPanel>
                  <HorizontalTabPanel>
                     {state.webhookDetails.webhookUrl_EventId ?
                     <>
                        <AdvanceConfig />
                        <Headers />
                     </>:
                     <Text as="h3">Select a Webhook event to see details</Text>}
                  </HorizontalTabPanel>
               </HorizontalTabPanels>
            </HorizontalTabs>
         </div>
      </Wrapper>
      
   )
  
}

export default WebhookDetails;