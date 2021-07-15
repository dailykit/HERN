import React from 'react'
import { Text } from '@dailykit/ui'
import { StyledTile } from './styled'

const HeadingTile = ({ title, value }) => {
   return (
      <StyledTile>
         <Text as="p">{title}</Text>
         <Text as="title">{value}</Text>
      </StyledTile>
   )
}

export default HeadingTile
