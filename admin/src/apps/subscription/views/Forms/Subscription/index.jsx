import React from 'react'

import Title from './sections/Title'
import { PlanProvider } from './state'

export const Subscription = () => {
   return (
      <PlanProvider>
         <Title />
      </PlanProvider>
   )
}
