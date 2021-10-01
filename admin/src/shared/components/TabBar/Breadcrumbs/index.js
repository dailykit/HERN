import React from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { ChevronRight } from '../../../assets/icons'

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
         <Styles.Crumb onClick={() => history.push('/')}>
            Home <ChevronRight size={16} color="#919699" />
         </Styles.Crumb>
         {routes.map(route => (
            <Styles.Crumb onClick={() => history.push(route.path)}>
               {route.title} <ChevronRight size={16} color="#919699" />
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
      margin: 4px auto;
      max-width: 1280px;
      width: calc(100vw - 130px);
   `,
   Crumb: styled.button`
      display: flex;
      align-items: center;
      font-size: 12px;
      border: none;
      outline: none;
      color: #919699;
      font-weight: bold;
      text-transform: capitalize;
      padding: 4px 8px;
      background: #f4f4f4;
      &:last-child {
         color: #555b6e;
         > svg {
            color: #555b6e;
         }
      }
   `,
}
