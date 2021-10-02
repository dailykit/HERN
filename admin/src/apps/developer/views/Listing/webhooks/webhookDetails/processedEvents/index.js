import React, {useRef, useState, useEffect} from 'react';
import { ReactTabulator } from '@dailykit/react-tabulator'
import {Table, TableHead, TableBody, TableRow, TableCell, Flex, TextButton, Text, Spacer, DropdownButton, ButtonGroup, ComboButton, PlusIcon, useTunnel} from '@dailykit/ui';
import options from '../../../../tableOptions'
import { GET_PROCESSED_EVENTS, GET_INVOCATIONS_OF_PROCESSED_EVENTS } from '../../../../../graphql';
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {logger}  from '../../../../../../../shared/utils'
import { StyledWrapper } from './styled'
import {useWebhook} from '../../state'
import InvocationTunnel from './tunnels/invocationTunnel';


const ProcessedEvents = ()=>{

    const {state, dispatch} = useWebhook()

    const [processedEvents, setProcessedEvents] = useState([])

    const [invocationState, setInvocationState] = useState(false)

    const [processedEventId, setProcessedEventId] = useState()

    const webhookUrl_EventId = state.webhookUrl_EventId

    const [popupTunnels, openPopupTunnel, closePopupTunnel] = useTunnel(2)

    const { data, loading, error } = useSubscription(GET_PROCESSED_EVENTS, {
      variables:{
          webhookUrl_EventId: state.webhookUrl_EventId
       },
       onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
           const processedEventsData = data.developer_webhookUrl_events[0]?.availableWebhookEvent.processedWebhookEvents.map((item)=>{
            if (item.processedWebhookEventsByUrls[0]){
            const newData =  { "created_at":item.created_at, 
               "id":item.id,
               "statusCode":item.processedWebhookEventsByUrls[0].statusCode,
               "attemptedTime":item.processedWebhookEventsByUrls[0].attemptedTime}
               return newData;
            }
            
            
        })
         setProcessedEvents(processedEventsData)
       },
      })

    if (error) {
      toast.error('Something went wrong')
      console.log('processed')
      logger(error)
   }



    const tableRef = useRef()


    useEffect(() => {
       if (processedEventId){
         setInvocationState(true)
       }
  }, [processedEventId]);


    const rowClick = (e, cell) => {
      const id = cell._cell.row.data.id
      setProcessedEventId(id)  
   }

    const columns = [
        {
           title: 'created at',
           field: 'created_at',
           headerFilter: true,
           hozAlign: 'left',
           resizable:true,
           headerSort:true,
           cssClass: 'rowClick',
           width: 300,
           cellClick: (e, cell) => {
              rowClick(e, cell)
            openPopupTunnel(1)
           }
           // headerTooltip: function (column) {
           //    const identifier = 'webhook_listing_code_column'
           //    return (
           //       tooltip(identifier)?.description || column.getDefinition().title
           //    )
           // },
        },
        {
           title: 'status',
           field: 'statusCode',
           headerFilter: true,
           hozAlign: 'left',
           resizable:true,
           headerSort:true,
           cssClass: 'rowClick',
           width: 150
        },
        {
            title: 'tries',
            field: 'attemptedTime',
            headerFilter: true,
            hozAlign: 'left',
            resizable:true,
            headerSort:true,
            cssClass: 'rowClick',
            width: 100
         }
     ]

    return (
        <>
         {invocationState && <InvocationTunnel openPopupTunnel={openPopupTunnel} closePopupTunnel={closePopupTunnel} popupTunnels={popupTunnels} webhookUrl_EventId={webhookUrl_EventId} processedEventId={processedEventId} />}
            
            <StyledWrapper>
            <div className="App" >
            <Flex container alignItems="center" justifyContent="space-between">
            <Flex container height="80px" alignItems="center">
               <Text as="h2">
                  Procesed Events
                  {/* (
                  {webhookUrl_eventsCount || '...'}) */}
               </Text>
               {/* <Tooltip identifier="coupon_list_heading" /> */}
            </Flex>
                  

            <ButtonGroup>
               {/* <ComboButton type="solid" 
               onClick={()=>openTunnel(1)}
               >
                  <PlusIcon />
                  Add Webhook
               </ComboButton> */}
            </ButtonGroup>
         </Flex>
         {Boolean(processedEvents) && (
            <ReactTabulator
               columns={columns}
               data={processedEvents}
               options={{
                  ...options,
                  placeholder: 'No processed events Available Yet !',
                  persistenceID : 'processedEvents_table'
               }}
               ref={tableRef}
               className = 'developer-webhooks-processedEvents'
            />
         )}
         </div>
         </StyledWrapper>

        </>
    )
}

export default ProcessedEvents;