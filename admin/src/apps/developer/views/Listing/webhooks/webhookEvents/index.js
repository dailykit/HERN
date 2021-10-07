import React, {useRef, useState} from 'react';
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {ACTIVE_EVENTS_WEBHOOKS, DELETE_WEBHOOK_EVENT } from '../../../../graphql';
import { IconButton, Loader } from '@dailykit/ui'
import {logger}  from '../../../../../../shared/utils'
import {Table, TableHead, TableBody, TableRow, TableCell, Flex, TextButton, Text, Spacer, DropdownButton, ButtonGroup, ComboButton, PlusIcon, useTunnel} from '@dailykit/ui';
import { toast } from 'react-toastify'
import AddWebHook from '../../../../tunnels/addWebhookTunnel';
import options from '../../../tableOptions'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { useTooltip, useTabs } from '../../../../../../shared/providers'
import { useWebhook } from '../state';
import {DeleteIcon} from '../../../../../../shared/assets/icons'
// third party imports
import { useTranslation } from 'react-i18next'
import { Wrapper } from './styled'
const address = 'apps.developer.views.listings.webhookslisting.'



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
      const { id } = cell._cell.row.data
      const webhookUrl_EventLabel = cell._cell.row.data.availableWebhookEvent.label
      const webhookUrlEndpoint = cell._cell.row.data.webhookUrl.urlEndpoint
      const advanceConfig = cell._cell.row.data.advanceConfig
      const payload = {
         "webhookUrl_EventId": id,
         "webhookUrl_EventLabel": webhookUrl_EventLabel,
         "webhookUrlEndpoint":webhookUrlEndpoint,
         "advanceConfig": advanceConfig
      }
      dispatch({type:'SET_WEBHOOK_DETAILS', payload:payload})
      dispatch({type:'SET_DELETE_FUNCTION', payload:deleteEvent})

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
         frozen: true,
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
         title: 'Action',
         field: 'Action',
         headerFilter: true,
         hozAlign: 'center',
         resizable:true,
         headerSort:true,
         frozen: true,
         formatter:reactFormatter(<DeleteIcon />),
         cellClick: (e, cell) => {
            if (window.confirm("Are you sure you wan to delete this webhook ?")){
               deleteEvent(cell._cell.row.data.id)
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
            
         },
         cssClass: 'rowClick',
         width: 100
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
                  <Flex container alignItems="center" justifyContent="space-between">
                     <Flex container height="80px" alignItems="center">
                        <Text as="h2">
                        {/* {t(address.concat('webhook'))} */}
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
                           <PlusIcon color="#fff" />
                           Add Webhook
                        </ComboButton>
                     </ButtonGroup>
                  </Flex>
                  {/* <StyledWrapper> */}
                  {Boolean(webhookEvents) && (
                     <ReactTabulator
                        columns={columns}
                        data={webhookEvents}
                        options={{
                           ...options,
                           placeholder: 'No Webhooks Available Yet !',
                           persistenceID : 'webhooks_table',
                           reactiveData: true
                        }}
                        ref={tableRef}
                        className = 'developer-webhooks'
                     />
                  )}
                  {/* </StyledWrapper> */}
            </div>
        </Wrapper>

    )

}

export default WebhookListing

