// import { ListOptions, HorizontalTabPanel } from '@dailykit/ui'
import styled from 'styled-components'

export const Child = styled.div`
   display: flex;
   flex-direction: row;
   align-items: center;
   justify-content: space-between;
   background: #ffffff;
   cursor:pointer;
   border: 1px solid #f3f3f3;
   border: ${({ isActive }) =>
      isActive ? '2px solid #367BF5' : '1px solid #f3f3f3'};
   box-sizing: border-box;
   color: #555b6e;
   width: 100%;
   font-size: 16px;
   border-radius: 2px;
   margin-bottom: 3px;
   &:hover {
      border-left:2px solid #367BF5;
      box-shadow: 0px 0.5px 2px rgba(0, 0, 0, 0.1);
      background: #F9F9F9;
   }
   .identifier_name{
      padding: 9px 12px;
      width: 100%;
      font-weight: 500;
      color: #555B6E;
      letter-spacing: 0.44px;
  }
   .identifier_name:focus,.identifier_name:active{
      color:#367BF5
   }
   .active-link{
      border-left:2px solid #367BF5;
      color:#367BF5;
      box-shadow: 0px 0.5px 2px rgba(0, 0, 0, 0.1);
      background: #F9F9F9;
   }
  
`
export const Styles = {
   Wrapper: styled.div`
      display: flex;
      background: #f9f9f9;
      height: 480px;
   `,
   SettingsWrapper: styled.div`
      width: 20%;
      height: 100%;
      overflow:scroll;
      padding:16px;
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
      width: 55%;
      height: 100%;
      margin: 16px 8px;
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
   ` , LinkWrapper: styled.div`
   width: 25%;
   height: 100%;
   overflow:scroll;
   padding:16px;
   text-align:center;
   align-items:center;
   ::-webkit-scrollbar {
      display: none;
  }
`,
}

export const CollapsibleWrapper = styled.div`
background: #F9F9F9;
>div{
   background: #F9F9F9;
   :hover{
      background: #fff;
   }
}
button{
   border-radius: 15px;
   width: 22px;
   height: 22px;
   :hover{
      background: #F3F3F3;
   }
}
`