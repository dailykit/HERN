import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import '@dailykit/react-tabulator/css/bootstrap/tabulator_bootstrap.min.css'
import '@dailykit/react-tabulator/lib/styles.css'
import '../../shared/styled/tableStyles.css'
import './views/Listings/tableStyle.css'
import Main from './sections/Main'
import { ErrorBoundary } from '../../shared/components'

const App = () => {
   return (
      <ErrorBoundary rootRoute="/apps/inventory">
         <Main />
      </ErrorBoundary>
   )
}

export default App
