import React from 'react'
import App from './App'
import { GlobalInfoProvider } from './context'
import { TooltipProvider } from '../../shared/providers'

// Components
const EditorApp = () => (
   <TooltipProvider app="Editor App">
      <GlobalInfoProvider>
         <App />
      </GlobalInfoProvider>
   </TooltipProvider>
)

export default EditorApp
