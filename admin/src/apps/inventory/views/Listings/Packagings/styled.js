import { Flex } from '@dailykit/ui'
import styled from 'styled-components'

export const StyledFlex = styled(Flex)`
   padding: 16px 0px;
   @media screen and (max-width: 767px) {
      flex-direction: column;
      align-items: left;
      padding: 0;
      button {
         font-size: 14px;
         margin: 4px 64px;
         text-align: center;
      }
   }
`
export const HeaderFlex = styled(Flex)`
   @media screen and (max-width: 767px) {
      margin-bottom: 16px;
   }
`
