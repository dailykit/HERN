import React from 'react'

import App from './App'
import { AccessProvider, TooltipProvider } from '../../shared/providers'

const Inventory = () => {
   return (
      <TooltipProvider app="Inventory App">
         <AccessProvider app="Inventory">
            <App />
         </AccessProvider>
      </TooltipProvider>
   )
}

export default Inventory
