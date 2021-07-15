import React from 'react'

import App from './App'
import { AccessProvider, TooltipProvider } from '../../shared/providers'

const Recipe = () => (
   <TooltipProvider app="Products App">
      <AccessProvider app="Products">
         <App />
      </AccessProvider>
   </TooltipProvider>
)

export default Recipe
