import styled from 'styled-components'
import { Flex } from '@dailykit/ui'

export const Image = styled.img`
   width: 300px;
   height: auto;
   margin: 8px 0;
`

export const InstructionSetContainer = styled(Flex)`
   border: 1px solid #cacaca;
   border-radius: 4px;
   margin-bottom: 32px;
`

export const ImageWrapper = styled.div`
   width: 400px;
   height: 220px;
   position: relative;

   > div {
      position: absolute;
      display: flex;
      top: 4px;
      right: 4px;
   }

   img {
      width: 400px;
      height: 220px;
      object-fit: cover;
   }
`
