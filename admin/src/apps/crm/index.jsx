import React from 'react'

import { TooltipProvider } from '../../shared/providers'

import App from './App'

const CRM = () => (
   <TooltipProvider app="CRM App">
      <App />
   </TooltipProvider>
)

export default CRM
