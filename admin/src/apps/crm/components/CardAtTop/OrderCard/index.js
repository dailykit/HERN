import React from 'react'
import { Text, Flex } from '@dailykit/ui'
import { StyledCard, ViewTab } from './styled'
import { currencyFmt } from '../../../../../shared/utils'

const StyleCard = ({ active, heading, click, data }) => {
   return (
      <StyledCard active={active === heading}>
         <Flex container justifyContent="space-between" padding="16px">
            <Text as="p">Orders</Text>
            <ViewTab onClick={click}>view</ViewTab>
         </Flex>
         <Flex
            container
            justifyContent="space-between"
            padding="16px"
            className="cardContent"
         >
            <Flex container flexDirection="column">
               <Text as="p">Total Amount</Text>
               <Text as="p">{currencyFmt(data?.sum?.amountPaid || 0)}</Text>
            </Flex>
            <Flex container flexDirection="column">
               <Text as="p">Total Orders</Text>
               <Text as="p">{data?.count || 0}</Text>
            </Flex>
         </Flex>
      </StyledCard>
   )
}
export default StyleCard
