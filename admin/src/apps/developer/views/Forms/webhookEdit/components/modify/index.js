import React, {useState , useEffect , useReducer} from 'react' ;
import { GET_EVENT_WEBHOOK_INFO } from '../../../../../graphql';
import { useSubscription, useMutation , useQuery} from '@apollo/react-hooks'
import { logger } from '../../../../../../../shared/utils';
import { toast } from 'react-toastify';
import { StyledTable , StyledWrapper } from './styled'
import { TextButton, useTunnel} from '@dailykit/ui';
import EditRetryConfig from './tunnels'

export const Modify = (props) => {

    const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
    const [webhookInfo , updateWebhookInfo] = useState(null)
    const [retryConfiguration , updateRetryConfiguration] = useState({})
    const webhookUrl_EventId = props.webhookUrl_EventId
    const { data, loading, error } = useSubscription(GET_EVENT_WEBHOOK_INFO, {
        variables:{
            webhookUrl_EventId: webhookUrl_EventId
         },
         onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
            const webhookUrl = data.developer_webhookUrl_events[0].webhookUrl.urlEndpoint
            const availableWebhookEvent = data.developer_webhookUrl_events[0].availableWebhookEvent.label 
            const advanceConfiguration = data.developer_webhookUrl_events[0].advanceConfig
            const Event_Webhook = {"webhookUrl" : webhookUrl, "availableWebhookEvent" : availableWebhookEvent}
            updateWebhookInfo(Event_Webhook)
            // console.log(advanceConfiguration)
            updateRetryConfiguration(advanceConfiguration)
              }
              
              
          })
  
      if (error) {
        toast.error('Something went wrong')
        logger(error)
     }


    return (<> 
        <EditRetryConfig webhookUrl_EventId={webhookUrl_EventId} advanceConfig={retryConfiguration} tunnels={tunnels} openTunnel={openTunnel} closeTunnel={closeTunnel} />
        <StyledWrapper>
            <h4>Info</h4>
            <StyledTable >
                <thead></thead>
                <tbody>
                    <tr >
                        <td >Event Name</td>
                        <td>{webhookInfo?.availableWebhookEvent}</td>
                    </tr>
                    <tr>
                        <td >Url Endpoint</td>
                        <td>{webhookInfo?.webhookUrl}</td>
                    </tr>
                </tbody>
            </StyledTable>
        </StyledWrapper>
        <StyledWrapper>
        <h4>Retry Configuration</h4>
        <div>
        <p>Number of retries:     {retryConfiguration?.numberOfRetries}</p>
        <p>Retry Interval(sec):     {retryConfiguration?.retryInterval}</p>
        <p>Timeout(sec):     {retryConfiguration?.timeOut}</p>
        
               <TextButton type="solid" 
               onClick={()=>openTunnel(1)}
               >Edit</TextButton>

        </div>

        </StyledWrapper>

        <TextButton size="sm" type="solid">Delete</TextButton>

    </>)
}