import React from 'react'
import { Text, Flex } from '@dailykit/ui'
import { StyledCard, ViewTab } from './styled'

const StyleCard = ({ active, heading, click, data }) => {
   return (
      <StyledCard active={active === heading}>
         <Flex container justifyContent="space-between" padding="16px">
            <Text as="p">Loyalty Points</Text>
            <ViewTab onClick={click}>view</ViewTab>
         </Flex>
         <Flex container padding="16px" className="cardContent">
            <Flex container flexDirection="column">
               <Text as="p">Total Points</Text>
               <Text as="p">{data}</Text>
            </Flex>
         </Flex>
      </StyledCard>
   )
}
export default StyleCard
