import { Flex } from '@dailykit/ui'
import styled from 'styled-components'

export const StyledWrapper = styled.div`
   margin: 0 auto;
   max-width: 1280px;
   h1 {
      color: #555b6e;
      font-size: 20px;
      font-weight: 500;
      line-height: 23px;
   }
   @media screen and (max-width: 767px) {
      width: calc(100vw - 32px);
   }
   @media screen and (min-width: 768px) {
      width: calc(100vw - 64px);
   }
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

export const StyledTableHeader = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin: 0 auto;
   padding: 16px 0;
`

export const StyledTableActions = styled.div`
   display: grid;
   grid-auto-flow: column;
   grid-gap: 16px;
`
export const StyledContent = styled.div`
   margin-top: 32px;
`

export const StyledPagination = styled.div`
   color: 555b6e;
   font-size: 14px;
   span {
      margin-left: 8px;
      cursor: pointer;
   }
`

export const CellColumnContainer = styled.div`
   width: 100%;
   display: flex;
   flex-direction: column;
`

export const OnHandData = styled.span`
   color: ${({ alert, alertAndSuccess }) => {
      if (alert) return '#FF5A52'
      if (alertAndSuccess) return '#53C22B'
      return '#888D9D'
   }};
`
export const SolidTile = styled.button`
   width: 100%;
   display: block;
   margin: 0 auto;
   border: 1px solid #cecece;
   padding: 10px 20px;
   border-radius: 2px;
   background-color: #fff;

   &:hover {
      background-color: #f3f3f3;
      cursor: pointer;
   }
`
export const ResponsiveFlex = styled(Flex)`
   @media screen and (max-width: 767px) {
      width: calc(100vw - 32px);
   }
   @media screen and (min-width: 768px) {
      width: calc(100vw - 64px);
   }
`
