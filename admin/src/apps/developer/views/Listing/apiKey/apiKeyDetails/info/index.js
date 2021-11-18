import React from 'react';
import { useMutation } from '@apollo/react-hooks'
import {useApiKey} from '../../state'
import {Form, Spacer, Text, Tunnel, TunnelHeader, Tunnels, useSingleList, Loader } from '@dailykit/ui'
import { UPDATE_API_KEY_ACTIVATION_STATUS } from '../../../../../graphql';

export const ApiKeyInfo = ()=>{
    const {state, dispatch} = useApiKey()

    const [updateApiKey, {loading: updateApiKeyLoading}] = useMutation(UPDATE_API_KEY_ACTIVATION_STATUS);

    const onChange = (e) => {
        dispatch({type:'SET_API_KEY_DETAILS', payload: {
            "label": state.apiKeyDetails.label,
            "apiKey": state.apiKeyDetails.apiKey,
            "activationStatus": !state.apiKeyDetails.activationStatus
        }})
        updateApiKey({
            variables : {
                "apiKey": state.apiKeyDetails.apiKey,
                "isDeactivated": state.apiKeyDetails.activationStatus
            }
        })
    }

    if (updateApiKeyLoading){
        return <Loader />
    }

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
                        onChange={e => onChange(e)}
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