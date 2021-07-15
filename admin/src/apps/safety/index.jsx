import React from 'react'

import App from './App'
import { AccessProvider, TooltipProvider } from '../../shared/providers'

const SafetyApp = () => (
   <TooltipProvider app="Safety App">
      <AccessProvider app="Safety">
         <App />
      </AccessProvider>
   </TooltipProvider>
)

export default SafetyApp
