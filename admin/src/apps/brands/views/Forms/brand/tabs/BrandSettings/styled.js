// import { ListOptions, HorizontalTabPanel } from '@dailykit/ui'
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
   width: 80%;
   font-size: 16px;
   border-radius: 2px;
   padding: 6px;
   margin-bottom: 10px;
   &:hover {
      box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
   }
   .identifier_name{
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
   SettingsWrapper: styled.div`
      width: 30%;
      height: 100%;
      overflow:scroll;
      padding:16px;
      text-align:center;
      align-items:center;
      ::-webkit-scrollbar {
         display: none;
     }
   `,
   Tabs: styled.div`
      height: calc(100% - 80px);
   `,
   SettingWrapper: styled.div`
      background: #fff;
      border-radius: 4px;
      width: 60%;
      height: 100%;
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
   `
}

