import React, {useRef, useState} from 'react';
import { ReactTabulator } from '@dailykit/react-tabulator'
import {Table, TableHead, TableBody, TableRow, TableCell, Flex, TextButton, Text, Spacer, DropdownButton, ButtonGroup, ComboButton, PlusIcon, useTunnel} from '@dailykit/ui';
import options from '../../../../tableOptions'
import { GET_EVENT_LOGS } from '../../../../../graphql';
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {logger}  from '../../../../../../../shared/utils'
import { StyledWrapper } from './styled'


const InvocationLogs = (props)=>{

    const [logs, setLogs] = useState([])

    const webhookUrl_EventId = props.webhookUrl_EventId

    const { data, loading, error } = useSubscription(GET_EVENT_LOGS, {
      variables:{
          webhookUrl_EventId: webhookUrl_EventId
       },
       onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
         setLogs(data.developer_webhookUrl_events[0]?.webhookUrl_EventsLogs)
       },
      })

    if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

    const tableRef = useRef()

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
        //    cellClick: (e, cell) => {
        //       rowClick(e, cell)
        //    }
           // headerTooltip: function (column) {
           //    const identifier = 'webhook_listing_code_column'
           //    return (
           //       tooltip(identifier)?.description || column.getDefinition().title
           //    )
           // },
        },
        {
           title: 'status',
           field: 'Response',
           headerFilter: true,
           hozAlign: 'left',
           resizable:true,
           headerSort:true,
           cssClass: 'rowClick',
           width: 300
        }
     ]

    return (
        <>
            <div className="App" >
            <StyledWrapper>
               <Flex container alignItems="center" justifyContent="space-between">
               <Flex container height="80px" alignItems="center">
                  <Text as="h2">
                     Invocation Logs
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
         </StyledWrapper>
        </div>
        </>
    )
}

export default InvocationLogs;