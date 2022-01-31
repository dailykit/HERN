import { Flex } from '@dailykit/ui'
import styled from 'styled-components'

export const ResponsiveFlex = styled.header`
   display: flex;
   padding: 16px 35px;
   align-items: center;
   justify-content: flex-end;

   @media screen and (max-width: 767px) {
      flex-direction: column;
      align-items: start;
      input[type='text'] {
         width: calc(100vw - 64px);
      }
      section {
         margin-bottom: 8px;
      }
   }
`
export const StyledFlex = styled(Flex)`
   @media screen and (max-width: 767px) {
      flex-direction: column;
      button {
         margin-bottom: 16px;
      }
   }
`
