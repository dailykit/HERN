import React from 'react'

const WebhookContext = React.createContext()

const initialState = {
    webhookUrl_EventId: undefined
 }

 const reducers = (state, { type, payload }) => {
    switch (type) {
        case 'SET_WEBHOOK_URL_EVENT_ID':
            return {
                ...state,
                webhookUrl_EventId:payload
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