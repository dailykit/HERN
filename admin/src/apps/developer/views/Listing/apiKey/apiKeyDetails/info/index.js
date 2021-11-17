import React from 'react';
import {useApiKey} from '../../state'
import {Form, Spacer, Text, Tunnel, TunnelHeader, Tunnels, useSingleList, Loader } from '@dailykit/ui'

export const ApiKeyInfo = ()=>{
    const {state, dispatch} = useApiKey()

    return (
        <>
            <div style={{border:"2px solid #ccc",margin : "10px",padding : "15px 10px",borderRadius:"3px"}}>
                <h1>Label :  <span style={{color: "black",marginLeft: "7px"}}>{state.apiKeyDetails.label}</span> </h1>
                <h1>Api Key : <span style={{color: "black",marginLeft: "7px"}}> {state.apiKeyDetails.apiKey}</span></h1>
            </div>
            <Spacer size="20px" />
            <div style={{padding: "0px 10px"}}>
                <Form.Group>
                    <Form.Toggle
                        name='activationStatus'
                        // onChange={e => }
                        value={state.apiKeyDetails.activationStatus}
                        size={48}
                    >
                        <Text as="text1">Activation Status</Text>
                    </Form.Toggle>
                </Form.Group>
            </div>
            
        </>
    )
    
}