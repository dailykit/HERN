import React from 'react'
// import { PayloadList } from 'twilio/lib/rest/api/v2010/account/recording/addOnResult/payload'

const WebhookContext = React.createContext()

const initialState = {
    webhookDetails: {
       "webhookUrl_EventId":undefined,
       "webhookUrl_EventLabel": undefined,
       "webhookUrlEndpoint":undefined,
       "advanceConfig":undefined,
       "headers":[]
    },
    deleteFunction:undefined
 }

 const reducers = (state, { type, payload }) => {
    switch (type) {
         case 'SET_WEBHOOK_DETAILS':
            return {
               ...state,
               webhookDetails:payload
            }
         case 'SET_DELETE_FUNCTION':
            return {
               ...state,
               deleteFunction:payload
            }
    }
 }

 export const WebhookProvider = ({ children }) => {
    const [state, dispatch] = React.useReducer(reducers, initialState)
 
    return (
       <WebhookContext.Provider value={{ state, dispatch }}>
          {children}
       </WebhookContext.Provider>
    )
 }
 
 export const useWebhook = () => React.useContext(WebhookContext)