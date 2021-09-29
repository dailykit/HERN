import React from 'react'

import { StyledLoader, StyledWrapper } from './styled'
const InlineLoader = props => {
   return (
      <StyledWrapper {...props}>
         <StyledLoader>
            <div />
            <div />
            <div />
            <div />
         </StyledLoader>
      </StyledWrapper>
   )
}

export default InlineLoader
