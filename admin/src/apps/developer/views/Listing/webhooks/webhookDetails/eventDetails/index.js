import React from 'react';
import {useWebhook} from '../../state'

export const EventDetails = ()=>{
    const {state, dispatch} = useWebhook()

    return (
        <>
            <div style={{border:"2px solid #ccc",margin : "10px",padding : "15px 10px",borderRadius:"3px"}}>
                <h1>Event Name :  <span style={{color: "black",marginLeft: "7px"}}>{state.webhookDetails.webhookUrl_EventLabel}</span> </h1>
                <h1>URL : <span style={{color: "black",marginLeft: "7px"}}> {state.webhookDetails.webhookUrlEndpoint}</span></h1>
                <h1>DESCRIPTION : <span style={{color: "black",marginLeft: "7px"}}> {state.webhookDetails.webhookUrl_EventDescription}</span></h1>
            </div>
        </>
    )
    
}

