// import { ListOptions, HorizontalTabPanel } from '@dailykit/ui'
import styled from 'styled-components'

export const Child = styled.div`
   display: flex;
   flex-direction: row;
   align-items: center;
   justify-content: space-between;
   background: #ffffff;
   cursor: pointer;
   border: 1px solid #f3f3f3;
   border: 1px solid #f3f3f3;
   box-sizing: border-box;
   color: #555b6e;
   width: 100%;
   font-size: 16px;
   border-radius: 2px;
   margin-bottom: 3px;
   &:hover {
      border-left: 2px solid #367bf5;
      box-shadow: 0px 0.5px 2px rgba(0, 0, 0, 0.1);
      background: #f9f9f9;
   }
   .identifier_name {
      padding: 9px 12px;
      width: 100%;
      font-weight: 500;
      color: #555b6e;
      letter-spacing: 0.44px;
   }
   .identifier_name:focus,
   .identifier_name:active {
      color: #367bf5;
   }
   .active-link {
      border-left: 2px solid #367bf5;
      background: #f9f9f9;
   }
`
export const Styles = {
   Wrapper: styled.div`
      display: flex;
      background: #f9f9f9;
      height: 69vh;
      .ant-input-group-wrapper {
         margin: 1rem 0 -1rem 0 !important;
      }
   `,
   SettingsWrapper: styled.div`
      width: 20%;
      padding: 16px;
      align-items: center;
      .settings_wrapper{
         overflow: scroll;
    height: 50vh;
    overflow-x:hidden;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: #f4f4f4;
    }
    &::-webkit-scrollbar-thumb {
      background: #919699;
      opacity: 0.5;
      border-radius: 20px;
    }
      }
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
      margin: 16px 8px;
      padding: 16px 20px;
      height: 67vh;
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
      width: 25%;
      height: 100%;
      overflow: scroll;
      padding: 16px;
      text-align: center;
      align-items: center;
      ::-webkit-scrollbar {
         display: none;
      }
   `,
}

export const CollapsibleWrapper = styled.div`
   background: #f9f9f9;
   > .nav_child {
      background: #f9f9f9;
      :hover {
         background: #fff;
      }
   }
   button {
      border-radius: 15px;
      width: 22px;
      height: 22px;
      :hover {
         background: #f3f3f3;
      }
   }
`
