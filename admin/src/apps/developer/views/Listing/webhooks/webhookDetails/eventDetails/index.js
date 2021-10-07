import React, {useRef, useState, useEffect} from 'react';
import {useWebhook} from '../../state'
import {StyledTable, Wrapper} from './styled'
import { TextButton, useTunnel, Flex, Text } from '@dailykit/ui';
import EditRetryConfig from './tunnels';
import {EditIcon} from '../../../../../../../shared/assets/icons'

export const EventDetails = ()=>{
    const {state, dispatch} = useWebhook()

    return (
        <>
            <h1>Event Name :  {state.webhookDetails.webhookUrl_EventLabel}</h1>
            <h1>URL :  {state.webhookDetails.webhookUrlEndpoint}</h1>
        </>
    )
    
}

export const AdvanceConfig = ()=>{
    const {state, dispatch} = useWebhook()
    const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
    return (
        <>
            <EditRetryConfig webhookUrl_EventId={state.webhookDetails.webhookUrl_EventId} advanceConfig={state.webhookDetails.advanceConfig} tunnels={tunnels} openTunnel={openTunnel} closeTunnel={closeTunnel} />
            <Flex container height="80px" alignItems="center">
               <Text as="h2">
                  Advance Configs
               </Text>
               {/* <Tooltip identifier="coupon_list_heading" /> */}
            </Flex>
            <StyledTable >
                <Flex container alignItems="center" justifyContent="space-between">
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
                <TextButton type="solid" 
               onClick={()=>openTunnel(1)}
               >Edit</TextButton>
               </Flex>
            </StyledTable>
        </>
    )
}