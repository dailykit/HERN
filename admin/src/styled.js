import styled from 'styled-components'

export const Layout = styled.div`
   height: 100vh;
   > main {
      position: absolute;
      left: 52px;
      top: 52px;
      height: calc(100% - 48px);
      overflow-y: auto;
      width: 96%;
   }
`

export const AppList = styled.ul`
   position: absolute;
   top: 71px;
   background: #ffffff;
   display: grid;
   margin-left: 1px !important;
   margin: 8px;
   grid-gap: 5px;
   width: 52px;
   overflow-y: auto;
   overflow-x: hidden;
   height: calc(100vh - 60px);
   grid-template-rows: repeat(auto-fill, minmax(40px, 1fr));
   &::-webkit-scrollbar {
      width: 5px;
   }
   &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
   }
   &::-webkit-scrollbar-thumb {
      background-color: #787a91;
      outline: 1px solid #eeeeee;
      border-radius: 10px;
   }
   // :hover {
   //    position: absolute;
   //    width: 222px;
   //    z-index: 1;
   // }
`
export const AppIcon = styled.svg`
   height: 16px;
   width: 16px;
`
export const AppItem = styled.li`
   height: 40px;
   list-style: none;
   margin: 0px 0px;
   background: ${props => (props.active ? `#f9f9f9` : `#ffffff`)};
   border-left: ${props => (props.active ? `3px solid #367BF5` : `none`)};
   a {
      color: ${props => (props.active ? `#367BF5` : `#202020`)};
      height: 100%;
      display: flex;
      padding: ${props => (props.active ? `15px` : `18px`)};
      border-radius: 4px;
      align-items: center;
      text-decoration: none;
      font-weight: 500;
      font-size: 16px;
      line-height: 19px;
      :hover {
         background: #f9f9f9;
         border-radius: 4px;
         color: ${props => (props.active ? `#367BF5` : `#202020`)};
      }
      svg {
         margin-right: 19px;
         display: inline-block;
      }
   }
`
export const InsightDiv = styled.div`
   padding: 1rem;
`
export const HomeContainer = styled.div`
   display: flex;
   width: 100%
   height: calc(100vh - 60px);
`
export const DashboardPanel = styled.div`
   width: 75%;
   overflow-y: auto;
   padding: 0px 10px 0px 12px;
   &::-webkit-scrollbar {
      width: 5px;
   }
   &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
   }
   &::-webkit-scrollbar-thumb {
      background-color: #787a91;
      outline: 1px solid #eeeeee;
      border-radius: 10px;
   }
`
export const DashboardRight = styled.div`
   width: 25%;
   overflow-y: auto;
   padding: 0px 7px;
   &::-webkit-scrollbar {
      width: 5px;
   }
   &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
   }
   &::-webkit-scrollbar-thumb {
      background-color: #787a91;
      outline: 1px solid #eeeeee;
      border-radius: 10px;
   }
`
export const NavMenuPanel = styled.div`
   width: 52px;
`
export const WelcomeNote = styled.div`
   p {
      font-weight: bold;
      font-size: 30px;
      line-height: 30px;
      letter-spacing: 0.44px;
      color: #367bf5;
      margin-bottom: 22px;
      span {
         width: 24px;
         height: 24px;
         margin-right: 7px;
      }
   }
`
