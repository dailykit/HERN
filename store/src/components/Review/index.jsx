import React from 'react'
import { StyledContent, StyledFooter, Wrapper } from './styled'

const Review = ({ children }) => {
   return <Wrapper>{children}</Wrapper>
}

Review.Content = ({ children }) => {
   return <StyledContent>{children}</StyledContent>
}

Review.Footer = ({ children }) => {
   return <StyledFooter>{children}</StyledFooter>
}

export default Review
