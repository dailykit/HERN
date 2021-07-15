import React from 'react'

import App from './App'
import './tableStyle.css'
import { AccessProvider, TooltipProvider } from '../../shared/providers'

const BrandApp = () => (
   <TooltipProvider app="Brand App">
      <AccessProvider app="Brands">
         <App />
      </AccessProvider>
   </TooltipProvider>
)

export default BrandApp
