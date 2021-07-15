import React from 'react'

import Main from './sections/Main'
import { ErrorBoundary } from '../../shared/components'

const App = () => {
   return (
      <ErrorBoundary rootRoute="/apps/insights">
         <Main />
      </ErrorBoundary>
   )
}

export default App
