import React, {useRef, useState} from 'react';
import { TextButton, Tunnel, TunnelHeader, Tunnels } from "@dailykit/ui"
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import options from '../../../../../../tableOptions'
import { toast } from 'react-toastify'
import {  GET_INVOCATIONS_OF_PROCESSED_EVENTS } from '../../../../../../../graphql';
import { useSubscription } from '@apollo/react-hooks'
import {logger}  from '../../../../../../../../../shared/utils'
import {
   SectionTab,
   SectionTabs,
   SectionTabList,
   SectionTabPanel,
   SectionTabPanels,
} from '@dailykit/ui'
import { PublishIcon, UnPublishIcon } from '../../../../../../../../products/assets/icons';
import moment from 'moment';



const InvocationTunnel = (props)=>{

    const [logs, setLogs] = useState([])

    const [payloadData, setPayloadData] = useState({"payloadSent":undefined, "response":undefined})

    const tableRef = useRef()

    const containerStyle = { padding: '14px', textAlign: 'left' }

    const headingStyle = { fontWeight: 400 }

    const { data, loading, error } = useSubscription(GET_INVOCATIONS_OF_PROCESSED_EVENTS, {
      variables:{
         processedWebhookEventsId: props.processedEventId,
         webhookUrl_EventId: props.webhookUrl_EventId
       },
       onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
          
           const invocationData = data.developer_processedWebhookEventsByUrl[0]?.webhookUrl_EventsLogs.map((item)=>{
              const newData = {
                 "created_at":item.created_at,
                 "status":item.Response.status,
                 "Response":item.Response,
                 "payloadSent":item.PayloadSent
              }
              return newData
           })
           setLogs(invocationData)
       }
      })

    if (error) {
      toast.error('Something went wrong')
      
      logger(error)
   }

   const rowClick = (e, cell)=>{
      const payloadSent = cell._cell.row.data.payloadSent
      const response = cell._cell.row.data.Response
      setPayloadData({"payloadSent":JSON.stringify(payloadSent, null, 10), "response":response})
   } 

    const columns = [
        {
           title: 'Created At',
           field: 'created_at',
           headerFilter: true,
           hozAlign: 'left',
           resizable:true,
           headerSort:true,
           headerTooltip: true,
           formatter: ({ _cell: { value } }) =>
               moment(value).format('MMM DD YYYY HH:mm:ss'),
        },
        {
           title: 'Status',
           field: 'status',
           headerFilter: true,
           hozAlign: 'center',
           resizable:true,
           headerSort:true,
           formatter:reactFormatter(<StatusIcon />),
           headerTooltip: true,
        },
        {
         title: 'Payload',
         field: 'Payload',
         hozAlign: 'center',
         resizable:true,
         formatter:reactFormatter(<TextButton type="ghost">View Payload</TextButton>),
         cellClick: (e, cell) => {
            rowClick(e, cell)
            props.openPopupTunnel(2)
         },
         headerTooltip: true,
      },
     ]
    return (
        <>
        <Tunnels tunnels={props.popupTunnels}>
            <Tunnel size='md' popup={true} layer={1} style={{"padding":"5px 16px"}}>
               <TunnelHeader
                  title='Invocation Logs'
                  close={() => props.closePopupTunnel(1)}
                  description='This is a description'
                //   tooltip={<InfoIcon color='#a4a4a4' />}
               />
               {/* <StyledWrapper> */}
                  {Boolean(logs) && (
                  <ReactTabulator
                     columns={columns}
                     data={logs}
                     options={{
                        ...options,
                        placeholder: 'No logs Available Yet !',
                        persistenceID : 'invocationLogs_table'
                     }}
                     ref={tableRef}
                     className = 'developer-webhooks-invocationLogs'
                  />
               )}
            {/* </StyledWrapper> */}
            </Tunnel>

            <Tunnel layer={2} popup={true} size='md'>
               <TunnelHeader
                  title='Request Response'
                  close={() => props.closePopupTunnel(2)}
               />
               <div
                  style={{
                     padding: 14,
                     height: 'calc(100vh - 32px)',
                     background: 'rgb(237, 237, 237)'
                  }}
               >
                  <SectionTabs>
                     <SectionTabList>
                        <SectionTab>
                           <div style={containerStyle}>
                              <h3 style={headingStyle}>Payload Sent</h3>
                           </div>
                        </SectionTab>
                        <SectionTab>
                           <div style={containerStyle}>
                              <h3 style={headingStyle}>Response</h3>
                           </div>
                        </SectionTab>
                     </SectionTabList>
                     <SectionTabPanels>
                        <SectionTabPanel>{payloadData.payloadSent}</SectionTabPanel>
                        <SectionTabPanel>{JSON.stringify(payloadData.response, null, 4)}</SectionTabPanel>
                     </SectionTabPanels>
                  </SectionTabs>
               </div>
            </Tunnel>


        </Tunnels>
        </>
    )
}

export default InvocationTunnel

const StatusIcon = ({cell})=>{
   const data = cell.getData()
   return (
      <>
         {data.status=="200" ? <PublishIcon /> : <UnPublishIcon />}
      </>
   
   )
}