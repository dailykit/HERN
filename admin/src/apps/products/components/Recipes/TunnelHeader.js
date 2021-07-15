import React from 'react'
import { TextButton } from '@dailykit/ui'

import { TunnelHeaderContainer } from './styled'

import { CloseIcon } from '../../assets/icons'

export default ({ title, next, close, nextAction }) => {
   return (
      <TunnelHeaderContainer>
         <div>
            <TextButton onClick={() => close(1)} type='ghost'>
               <CloseIcon color='#888D9D' size='24' />
            </TextButton>
            <h1>{title}</h1>
         </div>

         <TextButton type='solid' onClick={() => next(2)}>
            {nextAction || 'Next'}
         </TextButton>
      </TunnelHeaderContainer>
   )
}
