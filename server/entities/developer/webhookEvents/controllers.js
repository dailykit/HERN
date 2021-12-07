import axios from 'axios'; 
import { client } from '../../../lib/graphql';
import {  INSERT_PROCESSED_EVENT, INSERT_INVOCATION_LOGS, GET_AVAILABLE_WEBHOOK_EVENT_ID, FETCH_PROCESSED_WEBHOOK_BY_URL } from './graphql';


// for hasura admin secret in development mode 
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

/*
this controller is responsible for sending payload to all the webhook urls 
that are binded to a particular event whenever that event is triggered . 
It will be recieving the payload whenever the event is triggered 
then all the webhook urls binded to that event will be fetched from webhookUrl_events table 
and post request with the payload will be sent to each webhook url
along with the retry configuration.
*/
export const sendWebhookEvents = async (req , res) => {
    const processedWebhookEventsId = req.body.event.data.new.id
    const payload = req.body.event.data.new.payload
    const response_webhookUrlArray = await client.request(
        FETCH_PROCESSED_WEBHOOK_BY_URL , {"processedWebhookEventId" : processedWebhookEventsId}
    )
    const webhookUrlArray = response_webhookUrlArray.developer_processedWebhookEventsByUrl
    var webhookUrlArrayLength = webhookUrlArray.length
    for(var i = 0; i < webhookUrlArrayLength; i++){
        postpayload(i , webhookUrlArray , payload);
    }
    res.send('payload sent')
}

export const processWebhookEvents  = async (req , res) => {
    
    const payload = req.body

    const eventName = req.body.trigger.name

    const response_availableWebhookEventId = await client.request(
        GET_AVAILABLE_WEBHOOK_EVENT_ID, { "webhookEventLabel": eventName }
     )
    const availableWebhookEventId = response_availableWebhookEventId.developer_availableWebhookEvent[0].id

    const response_insertProcessedEvent = await client.request(
        INSERT_PROCESSED_EVENT, {
            "availableWebhookEventId":availableWebhookEventId,
            "payload":payload
        }
    )
    res.send('request completed')
}

// const webhookUrlArrayTraversal = async (webhookUrlArray)=>{
//     webhookUrlArray.forEach(element=>{
//         const urlEndpoint = element["webhookUrl"].urlEndpoint
//         const advanceConfig = element["advanceConfig"]

//         function postPayload(urlEndpoint, advanceConfig){
//             const response_webhook = axios({
//                 url: urlEndpoint,
//                 method:"POST",
//                 data:payload
//             })
//             setTimeout(()=>{
//                 if(response_webhook.status!=200&&advanceConfig.retryInterval){
//                     advanceConfig.retryInterval-=1;
//                     postPayload(urlEndpoint, advanceConfig)
//                 }
//             }, advanceConfig.retryInterval)
//         }

//         postPayload(urlEndpoint, advanceConfig)

        

//     })
// }

    

    




    

/*
this controller is responsible for handling event trigges state 
if the is active status of an event turns true then the event will be added in hasura events
and if the active status of an event turns false then the event will be removed from hasura events
using handleEvents.create and handleEvents.delete respectively 
*/
export const handleIsActiveEventTrigger = async (req , res) => {
    try{
        if(req.body.event.data.old.isActive === false && req.body.event.data.new.isActive === true) {
            handleEvents.create(req, res)
        }else if(req.body.event.data.old.isActive === true && req.body.event.data.new.isActive === false){
            handleEvents.delete(req, res)
        }
        res.status(200).json({success: true , message: 'handled event trigger'})
    }catch(err){ return res
        .status(400)
        .json({ success: false, message: `request failed` })}
}

const retrySendingPayload = async(processedWebhookEventsByUrlId , webhookUrl_eventsId , urlEndPoint, headers , payload , numberOfRetries , retryInterval , leftOutTime) => {
    var res= await sendPayloadToUrlEndpoint(urlEndPoint, headers , payload , leftOutTime)
    var response = {"status":res.status,"body":res.body,"headers":res.headers,"message":res.message,"data":res.data}
    // here the response will be added to invocation logs 
    insertInInvocationLogs(payload , response, processedWebhookEventsByUrlId , webhookUrl_eventsId )
    if(res.status === 200 ||  numberOfRetries <= 0 ){
        return res ;
    }
    var numberOfRetries = numberOfRetries - 1
    setTimeout(()=> { retrySendingPayload(processedWebhookEventsByUrlId, webhookUrl_eventsId, urlEndPoint, headers , payload , numberOfRetries , retryInterval  , leftOutTime) }, retryInterval*1000) 
    
}

