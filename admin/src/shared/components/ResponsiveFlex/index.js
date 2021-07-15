import styled from 'styled-components'
import { Flex } from '@dailykit/ui'

export const ResponsiveFlex = styled(Flex)`
   @media screen and (max-width: 767px) {
      width: calc(100vw - 32px);
   }
   @media screen and (min-width: 768px) {
      width: calc(100vw - 64px);
   }
`
