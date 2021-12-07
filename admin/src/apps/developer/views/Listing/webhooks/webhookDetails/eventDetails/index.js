import React, {useRef, useState, useEffect} from 'react';
import {useWebhook} from '../../state'

export const EventDetails = ()=>{
    const {state, dispatch} = useWebhook()

    return (
        <>
            <h1>Event Name :  {state.webhookDetails.webhookUrl_EventLabel}</h1>
            <h1>URL :  {state.webhookDetails.webhookUrlEndpoint}</h1>
        </>
    )
    
}

