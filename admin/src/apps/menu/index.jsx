import React from 'react'

import App from './App'
import { AccessProvider, TooltipProvider } from '../../shared/providers'

const OnlineStore = () => (
   <TooltipProvider app="Menu App">
      <AccessProvider app="Menu">
         <App />
      </AccessProvider>
   </TooltipProvider>
)

export default OnlineStore
