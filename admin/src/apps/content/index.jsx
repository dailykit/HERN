import React from 'react'
import Keycloak from 'keycloak-js'

import App from './App'
import { TabProvider } from './context'
import {
   AuthProvider,
   AccessProvider,
   TooltipProvider,
} from '../../shared/providers'
import { get_env } from '../../shared/utils'

const keycloak = new Keycloak({
   realm: get_env('REACT_APP_KEYCLOAK_REALM'),
   url: get_env('REACT_APP_KEYCLOAK_URL'),
   clientId: 'content',
   'ssl-required': 'none',
   'public-client': true,
   'bearer-only': false,
   'verify-token-audience': true,
   'use-resource-role-mappings': true,
   'confidential-port': 0,
})

const ContentApp = () => (
   <TooltipProvider app="Content App">
      <TabProvider>
         <App />
      </TabProvider>
   </TooltipProvider>
)

export default ContentApp
