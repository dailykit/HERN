import React from 'react';
import {Form, Spacer, Tunnel, TunnelHeader, Tunnels, IconButton } from '@dailykit/ui'
import { useMutation } from '@apollo/react-hooks'
import { UPDATE_REQUEST_HEADERS } from '../../../../../../../graphql';
import {
    ButtonTile,
    Flex
 } from '@dailykit/ui'
import {useWebhook} from '../../../../state'
import { toast } from 'react-toastify'
import {logger}  from '../../../../../../../../../shared/utils'
import {DeleteIcon} from '../../../../../../../../../shared/assets/icons'

const EditRequestHeaders = (props)=>{

    const {state, dispatch} = useWebhook()

    const [updateHeaders, {loading: updateheadersLoading}] = useMutation(UPDATE_REQUEST_HEADERS);

    const onChange = (e, i)=>{
        const {name, value, id} = e.target
        let header_edit
        if (name=='headerKey'){
            header_edit = state.webhookDetails.headers.filter(header=>header.id==id.slice(10))[0]
            header_edit.key = value
        }
        else{
            header_edit = state.webhookDetails.headers.filter(header=>header.id==id.slice(12))[0]
            header_edit.value = value
        }
        const headers_list = state.webhookDetails.headers.map(header=>{
            if (header.id==id.slice(12)){
                return header_edit
            }
            else{
                return header
            }
        })
        dispatch({type:'SET_WEBHOOK_DETAILS', payload:{...state.webhookDetails, headers:headers_list}})

    }

    const addNewHeader = ()=>{
        const headerId = state.webhookDetails.headers
        let newId
        if (state.webhookDetails.headers.length){
            newId = parseInt(state.webhookDetails.headers[state.webhookDetails.headers.length-1].id.slice(7))+1
        }
        else{
            newId = 1
        }
        const headers_list = [...state.webhookDetails.headers, {"id": `header-${newId}`, "key": "", "value": ""}]
        dispatch({type:'SET_WEBHOOK_DETAILS', payload:{...state.webhookDetails, headers:headers_list}})
    }

    const submitForm = ()=>{
        const headers = {}
        for (const header of state.webhookDetails.headers){
            if (header.key=="" || header.value==""){
                return toast.error("fileds can't be empty")
            }
            headers[header.key] = header.value
        }
        updateHeaders({
            variables:{
                "id": state.webhookDetails.webhookUrl_EventId,
                "headers": headers
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
        dispatch({type:'SET_WEBHOOK_DETAILS', payload:{...state.webhookDetails, headers:headers_list}})
    }

    return (
        <>
            <Tunnels tunnels={props.tunnels}>
                <Tunnel style={{padding:10}} size='md' layer={1}>
                    <TunnelHeader
                    title="Edit Request Headers"
                    close={() => {props.closeTunnel(1)}}
                    description='Edit Request Headers'                   
                    right={{title: updateheadersLoading? 'Saving...' :'Save Changes', action: ()=>submitForm() }} />   
                    <Spacer size='16px' />

                    <Flex padding="16px">
                        {props.headers.map((header, i) => (
                        <Flex container alignItems="center" justifyContent="space-around">
                            <Form.Group>
                                <Form.Label
                                    htmlFor={`headerKey-${header.id}`}
                                    title={`headerKey-${header.id}`}
                                >
                                    Header Key *
                                </Form.Label>
                                <Form.Text
                                    id={`headerKey-${header.id}`}
                                    name={`headerKey`}
                                    value={header.key}
                                    placeholder="Enter Header Key"
                                    onChange={e => onChange(e, i)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label htmlFor={`headerValue-${header.id}`}
                                    title={`headerValue-${header.id}`}
                                >
                                    Header Value *

                                </Form.Label>
                                <Form.Text 
                                    id={`headerValue-${header.id}`}
                                    name={`headerValue`}
                                    value={header.value}
                                    placeholder="Enter Header Value"
                                    onChange={e => onChange(e, i)}>

                                </Form.Text>
                            </Form.Group>
                            <IconButton type="ghost" onClick={()=>{
                            if (window.confirm('Are you sure you want to delete this header')){
                                handleDeleteHeader(header)
                            }
                            }} ><DeleteIcon style={{"color": "red"}} /></IconButton>
                        </Flex>
                        ))}
                        <Spacer yAxis size="16px" />
                        <ButtonTile
                        type="secondary"
                        text="Add New Header"
                        onClick={() =>
                            addNewHeader()
                        }
                        />
                    </Flex>
                </Tunnel>
            </Tunnels>
        </>
    )
}

export default EditRequestHeaders