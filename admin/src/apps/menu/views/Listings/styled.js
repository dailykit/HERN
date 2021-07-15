import styled from 'styled-components'
import { Flex } from '@dailykit/ui'
export const StyledWrapper = styled.div`
   margin: 0 auto;
   max-width: 1280px;
   margin-bottom: 80px;
   h1 {
      color: #555b6e;
      font-size: 20px;
      font-weight: 500;
      line-height: 23px;
   }
   table {
      width: 980px;
      margin: 0 auto;
   }
`

export const StyledHeader = styled.div`
   height: 80px;
   display: flex;
   align-items: center;
   justify-content: space-between;
`

export const StyledIconGroup = styled.div`
   display: flex;
   > div {
      margin-right: 4px;
   }
`

export const StyledIcon = styled.div`
   width: 32px;
   height: 32px;
   border-radius: 4px;
   background: rgba(40, 193, 247, 0.48);
`

export const Spacer = styled.div`
   height: 32px;
`

export const GridContainer = styled.div`
   display: grid;
   grid-template-columns: repeat(2, 1fr);
   grid-gap: 8px;
`
export const Flexible = styled.div`
   display: flex;
`

export const ResponsiveFlex = styled(Flex)`
   @media screen and (max-width: 767px) {
      width: calc(100vw - 32px);
   }
   @media screen and (min-width: 768px) {
      width: calc(100vw - 64px);
   }
`
