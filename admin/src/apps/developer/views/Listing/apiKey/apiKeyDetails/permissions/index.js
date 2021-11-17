import React, {useState} from 'react';
import {useApiKey} from '../../state'
import { GET_API_KEY } from '../../../../../graphql';
import {Form, Spacer, Text, Tunnel, TunnelHeader, Tunnels, useSingleList, Loader, useTunnel, Flex, ComboButton } from '@dailykit/ui'
import {EditIcon, PublishIcon, UnPublishIcon} from '../../../../../assets/icons'
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {logger}  from '../../../../../../../shared/utils'
import EditPermissionsTunnel from './tunnels/editPermissions';
import {StyledTable} from './styled'

export const ApiKeyPermissions = () => {
    const {state, dispatch} = useApiKey()

    const [apiKeyPermissionData, setApiKeyPermissionData] = useState([])

    const { data, loading:apiKeyLoading, error:apiKeyError } = useSubscription(GET_API_KEY, {
        variables:{
            apiKey: state.apiKeyDetails.apiKey
         },
        onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
           const apiKeyData = [
            {"canAddProducts": {"name": "add product", "label": "Add Products", "value": data.developer_apiKey[0]?.canAddProducts}},
            {"canUpdateProducts": {"name": "update product", "label": "Update Products", "value": data.developer_apiKey[0]?.canUpdateProducts}}
        ]
        setApiKeyPermissionData(apiKeyData)
        }
       })
       
     if (apiKeyError) {
       toast.error('Something went wrong')
       logger(apiKeyError)
    }

    const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

    return (
        <>
            <EditPermissionsTunnel tunnels={tunnels} openTunnel={openTunnel} closeTunnel={closeTunnel} />
            <Flex container height="80px" alignItems="center">
               <Text as="h3">
                  Permissions
               </Text>
               <ComboButton title="Edit" onClick={()=>openTunnel(1)} type='ghost' size='sm'>
                <EditIcon color='#367BF5' />
                    Edit
                </ComboButton>
            </Flex>
            <StyledTable >
                    <thead></thead>
                    <tbody>
                    {apiKeyPermissionData.map(item=> <PermissionComponent permission={item[Object.keys(item)[0]]} />)}
                    </tbody>
                </StyledTable>
        </>
    )
}

const PermissionComponent = (props) => {
    const permission = props.permission
    return (
        <>
            <tr >
                <td >{permission.label}</td>
                <td>{permission.value?<PublishIcon />:<UnPublishIcon />}</td>
            </tr>
        </>
    )
}