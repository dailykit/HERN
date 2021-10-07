import React from 'react';
import ProcessedEvents from './processedEvents';
import { Wrapper } from './styled';
import {EventDetails, AdvanceConfig} from './eventDetails';
import { useWebhook } from '../state';
import { Text, TextButton, AnchorNav, AnchorNavItem } from '@dailykit/ui';
import { Element } from 'react-scroll'

const WebhookDetails = ()=>{
   const {state, dispatch} = useWebhook()

   return (
      <Wrapper>
      {!state.webhookDetails.webhookUrl_EventId && <Text as="h3">Select a Webhook event to see details</Text> }
      {state.webhookDetails.webhookUrl_EventId && 
      (<>
         {/* <AnchorNav>
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
               height: '70px'
            }}
         >
            <EventDetails />
         </Element>

         <Element
            name='processedEvents'
            style={{
               height: '1000px'
            }}
         >
            <ProcessedEvents />
         </Element>
         <Element
            name='advanceConfigs'
            style={{
               height: '1000px'
            }}
         >
            <AdvanceConfig />
         </Element>
      </Element> */}
      <EventDetails />
      <ProcessedEvents />
      <AdvanceConfig />
         
         
         
{/* Delete Webhook */}
         <TextButton size="sm" type="ghost" onClick={()=>{
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
            
         }}>Delete</TextButton>
      </>
      )
      }  
      </Wrapper>
      
   )
  
}

export default WebhookDetails;