import React from 'react';
import {Form, Spacer, Tunnel, TunnelHeader, Tunnels, IconButton, Text } from '@dailykit/ui'
import { UPDATE_API_KEY_PERMISSIONS } from '../../../../../../../graphql';
import { useApiKey } from '../../../../state';
import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {logger}  from '../../../../../../../../../shared/utils'

const EditPermissionsTunnel = (props) => {
    
    const {state, dispatch} = useApiKey()

    const [updateApiKeyPermissions, {loading: updateApiKeyPermissionsLoading, error}] = useMutation(UPDATE_API_KEY_PERMISSIONS, {
        onCompleted: () => {
            toast.success('Successfully updated!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         }
    });

    const submitForm = () => {
        const canAddProducts = state.apiKeyPermissions?.filter(item=>item[Object.keys(item)[0]].label=="Add Products")[0].canAddProducts.value
        const canUpdateProducts = state.apiKeyPermissions?.filter(item=>item[Object.keys(item)[0]].label=="Update Products")[0].canUpdateProducts.value
        updateApiKeyPermissions({
            variables: {
                'apiKey': state.apiKeyDetails.apiKey,
                'canAddProducts': canAddProducts,
                'canUpdateProducts': canUpdateProducts
            }
        })
        
    }
    

    return (
        <>
            <Tunnels tunnels={props.tunnels}>
                <Tunnel style={{padding:10}} size='md' layer={1}>
                    <TunnelHeader
                    title="Edit Permissions"
                    close={() => {props.closeTunnel(1)}}
                    description='Edit Permissions'                   
                    right={{title: updateApiKeyPermissionsLoading? 'Saving...' :'Save Changes', action: ()=>submitForm() }} /> 
                    <div style={{"padding":15}}>  
                    <Spacer size='16px' />
                    {state.apiKeyPermissions?.map(item => <PermissionComponentEdit state={state} dispatch={dispatch}  permission={item[Object.keys(item)[0]]} />)}
                    </div>
                </Tunnel>
            </Tunnels>
        </>
    )
}

export default EditPermissionsTunnel

const PermissionComponentEdit = (props) => {

    const permission = props.permission

    const state = props.state

    const dispatch = props.disaptch

    const permissionName = permission.label + '-edit'

    const onChange = (dispatch) => {
        const newPermissions = state.apiKeyPermissions?.map(item => {
            if (item[Object.keys(item)[0]].label==permission.label){
                item[Object.keys(item)[0]].value = !item[Object.keys(item)[0]].value
            }
            return item
        })
        props.dispatch({type:"SET_API_KEY_PERMISSIONS", payload:newPermissions})
    }

    return (
        <>
            <Form.Group>
                <Form.Toggle
                    name={permissionName}
                    onChange={e => onChange()}
                    value={permission.value}
                    size={48}
                >
                    <Text as="text1">{permission.label}</Text>
                    
                </Form.Toggle>
            </Form.Group>
            <Spacer size="20px" />
        </>
    )
}