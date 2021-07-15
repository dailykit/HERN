import React from 'react'
import { Text, Flex } from '@dailykit/ui'
import { StyledCard, ViewTab } from './styled'
import { currencyFmt } from '../../../../../shared/utils'

const StyleCard = ({ active, heading, click, data }) => {
   return (
      <StyledCard active={active === heading}>
         <Flex container justifyContent="space-between" padding="16px">
            <Text as="p">Wallet</Text>
            <ViewTab onClick={click}>view</ViewTab>
         </Flex>
         <Flex container padding="16px" className="cardContent">
            <Flex container flexDirection="column">
               <Text as="p">Total Wallet Amount</Text>
               <Text as="p">{currencyFmt(data ?? 0)}</Text>
            </Flex>
         </Flex>
      </StyledCard>
   )
}
export default StyleCard
