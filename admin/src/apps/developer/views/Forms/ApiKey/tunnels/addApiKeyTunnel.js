import React , { useReducer} from 'react';
import { useMutation } from '@apollo/react-hooks'
import {logger}  from '../../../../../../shared/utils'
import {Form, Spacer, Text, Tunnel, TunnelHeader, Tunnels, useSingleList, Loader } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { ADD_API_KEY } from '../../../../graphql';

export const AddApiKeyTunnel = (props)=>{

    const initialState = {
        "label": "",
        "activationStatus": true,
        "canAddProducts": false,
        "canUpdateProducts": false
    }

    const reducers = (state, { type, payload }) => {
        switch (type) {
            case 'SET_API_LABEL':
                return {
                   ...state,
                   label:payload
                }
            case 'SET_ACTIVATION_STATUS':
                return {
                   ...state,
                   activationStatus:payload
                }
            case 'SET_ADD_PRODUCT':
                return {
                    ...state,
                    canAddProducts:payload
                }
            case 'SET_UPDATE_PRODUCT':
                return {
                    ...state,
                    canUpdateProducts:payload
                }
        }   
    }

    const [state, dispatch] = useReducer(reducers, initialState)

    const [addApiKey, {loading : apiKeyLoading}] = useMutation(ADD_API_KEY ,{
        onComplete : (data) => {
            toast.success('Api Key successfully created')
        },
        onError : (error) =>{
            toast.error('Something went wrong (Use different label name)')
            logger(error)
        },
        
    })

    const submitForm = ()=>{
        if (state.label=="" || state.label==null){
            toast.error("Please enter label")
            return 
        }
        addApiKey({
            variables:{
                "canUpdateProducts": state.canAddProducts,
                "canAddProducts": state.canAddProducts,
                "isDeactivated": !state.activationStatus,
                "label": state.label
            }
        })
        if(apiKeyLoading){
            return <Loader/>
        }else{
            props.closeTunnel(1)
        }
    }

    return (
        <>
             <Tunnels tunnels={props.tunnels}>
                    <Tunnel style={{padding:10}} layer={1}>

                        <TunnelHeader
                        title="Add Api Key"
                        close={() => {props.closeTunnel(1)}}
                        description='This is for adding api key'
                        
                        right={
                            {
                                title: 'Add',
                                action: () => {submitForm()}
                            }
                        }
                    />
                    <div style={{"padding":15}}>
                    <Spacer size="15px" />
                            <Form.Group>
                                <Form.Label
                                    htmlFor={`label`}
                                    title={`label`}
                                >
                                    Label
                                </Form.Label>
                                <Spacer size="7px" />
                                <Form.Text
                                    id={`label`}
                                    name={`label`}
                                    value={state.label}
                                    placeholder="Enter Label"
                                    onChange={e => dispatch({type:'SET_API_LABEL', payload: e.target.value})}
                                />
                            </Form.Group>
                            <Spacer size="20px" />
                            <Form.Group>
                                <Form.Toggle
                                    name='activationStatus'
                                    onChange={e => dispatch({type:'SET_ACTIVATION_STATUS', payload: !state.activationStatus})}
                                    value={state.activationStatus}
                                    size={48}
                                >
                                    Activation Status
                                </Form.Toggle>
                            </Form.Group>
                            <Spacer size="20px" />
                            <Text as="h3">Permissions</Text>
                            <Spacer size="10px" />
                            <Form.Group>
                                 <Form.Toggle
                                    name='addProduct'
                                    onChange={e => dispatch({type:'SET_ADD_PRODUCT', payload: !state.canAddProducts})}
                                    value={state.canAddProducts}
                                    size={40}
                                >
                                    Add products
                                </Form.Toggle>
                            </Form.Group>
                            <Spacer size="10px" />
                            <Form.Group>
                                 <Form.Toggle
                                    name='updateProduct'
                                    onChange={e => dispatch({type:'SET_UPDATE_PRODUCT', payload: !state.canUpdateProducts})}
                                    value={state.canUpdateProducts}
                                    size={40}
                                >
                                    Update products
                                </Form.Toggle>
                            </Form.Group>
                            </div>
                    </Tunnel>
                </Tunnels>
        </>
    )
}
