import React from 'react'

import { StyledLoader, StyledWrapper } from './styled'

export const InlineLoader = () => {
   return (
      <StyledWrapper>
         <StyledLoader>
            <div />
            <div />
            <div />
            <div />
         </StyledLoader>
      </StyledWrapper>
   )
}
