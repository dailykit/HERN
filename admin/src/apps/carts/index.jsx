import React from 'react'

import App from './App'
import { TooltipProvider } from '../../shared/providers'

import '@dailykit/react-tabulator/css/bootstrap/tabulator_bootstrap.min.css'
import '@dailykit/react-tabulator/lib/styles.css'
import './tableStyles.css'

const Carts = () => (
   <TooltipProvider app="Cart App">
      <App />
   </TooltipProvider>
)

export default Carts
