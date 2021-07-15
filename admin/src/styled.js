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
   margin: 0 auto;
   grid-gap: 16px;
   max-width: 1180px;
   padding-top: 16px;
   width: calc(100vw - 40px);
   grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
`

export const AppItem = styled.li`
   height: 48px;
   list-style: none;
   a {
      width: 100%;
      color: #2f256f;
      height: 100%;
      display: flex;
      padding: 0 14px;
      border-radius: 2px;
      align-items: center;
      border: 1px solid #e0e0e0;
      text-decoration: none;
      transition: 0.4s ease-in-out;
      :hover {
         background: #f8f8f8;
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
