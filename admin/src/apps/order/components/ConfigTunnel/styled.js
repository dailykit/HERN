import styled from 'styled-components'

export const Main = styled.main`
   overflow: hidden;
   display: grid;
   grid-template-columns: 240px 1fr;
`

export const Sidebar = styled.aside`
   padding: 6px;
   border-radius: 2px;
   background: #d9e9f1;
   margin: 0 0 14px 14px;
   li {
      list-style: none;
      margin-bottom: 4px;
   }
   a {
      height: 40px;
      display: flex;
      padding: 0 12px;
      align-items: center;
      border-radius: 2px;
      text-decoration: none;
      :hover,
      &.active {
         color: #fff;
         background: #1bb9f0;
      }
   }
`

export const Content = styled.main`
   padding: 16px;
   overflow-y: auto;
   scroll-behavior: smooth;
   height: calc(100vh - 104px);
   section {
      + section {
         margin-top: 24px;
      }
      > span {
         margin-bottom: 16px;
      }
      > div {
         width: 100%;
         max-width: 560px;
         + div {
            margin-top: 24px;
         }
      }
   }
`
