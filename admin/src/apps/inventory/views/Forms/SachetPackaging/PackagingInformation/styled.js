import { Flex } from '@dailykit/ui'
import styled from 'styled-components'

export const Content = styled.div`
   display: flex;
   width: 70%;
   justify-content: space-between;
   align-items: center;

   h4 {
      font-weight: 500;
      font-size: 14px;
      color: #555b6e;
   }
`
export const ResponsiveFlex = styled(Flex)`
   @media only screen and (max-width: 767px) {
      flex-direction: column;
   }
`
