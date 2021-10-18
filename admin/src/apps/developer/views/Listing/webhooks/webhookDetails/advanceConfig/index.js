import React, {useRef, useState, useEffect} from 'react';
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {useWebhook} from '../../state'
import {StyledTable, Wrapper} from './styled'
import { TextButton, useTunnel, Flex, Text, HelperText, Input, Spacer, Form, IconButton } from '@dailykit/ui';
import {GET_EVENT_URL_ADVANCE_CONFIGS, UPDATE_REQUEST_HEADERS } from '../../../../../graphql';
import EditRetryConfig from './tunnels';
import { toast } from 'react-toastify'
import {logger}  from '../../../../../../../shared/utils'
import {EditIcon, CloseIcon} from '../../../../../../../shared/assets/icons'

export const AdvanceConfig = ()=>{

    const [advanceConfig_headers, setadvanceConfig_headers] = useState({})

    const {state, dispatch} = useWebhook()
    const [tunnels, openTunnel, closeTunnel] = useTunnel(1)



    const { data, loading, error } = useSubscription(GET_EVENT_URL_ADVANCE_CONFIGS, {
        variables:{
           webhookUrl_EventId: state.webhookDetails.webhookUrl_EventId
         },
        onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
            const headers_list = []
            for (const header in data.developer_webhookUrl_events[0].headers){
                headers_list.push({
                    'id': header,
                    'key': header,
                    'value': data.developer_webhookUrl_events[0].headers[header]
                })
            }
            const payload = {
                "webhookUrl_EventId": state.webhookDetails.webhookUrl_EventId,
                "webhookUrl_EventLabel": state.webhookDetails.webhookUrl_EventLabel,
                "webhookUrlEndpoint":state.webhookDetails.webhookUrlEndpoint,
                "advanceConfig": data.developer_webhookUrl_events[0].advanceConfig,
                "headers": headers_list
             }
            dispatch({type:'SET_WEBHOOK_DETAILS', payload:payload})
        //    setadvanceConfig_headers({
        //       "advanceConfig" : data.developer_webhookUrl_events[0].advanceConfig,
        //       "headers" : data.developer_webhookUrl_events[1].headers
        //    })
           
        },
       })
  
     if (error) {
       toast.error('Something went wrong')
       logger(error)
    } 

    return (
        <>
            {state.webhookDetails.advanceConfig && <EditRetryConfig webhookUrl_EventId={state.webhookDetails.webhookUrl_EventId} advanceConfig={state.webhookDetails.advanceConfig} tunnels={tunnels} openTunnel={openTunnel} closeTunnel={closeTunnel} />}
            <Flex container height="80px" alignItems="center">
               <Text as="h3">
                  Advance Configs
               </Text>
               <IconButton type="ghost" style={{'margin-left':'2px'}} 
               onClick={()=>openTunnel(1)}
               ><EditIcon /></IconButton>
               {/* <Tooltip identifier="coupon_list_heading" /> */}
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

    const [newHeader, setNewHeader] = useState({'key': '', 'value': ''})
    
    const initialState = state.webhookDetails.headers

    const [updateHeaders, {loading: updateheadersLoading}] = useMutation(UPDATE_REQUEST_HEADERS);
     
    const reducers = (headerState, { type, payload }) => {
        switch (type) {
           case 'SET_FIELD':
              return {
                 ...headerState,
                 [payload.field]: {
                    ...headerState[payload.field],
                    value: payload.value
                 }
              }
           case 'SET_FIELD_ERROR':
              return {
                 ...headerState,
                 [payload.field]: {
                    ...headerState[payload.field],
                    error: payload
                 }
              }
           case 'CLEAR_FIELD_ERROR':
              return {
                 ...headerState,
                 [payload.field]: {
                    ...headerState[payload.field],
                    error: ''
                 }
              }
           default:
              return headerState
        }
    }
     

    const [headerState, headerDispatch] = React.useReducer(reducers, initialState)
    
    const handleSavedHeaderChange = (name, value, header) => {
        const headerIndex = state.webhookDetails.headers.indexOf(header)
        const headers_list = state.webhookDetails.headers
        headers_list[headerIndex][name] = value

        dispatch({type:'SET_WEBHOOK_DETAILS', payload:{...state.webhookDetails, headers: headers_list}})
    }

    const handleSavedHeaderBlur = ()=>{
        const headers = {}
        for (const header of state.webhookDetails.headers){
            headers[header.key] = header.value
        }
        updateHeaders({
            variables:{
                "id": state.webhookDetails.webhookUrl_EventId,
                "headers": headers
            },
            onCompleted: () => {
                toast.success('header successfully updated')
             },
            onError : (error) =>{

                toast.error('Something went wrong')
                logger(error)
            }
        })
    }

    const handleDeleteHeader = (header)=>{
        const headers_list = state.webhookDetails.headers.filter(head=>{
           return head!=header
        })
        const headers = {}
        for (const header of headers_list){
            headers[header.key] = header.value
        }
        updateHeaders({
            variables:{
                "id": state.webhookDetails.webhookUrl_EventId,
                "headers": headers
            },
            onCompleted: () => {
                toast.success('header successfully deleted')
             },
            onError : (error) =>{

                toast.error('Something went wrong')
                logger(error)
            }
        })
    }

    const handleNewHeaderBlur = (name, value, element)=>{
        if (newHeader.key && newHeader.value){
            const headers = {}
            for (const header of state.webhookDetails.headers){
                headers[header.key] = header.value
            }
            headers[newHeader.key] = newHeader.value
            updateHeaders({
                variables:{
                    "id": state.webhookDetails.webhookUrl_EventId,
                    "headers": headers
                },
                onCompleted: () => {
                    toast.success('header successfully added')
                },
                onError : (error) =>{

                    toast.error('Something went wrong')
                    logger(error)
                }
            })
            element.value=''
            setNewHeader({'key':'', 'value':''})
        }
        else{
            toast.error("Headers key or value can't be empty ")
        }
        
    }


    
    
    return (
        <>
            <Flex container height="80px" alignItems="center">
               <Text as="h3">
                  Request Headers
               </Text>
            </Flex>
            <StyledTable >
                    <thead>
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                    </tr>
                    </thead>
                    <tbody>
                        {state.webhookDetails.headers.map(header=> 
                            <SavedHeaderRow header={header} handleSavedHeaderChange={handleSavedHeaderChange} state={state} handleSavedHeaderBlur={handleSavedHeaderBlur} handleDeleteHeader={handleDeleteHeader} />
                        )}
                        <tr>
                            <td>
                                <Input
                                    id='new-header-key'
                                    type='text'
                                    name='key'
                                    hasReadAccess={true}
                                    hasWriteAccess={true}
                                    placeholder='Enter Key'
                                    value={newHeader.key}
                                    onChange={e => setNewHeader({'key':e.target.value, 'value':newHeader.value})}
                                    onBlur={e=>handleNewHeaderBlur(e.target.name, e.target.value, e.target)}
                                />
                            </td>
                            <td>
                                <Input
                                    id='new-header-value'
                                    type='text'
                                    name='value'
                                    hasReadAccess={true}
                                    hasWriteAccess={true}
                                    placeholder='Enter Value'
                                    value={newHeader.value}
                                    onChange={e => setNewHeader({'key':newHeader.key, 'value':e.target.value})}
                                    onBlur={e=>handleNewHeaderBlur(e.target.name, e.target.value, e.target)}
                                />
                            </td>
                        </tr>
                    </tbody>
                </StyledTable>
        </>
    )
}

