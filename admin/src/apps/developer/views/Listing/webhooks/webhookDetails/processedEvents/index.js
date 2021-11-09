import React, {useRef, useState, useEffect} from 'react';
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'
import { Flex, TextButton, Text, useTunnel} from '@dailykit/ui';
import options from '../../../../tableOptions'
import { GET_PROCESSED_EVENTS } from '../../../../../graphql';
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {logger}  from '../../../../../../../shared/utils'
import {useWebhook} from '../../state'
import InvocationTunnel from './tunnels/invocationTunnel';
import {PublishIcon, UnPublishIcon} from '../../../../../../products/assets/icons'
import moment from 'moment'
import "../../../../tableStyle.css"
import PayloadTunnel from './tunnels/payloadTunnel'


const ProcessedEvents = ()=>{

    const {state, dispatch} = useWebhook()

    const [processedEvents, setProcessedEvents] = useState([])

    const [invocationState, setInvocationState] = useState(false)

    const [processedEventId, setProcessedEventId] = useState()

    const [payloadData, setPayloadData] = useState()

    const [popupTunnels, openPopupTunnel, closePopupTunnel] = useTunnel(2)

    const [payloadTunnels, openPayloadTunnel, closePayloadTunnel] = useTunnel(1)

    const { data, loading, error } = useSubscription(GET_PROCESSED_EVENTS, {
      variables:{
          webhookUrl_EventId: state.webhookDetails.webhookUrl_EventId
       },
       onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
           const processedEventsData = data.developer_webhookUrl_events[0]?.availableWebhookEvent.processedWebhookEvents.map((item)=>{
            if (item.processedWebhookEventsByUrls[0]){
            const newData =  { "created_at":item.created_at, 
               "id":item.id,
               "payload": item.payload,
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
      const payload = cell._cell.row.data.payload
      setProcessedEventId(id)  
      setPayloadData(payload)
   }

    const columns = [
        {
           title: 'Created At',
           field: 'created_at',
           headerFilter: true,
           hozAlign: 'left',
           resizable:true,
           headerSort:true,
           cssClass: 'rowClick',
           formatter: ({ _cell: { value } }) =>
               moment(value).format('MMM DD YYYY HH:mm:ss'),
           headerTooltip: true
        },
        {
           title: 'Status',
           field: 'statusCode',
           headerFilter: true,
           hozAlign: 'center',
           resizable:true,
           headerSort:true,
           headerTooltip: true,
           formatter: reactFormatter(<StatusIcon />),
        },
        {
            title: 'Tries',
            field: 'attemptedTime',
            headerFilter: true,
            hozAlign: 'center',
            resizable:true,
            headerSort:true,
            headerTooltip: true,
         },
         {
            title: 'Invocations',
            field: 'invocations',
            hozAlign: 'center',
            tooltip: false,
            resizable:true,
            headerSort:true,
            headerHozAlign: 'center',
            headerTooltip: true,
            formatter:reactFormatter(<TextButton title="view invocation" type="ghost">View</TextButton>),
            cellClick: (e, cell) => {
               rowClick(e, cell)
             openPopupTunnel(1)
            }
         },
         {
            title: 'Payload Sent',
            field: 'payload',
            hozAlign: 'center',
            resizable:true,
            tooltip: false,
            headerSort:true,
            headerHozAlign: 'center',
            headerTooltip: true,
            formatter:reactFormatter(<TextButton title="view payload" type="ghost">View</TextButton>),
            cellClick: (e, cell) => {
               rowClick(e, cell)
             openPayloadTunnel(1)
            }
         }
     ]

    return (
        <>
         {invocationState && <InvocationTunnel openPopupTunnel={openPopupTunnel} closePopupTunnel={closePopupTunnel} popupTunnels={popupTunnels} webhookUrl_EventId={state.webhookDetails.webhookUrl_EventId} processedEventId={processedEventId} />}
         {invocationState && <PayloadTunnel openPayloadTunnel={openPayloadTunnel} closePayloadTunnel={closePayloadTunnel} payloadTunnels={payloadTunnels} payloadData={payloadData} />}
            
            
            <Flex container alignItems="center" justifyContent="space-between">
            <Flex container height="80px" alignItems="center">
               <Text as="h3">
                  Procesed Events
                  (
                  {processedEvents?.length || '...'})
               </Text>
            </Flex>
            
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
        </>
    )
}



export default ProcessedEvents;

const StatusIcon = ({cell})=>{
   const data = cell.getData()
   return (
      <>
         {data.statusCode=="200" ? <PublishIcon /> : <UnPublishIcon />}
      </>
   
   )
}
