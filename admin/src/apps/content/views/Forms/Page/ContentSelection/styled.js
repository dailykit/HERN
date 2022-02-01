import { ListOptions, HorizontalTabPanel } from '@dailykit/ui'
import styled from 'styled-components'

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
      ::-webkit-scrollbar {
         width: 6px;
      }
      ::-webkit-scrollbar-track {
         background: #f4f4f4;
      }
      ::-webkit-scrollbar-thumb {
         background: #919699;
         opacity: 0.5;
         border-radius: 20px;
      }
      ::-webkit-scrollbar-thumb:hover {
         background: #919699;
      }
   `,
   ConfigWrapper: styled.div`
      width: 30%;
      height: calc(100% - 16px);
      overflow-y: auto;
      ::-webkit-scrollbar {
         width: 6px;
      }
      ::-webkit-scrollbar-track {
         background: #f4f4f4;
      }
      ::-webkit-scrollbar-thumb {
         background: #919699;
         opacity: 0.5;
         border-radius: 20px;
      }
      ::-webkit-scrollbar-thumb:hover {
         background: #919699;
      }
   `,
   LinkWrapper: styled.div`
      height: 100%;
      overflow: scroll;
      padding: 16px;
      align-items: center;
      ::-webkit-scrollbar {
         display: none;
      }
   `
}
export const StyledOptions = styled(ListOptions)`
   display: grid;
   grid-gap: 5px;
   grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
   grid-auto-rows: 120px;
   margin-top: 8px;
`
export const StyledHorizontalTabPanel = styled(HorizontalTabPanel)`
   ::-webkit-scrollbar {
      width: 6px;
   }
   ::-webkit-scrollbar-track {
      background: #f4f4f4;
   }
   ::-webkit-scrollbar-thumb {
      background: #919699;
      opacity: 0.5;
      border-radius: 20px;
   }
   ::-webkit-scrollbar-thumb:hover {
      background: #919699;
   }
`
