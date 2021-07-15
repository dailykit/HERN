import React from 'react'

import { AccessProvider, TooltipProvider } from '../../shared/providers'

import App from './App'

import '@dailykit/react-tabulator/css/bootstrap/tabulator_bootstrap.min.css'
import '@dailykit/react-tabulator/lib/styles.css'
import './tableStyle.css'

const Subscription = () => (
   <TooltipProvider app="Subscription App">
      <AccessProvider app="Manage Subscription">
         <App />
      </AccessProvider>
   </TooltipProvider>
)

export default Subscription
