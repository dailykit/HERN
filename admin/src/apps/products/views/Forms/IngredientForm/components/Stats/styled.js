import styled from 'styled-components'
import { Flex } from '@dailykit/ui'

export const ImageContainer = styled.div`
   width: 464px;
   height: 128px;
   position: relative;
   img {
      width: 464px;
      height: 128px;
      object-fit: auto;
   }
   div {
      position: absolute;
      padding: 12px;
      right: 0;
      left: 0;
      text-align: right;
      background: linear-gradient(to bottom, #111, transparent);
      span {
         margin-right: 16px;
         cursor: pointer;
      }
   }
`
export const ResponsiveFlex = styled(Flex)`
   @media screen and (max-width: 767px) {
      flex-direction: column;
   }
`
