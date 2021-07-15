import React from 'react'
import { Text, Flex } from '@dailykit/ui'
import { StyledCard, ViewTab } from './styled'

const StyleCard = ({ active, heading, click, data }) => {
   return (
      <StyledCard active={active === heading}>
         <Flex container justifyContent="space-between" padding="16px">
            <Text as="p">Subscription</Text>
            <ViewTab onClick={click}>view</ViewTab>
         </Flex>
         <Flex
            container
            justifyContent="space-between"
            padding="16px"
            className="cardContent"
         >
            <Flex container flexDirection="column">
               <Text as="p">Total Skipped</Text>
               <Text as="p">{data?.skipped?.aggregate?.count || '0'}</Text>
            </Flex>
            <Flex container flexDirection="column">
               <Text as="p">Total Orders</Text>
               <Text as="p">{data?.ordered?.aggregate?.count || '0'}</Text>
            </Flex>
         </Flex>
      </StyledCard>
   )
}
export default StyleCard
