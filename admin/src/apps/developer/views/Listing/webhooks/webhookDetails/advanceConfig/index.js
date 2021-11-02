import React, {useState} from 'react';
import { useSubscription } from '@apollo/react-hooks'
import {useWebhook} from '../../state'
import {StyledTable} from './styled'
import { useTunnel, Flex, Text, ComboButton, Loader } from '@dailykit/ui';
import {GET_EVENT_URL_ADVANCE_CONFIGS } from '../../../../../graphql';
import EditRetryConfig from './tunnels/editRetryConfig';
import EditRequestHeaders from './tunnels/editRequestHeaders';
import {EditIcon} from '../../../../../../../shared/assets/icons'

export const AdvanceConfig = ()=>{

    const {state, dispatch} = useWebhook()
    const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
    return (
        <>
            {state.webhookDetails.advanceConfig && <EditRetryConfig webhookUrl_EventId={state.webhookDetails.webhookUrl_EventId} advanceConfig={state.webhookDetails.advanceConfig} tunnels={tunnels} openTunnel={openTunnel} closeTunnel={closeTunnel} />}
            <Flex container height="80px" alignItems="center">
               <Text as="h3">
                  Advance Configs
               </Text>
               <ComboButton title="Edit" onClick={()=>openTunnel(1)} type='ghost' size='sm'>
                <EditIcon color='#367BF5' />
                    Edit
                </ComboButton>
            </Flex>
            
                <Flex container alignItems="center" justifyContent="space-between">
                <StyledTable >
                    <thead></thead>
                    <tbody>
                        <tr >
                            <td >Number of retries</td>
                            <td>{state.webhookDetails.advanceConfig?.numberOfRetries}</td>
                        </tr>
                        <tr>
                            <td >Retry Interval (sec)</td>
                            <td>{state.webhookDetails.advanceConfig?.retryInterval}</td>
                        </tr>
                        <tr>
                            <td >Timeout (sec)</td>
                            <td>{state.webhookDetails.advanceConfig?.timeOut}</td>
                        </tr>
                    </tbody>
                </StyledTable>
               </Flex>
            
        </>
    )
}

export const Headers = ()=>{

    const {state, dispatch} = useWebhook()

    const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
    
    const [headerState, updateHeaderState] = useState([])

    const { data, loading, error } = useSubscription(GET_EVENT_URL_ADVANCE_CONFIGS, {
        variables:{
           webhookUrl_EventId: state.webhookDetails.webhookUrl_EventId
         },
        onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
            const headers_list = []
            let i=1
            for (const header in data.developer_webhookUrl_events[0].headers){
                headers_list.push({
                    'id': `header-${i}`,
                    'key': header,
                    'value': data.developer_webhookUrl_events[0].headers[header]
                })
                i+=1
            }
            updateHeaderState(headers_list)
           
        },
       })
    
    return (
        <>
            {state.webhookDetails.headers && 
            <EditRequestHeaders
            webhookUrl_EventId={state.webhookDetails.webhookUrl_EventId} 
            headers={state.webhookDetails.headers} 
            tunnels={tunnels} 
            openTunnel={openTunnel} 
            closeTunnel={closeTunnel} 
            />}
            <Flex container height="80px" alignItems="center">
               <Text as="h3">
                  Request Headers
               </Text>
               <ComboButton title="Edit" onClick={()=>openTunnel(1)} type='ghost' size='sm'>
                <EditIcon color='#367BF5' />
                    Edit
                </ComboButton>
            </Flex>
            {headerState ?
                <StyledTable >
                        <thead>
                        <tr>
                            <th>Key</th>
                            <th>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                            {headerState.map(header=> (
                                <tr>
                                    <td>
                                        {header.key}
                                    </td>
                                    <td>
                                        {header.value}
                                    </td>
                                </tr>
                            ))}
                            
                        </tbody>
                </StyledTable>
            : <Text as="h4" >No headers available</Text>
                        }
        </>
    )
}

