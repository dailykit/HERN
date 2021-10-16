import React from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import styled from 'styled-components'

const Breadcrumbs = () => {
   const { pathname } = useLocation()
   const history = useHistory()

   const crumbs = pathname.split('/').filter(part => part.length > 0)

   const getRoutes = () => {
      let str = ''
      const routes = []
      const appName = crumbs[0]

      for (let i = 0; i < crumbs.length; i += 1) {
         /*
         content apps double query params
         /conetent/pages/:id/:pagename
         */
         if (appName === 'content' && i >= 2) {
            routes.push({
               title: crumbs[i],
               path: `/content/pages/${crumbs[2]}/${crumbs[3]}`,
            })
            break
         } else {
            routes.push({ title: crumbs[i], path: (str += `/${crumbs[i]}`) })
         }
      }

      return routes
   }
   const routes = getRoutes()
   return (
      <Styles.Wrapper>
         <Styles.Crumb onClick={() => history.push('/')} isHome={true}>
            Home
         </Styles.Crumb>
         {routes.map(route => (
            <Styles.Crumb onClick={() => history.push(route.path)}>
               {route.title}
            </Styles.Crumb>
         ))}
      </Styles.Wrapper>
   )
}

export default Breadcrumbs
const Styles = {
   Wrapper: styled.div`
      display: flex;
      align-items: center;
      margin: 12px auto;
      float: none;
      max-width: 1280px;
      width: calc(100vw - 130px);
      filter: drop-shadow(1px 0px 0px #f3f3f3) drop-shadow(0px 0px 0px #f3f3f3)
         drop-shadow(0px 0px 0px #f3f3f3) drop-shadow(0px 1px 0px #f3f3f3)
         drop-shadow(1px 1px 0px #f3f3f3) drop-shadow(-1px -1px 0px #f3f3f3)
         drop-shadow(-1px 1px 0px #f3f3f3) drop-shadow(1px -1px 0px #f3f3f3);
   `,
   Crumb: styled.button`
      display: flex;
      align-items: center;
      font-size: 12px;
      border: none;
      outline: none;
      color: #555b6e;
      font-weight: 500;
      text-transform: capitalize;
      background: White;
      padding: ${({ isHome }) =>
         isHome ? '2px 12px 2px 4px' : '2px 12px 2px 14px'};
      width: 100px;
      clip-path: ${({ isHome }) =>
         isHome
            ? ` polygon(
      calc(100% - 16px) 0%,
      0 0,
      0 100%,
      calc(100% - 16px) 100%,
      100% 50%)`
            : `polygon(80% 0%,100% 50%,80% 100%,0% 100%,15% 50%,0% 0%)`};
      &:last-child {
         color: #367bf5;
         background: #f3f3f3;
      }
      &:hover {
         background: #f3f3f3;
         color: #202020;
      }
   `,
}
