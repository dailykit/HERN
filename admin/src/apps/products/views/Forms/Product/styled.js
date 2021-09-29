import { Flex } from '@dailykit/ui'
import styled from 'styled-components'

export const Content = styled.div`
   display: flex;
`

export const Flexible = styled.div`
   flex: ${({ width }) => width};
`

export const ItemTab = styled.div`
   border-bottom: ${({ active }) => (active ? `3px solid #00a7e1` : 0)};
   margin: 0px 15px;
   min-width: 58px;
   text-align: center;
   cursor: pointer;
`

export const RecipeButton = styled.button`
   border: 0;
   outline: 0;
   width: 100%;
   display: flex;
   padding: 10px;
   justify-content: flex-start;
   align-items: center;
   background-color: ${props => (props.active ? '#555b6e' : '#e5e5e5')};
   color: ${props => (props.active ? '#fff' : '#555b6e')};
`

export const TabContainer = styled.div`
   display: flex;
   border-bottom: 1px solid rgba(136, 141, 157, 0.3);
   margin: 10px 0;
`

export const CustomCrossButton = styled.button`
   border: 0;
   outline: 0;
   font-size: 1rem;
   background-color: #f2f1f3;
   margin-left: 10px;
   color: #555b6e;
   &:hover {
      color: rgb(255, 90, 82);
      cursor: pointer;
   }
`

export const StyledHeader = styled.div`
   height: 100px;
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 0 32px;
`

export const StyledBody = styled.div`
   background: #e5e5e5;
   min-height: calc(100vh - 140px);
`

export const StyledRule = styled.hr`
   color: #e8e8e8;
`

export const StyledMeta = styled.div`
   display: flex;

   > div {
      &:nth-child(1) {
         flex: 2;
      }
      &:nth-child(2) {
         flex: 1;
      }
   }
`
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
