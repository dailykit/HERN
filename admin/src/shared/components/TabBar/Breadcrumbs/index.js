import React from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { ForwardIcon } from '../../../assets/icons'

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
         <Styles.Crumb
            onClick={() => history.push('/')}
            isHome={true}
            title={'Home'}
         >
            Home{' '}
            {routes.length >= 1 && (
               <>
                  &nbsp;
                  <ForwardIcon />
               </>
            )}
         </Styles.Crumb>

         {routes.map((route, index) => (
            <Styles.Crumb
               onClick={() => history.push(route.path)}
               key={`${route.path}-${route.title}`}
            >
               <p
                  title={route.title}
                  style={{
                     textAlign: 'left',
                     overflow: routes.length - 1 == index ? 'hidden' : 'auto',
                     whiteSpace:
                        routes.length - 1 == index ? 'nowrap' : 'normal',
                     textOverflow:
                        routes.length - 1 == index ? 'ellipsis' : 'unset',
                     width: routes.length - 1 == index ? '100px' : 'auto',
                  }}
               ></p>

               {route.title}
               {routes.length - 1 !== index && (
                  <>
                     &nbsp;
                     <ForwardIcon />
                  </>
               )}
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
      }
   `,
   Crumb: styled.button`
      display: flex;
      align-items: center;
      font-size: 12px;
      border: none;
      outline: none;
      color: #919699;
      font-weight: 500;
      text-transform: capitalize;
      background: White;
      padding: 2px 0px 2px 3px;

      &:last-child {
         color: #367bf5;
      }
      &:hover {
         color: #555b6e;
      }
   `,
}
