import React, {useRef, useState} from 'react';
import { Spacer, TextButton, Tunnel, TunnelHeader, Tunnels } from "@dailykit/ui"
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import options from '../../../../../../tableOptions'
import { toast } from 'react-toastify'
import {  GET_INVOCATIONS_OF_PROCESSED_EVENTS } from '../../../../../../../graphql';
import { useSubscription } from '@apollo/react-hooks'
import ReactJson from 'react-json-view'


const PayloadTunnel = (props)=>{
    return (
        <>
            <Tunnels tunnels={props.payloadTunnels}>
                <Tunnel size='md' popup={true} style={{"padding":"5px 16px"}} layer={1}>
                <TunnelHeader
                    title='Payload Sent'
                    close={() => props.closePayloadTunnel(1)}
                    description='This is a description'
                />
                <Spacer size="10px" />
                <ReactJson src={props.payloadData} />
                </Tunnel>
                
        
            </Tunnels>
        </>
    )
}

export default PayloadTunnel