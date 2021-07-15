import React from 'react'

import '@dailykit/react-tabulator/css/bootstrap/tabulator_bootstrap.min.css'
import '@dailykit/react-tabulator/lib/styles.css'
import './views/tableStyle.css'

import Main from './sections/Main'
import Sidebar from './sections/Sidebar'
import BrandContext from './context/Brand'
import { ErrorBoundary } from '../../shared/components'

const App = () => {
   const [context, setContext] = React.useState({ brandId: 0, brandName: '' })

   return (
      <ErrorBoundary rootRoute="/apps/crm">
         <BrandContext.Provider value={[context, setContext]}>
            <Sidebar />
            <Main />
         </BrandContext.Provider>
      </ErrorBoundary>
   )
}

export default App
