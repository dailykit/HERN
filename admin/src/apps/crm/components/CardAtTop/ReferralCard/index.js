import React from 'react'
import { Text, Flex } from '@dailykit/ui'
import { StyledCard, ViewTab } from './styled'
const StyleCard = ({ active, heading, click, referralCount, signUpCount }) => {
   return (
      <StyledCard active={active === heading}>
         <Flex container justifyContent="space-between" padding="16px">
            <Text as="p">Referrals</Text>
            <ViewTab onClick={click}>view</ViewTab>
         </Flex>
         <Flex
            container
            justifyContent="space-between"
            padding="16px"
            className="cardContent"
         >
            <Flex container flexDirection="column">
               <Text as="p">Customers Referred</Text>
               <Text as="p">{referralCount}</Text>
            </Flex>
            <Flex container flexDirection="column">
               <Text as="p">Total Signup</Text>
               <Text as="p">{signUpCount}</Text>
            </Flex>
         </Flex>
      </StyledCard>
   )
}
export default StyleCard
