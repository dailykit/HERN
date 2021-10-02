import React, {useRef, useState} from 'react';
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {ACTIVE_EVENTS_WEBHOOKS, DELETE_WEBHOOK_EVENT } from '../../../../graphql';
import { Loader } from '@dailykit/ui'
import {logger}  from '../../../../../../shared/utils'
import {Table, TableHead, TableBody, TableRow, TableCell, Flex, TextButton, Text, Spacer, DropdownButton, ButtonGroup, ComboButton, PlusIcon, useTunnel} from '@dailykit/ui';
import { toast } from 'react-toastify'
import AddWebHook from '../../../../tunnels/addWebhookTunnel';
import options from '../../../tableOptions'
import { ReactTabulator } from '@dailykit/react-tabulator'
import { useLocation } from 'react-router-dom'
import { useTooltip, useTabs } from '../../../../../../shared/providers'
import { useWebhook } from '../state';
// third party imports
import { useTranslation } from 'react-i18next'
import { StyledWrapper, Wrapper } from './styled'




const WebhookListing = ()=>{

    const { t } = useTranslation()

    const {state, dispatch} = useWebhook()

    // Mutation for deleting webhook
    const [deleteWebhook, {loading: deletingWebhookLoading}] = useMutation(DELETE_WEBHOOK_EVENT);

    const [tunnels, openTunnel, closeTunnel] = useTunnel(2)

    const tableRef = useRef()

    const [webhookEvents, setWebhookEvents] = useState([])

    // Query to fetch active webhook events
    const { data, loading, error } = useSubscription(ACTIVE_EVENTS_WEBHOOKS, {
       onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
         setWebhookEvents(data.developer_webhookUrl_events)
       },
      })

    if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

    const webhookUrl_eventsCount = webhookEvents?.length


   const rowClick = (e, cell) => {
      const {id } = cell._cell.row.data
      dispatch({type:'SET_WEBHOOK_URL_EVENT_ID', payload:id})
   }

    
    // To delete Webhook
    function deleteEvent(eventId){
        deleteWebhook({
            variables:{
                "eventId":eventId
            },
            onComplete : (data) => {
                console.log('request completed')
                toast.success('webhook successfully deleted')
                console.log(data)
            },
            onError : (error) =>{

                toast.error('Something went wrong')
                logger(error)
            }
        })
    }

    const columns = [
      {
         title: 'Events',
         field: 'availableWebhookEvent.label',
         headerFilter: true,
         hozAlign: 'left',
         resizable:true,
         headerSort:true,
         // frozen: true,
         cssClass: 'rowClick',
         width: 300,
         cellClick: (e, cell) => {
            rowClick(e, cell)
         }
         // headerTooltip: function (column) {
         //    const identifier = 'webhook_listing_code_column'
         //    return (
         //       tooltip(identifier)?.description || column.getDefinition().title
         //    )
         // },
      },
      {
         title: 'Url',
         field: 'webhookUrl.urlEndpoint',
         headerFilter: true,
         hozAlign: 'left',
         resizable:true,
         headerSort:true,
         // frozen: true,
         cssClass: 'rowClick',
         width: 300
      }
   ]

    return (
       <Wrapper>
        <div className="App" >
            <AddWebHook tunnels={tunnels} openTunnel={openTunnel} closeTunnel={closeTunnel} />
            <StyledWrapper>
            <Flex container alignItems="center" justifyContent="space-between">
            <Flex container height="80px" alignItems="center">
               <Text as="h2">
                  Webhooks
                  (
                  {webhookUrl_eventsCount || '...'})
               </Text>
               {/* <Tooltip identifier="coupon_list_heading" /> */}
            </Flex>
                  

            <ButtonGroup>
               <ComboButton type="solid" 
               onClick={()=>openTunnel(1)}
               >
                  <PlusIcon />
                  Add Webhook
               </ComboButton>
            </ButtonGroup>
         </Flex>
         {Boolean(webhookEvents) && (
            <ReactTabulator
               columns={columns}
               data={webhookEvents}
               options={{
                  ...options,
                  placeholder: 'No Webhooks Available Yet !',
                  persistenceID : 'webhooks_table'
               }}
               ref={tableRef}
               className = 'developer-webhooks'
            />
         )}
            </StyledWrapper>
        </div>
        </Wrapper>

    )

}

export default WebhookListing

