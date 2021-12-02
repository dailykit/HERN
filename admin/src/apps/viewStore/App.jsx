import React from 'react'
import { ErrorBoundary } from '../../shared/components'
import Main from './sections/Main'

const App = () => {
   return (
      <ErrorBoundary rootRoute="/apps/viewStore">
         <Main />
      </ErrorBoundary>
   )
}

export default App