const SavedHeaderRow = (props)=>{
    return (
        <>
           <tr>
                <td className="saved-header">{
                    
                        <Input
                            id={props.header.key}
                            type='text'
                            // label='Key'
                            name='key'
                            hasReadAccess={true}
                            hasWriteAccess={true}
                            value={props.header.key}
                            onChange={e => 
                                
                                props.handleSavedHeaderChange(e.target.name, e.target.value, props.header)
                            }
                            onBlur={e=>props.handleSavedHeaderBlur(e.target.name, e.target.value)}
                        />
                }</td>
                <td className="saved-header">{
                    <Flex container alignItems='center' justifyContent='space-between'>
                        <Input
                            id={props.header.value}
                            type='text'
                            // label='Key'
                            name='value'
                            hasReadAccess={true}
                            hasWriteAccess={true}
                            value={props.header.value}
                            onChange={e => 
                                props.handleSavedHeaderChange(e.target.name, e.target.value, props.header)
                            }
                            onBlur={e=>props.handleSavedHeaderBlur(e.target.name, e.target.value)}
                        />
                        <IconButton type="ghost" onClick={()=>{
                            if (window.confirm('Are you sure you want to delete this header')){
                                props.handleDeleteHeader(props.header)
                            }
                            }} ><CloseIcon color="#000000" /></IconButton>
                    </Flex>
                }</td>
            </tr> 
        </>
    )
}