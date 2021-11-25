import React from 'react'

import {
   StyledLoader,
   StyledWrapper,
   InlineStyledWrapper,
   InlineStyledLoader,
   FlamingoLoader
} from './styled'
const InlineLoader = ({ type = 'inline', ...props }) => {
   if (type === 'inline') {
      return (
         <InlineStyledWrapper {...props}>
            <InlineStyledLoader {...props}>
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
         {/* three horizontal dots loader */}
         {/* <StyledLoader {...props}>
            <div />
            <div />
            <div />
            <div />
         </StyledLoader> */}
         <FlamingoLoader src="/assets/gifs/Stayin_Loader.gif" alt="loader" />
      </StyledWrapper>
   )
}

export default InlineLoader
