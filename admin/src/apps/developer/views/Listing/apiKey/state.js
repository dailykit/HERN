import React from 'react'

const ApiKeyContext = React.createContext()

const initialState = {
    apiKeySelected: false,
    apiKeyDetails: {
       "label": undefined,
       "apiKey": undefined,
       "activationStatus":undefined
    },
    apiKeyPermissions: [
      {"canAddProducts": {"label": "Add Products", value: false}},
      {"canUpdateProducts": {"label": "Update Products", value: false}}
    ],
    apiKeyDeleteFunction: undefined
 }

 const reducers = (state, { type, payload }) => {
    switch (type) {
         case 'SET_API_KEY_SELECTED':
            return {
               ...state,
               apiKeySelected: payload
            }
         case 'SET_API_KEY_DETAILS':
            return {
               ...state,
               apiKeyDetails:payload
            }
         case 'SET_API_KEY_PERMISSIONS':
            return {
               ...state,
               apiKeyPermissions:payload
            }
         case 'SET_API_KEY_DELETE_FUNCTION':
            return {
               ...state,
               apiKeyDeleteFunction: payload
            }
    }
 }

 export const ApiKeyProvider = ({ children }) => {
    const [state, dispatch] = React.useReducer(reducers, initialState)
 
    return (
       <ApiKeyContext.Provider value={{ state, dispatch }}>
          {children}
       </ApiKeyContext.Provider>
    )
 }
 
 export const useApiKey = () => React.useContext(ApiKeyContext)