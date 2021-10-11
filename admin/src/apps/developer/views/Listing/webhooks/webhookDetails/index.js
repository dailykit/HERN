import React from 'react';
import ProcessedEvents from './processedEvents';
import { Wrapper } from './styled';
import {EventDetails, AdvanceConfig} from './eventDetails';
import { useWebhook } from '../state';
import { Text, TextButton, AnchorNav, AnchorNavItem, Flex } from '@dailykit/ui';
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
         <AnchorNav>
            <AnchorNavItem
               targetElement='info'
               label='Info'
               containerId='containerElement'
            />
            <AnchorNavItem
               targetElement='processedEvents'
               label='Processed Events'
               containerId='containerElement'
            />
            <AnchorNavItem
               targetElement='advanceConfigs'
               label='Advance Configs'
               containerId='containerElement'
            />
      </AnchorNav>
      <Element
         id='containerElement'
         style={{
            position: 'relative',
            height: '600px',
            overflowY: 'auto',
            overflowX: 'hidden',
            width: '100%'
         }}
      >
         <Element
            name='info'
            style={{
               height: '600px'
            }}
         >
            {state.webhookDetails.webhookUrl_EventId ?
            <EventDetails />:
            <Text as="h3">Select a Webhook event to see details</Text>}
         </Element>

         <Element
            name='processedEvents'
            style={{
               height: '600px'
            }}
         >
            {state.webhookDetails.webhookUrl_EventId ?
            <ProcessedEvents />:
            <Text as="h3">Select a Webhook event to see details</Text>}
         </Element>
         <Element
            name='advanceConfigs'
            style={{
               height: '600px'
            }}
         >
            {state.webhookDetails.webhookUrl_EventId ?
            <AdvanceConfig />:
            <Text as="h3">Select a Webhook event to see details</Text>}
         </Element>
      </Element>

         
         
         
{/* Delete Webhook */}
         
      
        
      </Wrapper>
      
   )
  
}

export default WebhookDetails;