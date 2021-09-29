import styled from 'styled-components'

export const Layout = styled.div`
   height: 100vh;
   > main {
      height: calc(100% - 48px);
      overflow-y: auto;
   }
`

export const AppList = styled.ul`
   display: grid;
   margin: 0 !important;
   grid-gap: 12px;
   width: 236px;
   overflow-y: auto;
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
`

export const AppItem = styled.li`
   height: 48px;
   list-style: none;
   margin: 0px 12px;
   a {
      width: 100%;
      color: #2f256f;
      height: 100%;
      display: flex;
      padding: 0 8px;
      border-radius: 2px;
      align-items: center;
      text-decoration: none;
      transition: 0.4s ease-in-out;
      font-weight: 500;
      font-size: 16px;
      color: #202020;
      line-height: 16px;
      :hover {
         background: #f2f2f2;
      }
      img {
         height: 32px;
         width: 32px;
         margin-right: 14px;
         display: inline-block;
      }
   }
`
export const InsightDiv = styled.div`
   padding: 1rem;
`
export const HomeContainer = styled.div`
   display: flex;
   height: calc(100vh - 60px);
`
export const DashboardPanel = styled.div`
   width: calc(100vw - 222px);
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
   width: 236px;
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
