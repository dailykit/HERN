import React , {useState, useEffect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         } from 'react';
import {UPDATE_RETRY_CONFIGURATION, GET_EVENT_WEBHOOK_INFO } from '../../../../../../graphql';
import { Loader } from '@dailykit/ui'
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import {Form, Spacer, Text, Tunnel, TunnelHeader, Tunnels } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../shared/utils';



const EditRetryConfig = (props) => {


    // console.log(props.advanceConfig.retryInterval , "from props")
    const [advanceConfig, updatedadvanceConfig] = useState({})
    console.log(advanceConfig , "in state")

    const { data, loading, error } = useSubscription(GET_EVENT_WEBHOOK_INFO, {
        variables:{
            webhookUrl_EventId: props.webhookUrl_EventId
         },
         onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
            const advanceConfiguration = data.developer_webhookUrl_events[0]?.advanceConfig
            updatedadvanceConfig(advanceConfiguration)
              }
              
              
          })
  
      if (error) {
        toast.error('Something went wrong')
        logger(error)
     }

    const [updateRetryConfiguration] = useMutation(UPDATE_RETRY_CONFIGURATION, {
        onCompleted: () => {
           toast.success('Successfully updated!')
        },
        onError: error => {
           toast.error('Something went wrong!')
           logger(error)
        },
     })
    const submitForm = () => {
        updateRetryConfiguration({
            variables: {
               "id": props.webhookUrl_EventId,
               "advanceConfig":advanceConfig
            },
         })
         props.closeTunnel(1)
    }


    return (
        <>
            <Tunnels tunnels={props.tunnels}>
                <Tunnel style={{padding:10}} layer={1}>
                    <TunnelHeader
                    title="Edit Retry Configuration"
                    close={() => {props.closeTunnel(1)}}
                    description='Edit Retry Configuration'                   
                    right={{title: 'Save Changes', action: () => {submitForm()}}} />   
                    <Spacer size='16px' />

                    <Form.Group>
                        <Form.Label htmlFor='numberOfRetries' title='numberOfRetries'>
                            Number of Retries
                        </Form.Label>
                        <Form.Number
                            id='numberOfRetries'
                            name='numberOfRetries'
                            onChange={(e) => {updatedadvanceConfig({timeOut:advanceConfig.timeOut, retryInterval:advanceConfig.retryInterval, numberOfRetries:parseInt(e.target.value)})}}
                            placeholder={props.advanceConfig?.numberOfRetries}
                        />
                        <Spacer size='16px' />
                        <Form.Label htmlFor='retryInterval' title='retryInterval'>
                            Retry Interval(sec)
                        </Form.Label>
                        <Form.Number
                            id='retryInterval'
                            name='retryInterval'
                            onChange={(e) => {updatedadvanceConfig({timeOut:advanceConfig.timeOut, retryInterval:parseInt(e.target.value), numberOfRetries:advanceConfig.numberOfRetries})}}
                            placeholder={props.advanceConfig?.retryInterval}
                        />
                        <Spacer size='16px' />
                        <Form.Label htmlFor='timeOut' title='timeOut'>
                            Timeout (sec)
                        </Form.Label>
                        <Form.Number
                            id='timeOut'
                            name='timeOut'
                            onChange={(e) => {updatedadvanceConfig({timeOut:parseInt(e.target.value), retryInterval:advanceConfig.retryInterval, numberOfRetries:advanceConfig.numberOfRetries})}}
                            placeholder={props.advanceConfig?.timeOut}
                        />
                    </Form.Group>
                </Tunnel>
            </Tunnels>
        </>
    )
}

export default EditRetryConfig ;