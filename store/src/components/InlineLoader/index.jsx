import React from 'react'

import {
   StyledLoader,
   StyledWrapper,
   InlineStyledWrapper,
   InlineStyledLoader
} from './styled'
const InlineLoader = ({ type = 'inline', ...props }) => {
   if (type === 'inline') {
      return (
         <InlineStyledWrapper {...props}>
            <InlineStyledLoader>
               <div />
               <div />
               <div />
               <div />
            </InlineStyledLoader>
         </InlineStyledWrapper>
      )
   }
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