const sendPayloadToUrlEndpoint =  async (urlEndPoint, headers , payload  , timeout) => {
    try{
       const res = await axios({
            url : urlEndPoint ,
            method : 'POST' , 
            data : payload , 
            headers : headers,
            timeout : timeout*1000
        })
        return res
    }
    catch(error){
        return {status:400}
    }
}

const postpayload = async(i , webhookUrlArray , payload) =>{ // create a unique function (scope) each time
    var k = i
    var timeout = webhookUrlArray[k].webhookUrl_event.advanceConfig.timeOut
    var urlEndPoint = webhookUrlArray[k].urlEndPoint
    var headers = webhookUrlArray[k].webhookUrl_event.headers
    var processedWebhookEventsByUrlId = webhookUrlArray[k].id
    var webhookUrl_eventsId = webhookUrlArray[k].webhookUrl_eventsId
    var retryInterval = webhookUrlArray[k].webhookUrl_event.advanceConfig.retryInterval
    var numberOfRetries = webhookUrlArray[k].webhookUrl_event.advanceConfig.numberOfRetries
    retrySendingPayload(processedWebhookEventsByUrlId , webhookUrl_eventsId ,urlEndPoint, headers , payload , numberOfRetries ,  retryInterval , timeout*1000) 
}

const insertInInvocationLogs = async(payloadSent , response , processedWebhookEventsByUrlId , webhookUrl_EventsId) =>{
    try{
        const response_insert_invocationLogs = await client.request(
            INSERT_INVOCATION_LOGS, {
                "PayloadSent":payloadSent,
                "Response":response,
                "processedWebhookEventsByUrlId":processedWebhookEventsByUrlId,
                "webhookUrl_EventsId" : webhookUrl_EventsId
            }
        )
        console.log('response_insert_invocationLogs' , response_insert_invocationLogs)
    }
    catch(error){
        console.log("error in inserting log " , error.response)
    }
}

const handleEvents = {

    // create event in hasura events 
    create : async (req , res) => {
        try {
            const eventName = req.body.event.data.old.label
            const tableName = req.body.event.data.old.tableName
            const schemaName = req.body.event.data.old.schemaName

            await axios({
                   url:"https://testhern.dailykit.org/datahub/v1/query",
                    method:'POST',
                    headers:{
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Hasura-Role': 'admin',
                        "x-hasura-admin-secret" : process.env.HASURA_GRAPHQL_ADMIN_SECRET
                    },
                    data:{
                            "type" : "create_event_trigger",
                            "args" : {
                                "name": eventName,
                                "table": {
                                   "name": tableName,
                                   "schema":schemaName
                                },
                                "webhook": "http://0245-111-223-3-62.ngrok.io/server/api/developer/webhookEvents/processWebhookEvents",
                                "insert": {
                                    "columns": "*",
                                    "payload": "*"
                                },
                                "replace": false                
                        }
                    }
            })
        } catch (err) {
            console.log(err)
        }
    
    } , 

    // delete event from hasura events 
    delete : async (req , res) => {
        try {
            const eventName = req.body.event.data.old.label
            const tableName = req.body.event.data.old.tableName
            const schemaName = req.body.event.data.old.schemaName

            const response = await axios({
                   url:"https://testhern.dailykit.org/datahub/v1",
                    method:'POST',
                    headers:{
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Hasura-Role': 'admin',
                        "x-hasura-admin-secret" : process.env.HASURA_GRAPHQL_ADMIN_SECRET
                    },
                    data:{
                            "type" : "delete_event_trigger",
                            "args" : {
                                "name": eventName,
                                "table": {
                                   "name": tableName,
                                   "schema":schemaName
                                },
                                "webhook": "http://0245-111-223-3-62.ngrok.io/server/api/developer/webhookEvents/processWebhookEvents",
                                "insert": {
                                    "columns": "*",
                                    "payload": "*"
                                },
                                "replace": false
                        }
                    }
            })
        } catch (err) {
            console.log(err)
        }
    
    }

}
