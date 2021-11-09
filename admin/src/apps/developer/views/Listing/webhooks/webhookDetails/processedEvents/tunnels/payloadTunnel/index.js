import React from 'react';
import { Spacer, Tunnel, TunnelHeader, Tunnels } from "@dailykit/ui"
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