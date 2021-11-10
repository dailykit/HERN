import { ListOptions } from '@dailykit/ui'
import styled from 'styled-components'

export const WrapDiv = styled.div`
   margin: 0;
   width: 60%;
   padding: 16px;
`

export const StyledWrapper = styled.div`
   margin: 0;
   width: 40%;
   padding: 16px;
   height: 500px;

   h1 {
      color: #555b6e;
      font-size: 20px;
      font-weight: 500;
      line-height: 23px;
   }
`

export const InputWrapper = styled.div`
   background-color: #ffffff;
   padding: 32px 32px 0 32px;
`
export const StyledComp = styled.div`
   padding: 32px;
   background-color: #e5e5e5;
   .pageDetails {
      height: max-content;
      width: 100%;
   }
`
export const StyledInsight = styled.div`
   margin-left: 26px;
   padding-left: 16px;
   background: #fff;
   width: 100%;
   height: inherit;
   max-width: 897.2px;
   max-height: 620px;
   overflow: auto;
   box-sizing: border-box;
`

export const StyledDiv = styled.div`
   padding: 0;
   background-color: #ffffff;
   .styleTab {
      margin-bottom: 16px;
      padding-left: 32px;
   }
   #tabs--1--panel--0 {
      padding: 0;
   }
   #tabs--1--panel--1 {
      padding: 0;
   }
`
export const Highlight = styled.p`
   color: #00a7e1;
   cursor: pointer;
   &:hover {
      text-decoration: underline;
   }
`
export const Child = styled.div`
   display: flex;
   flex-direction: row;
   align-items: center;
   justify-content: space-between;
   background: #ffffff;
   border: 1px solid #f3f3f3;
   border: ${({ isActive }) =>
      isActive ? '2px solid #367BF5' : '1px solid #f3f3f3'};
   box-sizing: border-box;
   box-shadow: 2px 3px 6px rgba(0, 0, 0, 0.13);
   color: #555b6e;
   width: 100%;
   font-size: 16px;
   border-radius: 2px;
   padding: 6px;
   margin-bottom: 10px;
   &:hover {
      box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
   }
   .name {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
   }
`
export const Styles = {
   Wrapper: styled.div`
      display: flex;
      background: #f9f9f9;
      height: 480px;
   `,
   ModulesWrapper: styled.div`
      width: 25%;
      height: 100%;
   `,
   Tabs: styled.div`
      height: calc(100% - 80px);
   `,
   PreviewWrapper: styled.div`
      background: #fff;
      border-radius: 4px;
      width: 45%;
      margin: 8px;
      padding: 16px 20px;
      height: calc(100% - 16px);
      overflow-y: auto;
      /* width */
      ::-webkit-scrollbar {
         width: 6px;
      }

      /* Track */
      ::-webkit-scrollbar-track {
         background: #f4f4f4;
      }

      /* Handle */
      ::-webkit-scrollbar-thumb {
         background: #919699;
         opacity: 0.5;
         border-radius: 20px;
      }

      /* Handle on hover */
      ::-webkit-scrollbar-thumb:hover {
         background: #919699;
      }
   `,
   ConfigWrapper: styled.div`
      width: 30%;
      height: calc(100% - 16px);
      overflow-y: auto;
      /* width */
      ::-webkit-scrollbar {
         width: 6px;
      }

      /* Track */
      ::-webkit-scrollbar-track {
         background: #f4f4f4;
      }

      /* Handle */
      ::-webkit-scrollbar-thumb {
         background: #919699;
         opacity: 0.5;
         border-radius: 20px;
      }

      /* Handle on hover */
      ::-webkit-scrollbar-thumb:hover {
         background: #919699;
      }
   `,
}
export const StyledOptions = styled(ListOptions)`
   display: grid;
   grid-gap: 5px;
   grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
   grid-auto-rows: 120px;
   margin-top: 8px;
`
