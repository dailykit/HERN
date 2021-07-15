import React from 'react'
import gql from 'graphql-tag'
import { Flex, IconButton, RoundedCloseIcon } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import Styles from './styled'
import { InlineLoader } from '../InlineLoader'
import { ChevronDown, ChevronUp, RectangularIcon } from '../../assets/icons'
import { useTabs } from '../../providers'
import { has } from 'lodash'

const APPS = gql`
   subscription apps {
      apps(order_by: { id: asc }) {
         id
         title
         icon
         route
      }
   }
`
export const Sidebar = ({ setOpen }) => {
   const { routes, addTab } = useTabs()
   const { loading, data: { apps = [] } = {} } = useSubscription(APPS)
   const [isOpen, setIsOpen] = React.useState(null)

   return (
      <Styles.Sidebar>
         <Styles.Close>
            <IconButton type="ghost" onClick={() => setOpen(false)}>
               <RoundedCloseIcon />
            </IconButton>
         </Styles.Close>
         {loading ? (
            <InlineLoader />
         ) : (
            apps.map(app => (
               <Styles.AppItem key={app.id}>
                  <Flex container alignItems="center">
                     {app.icon ? (
                        <Styles.AppIcon src={app.icon} />
                     ) : (
                        <RectangularIcon />
                     )}
                     <Styles.AppTitle to={app.route}>
                        {app.title}
                     </Styles.AppTitle>

                     {routes[app.title]?.length > 0 && (
                        <Styles.Arrow
                           type="ghost"
                           size="sm"
                           onClick={() =>
                              setIsOpen(
                                 isOpen === null || isOpen !== app.title
                                    ? app.title
                                    : null
                              )
                           }
                           active={
                              isOpen === app.title &&
                              has(routes, app.title) &&
                              routes[app.title].length
                           }
                        >
                           {isOpen === app.title &&
                           has(routes, app.title) &&
                           routes[app.title].length ? (
                              <ChevronUp />
                           ) : (
                              <ChevronDown />
                           )}
                        </Styles.Arrow>
                     )}
                  </Flex>
                  <Styles.Pages>
                     {isOpen === app.title &&
                        has(routes, app.title) &&
                        routes[app.title]?.map(({ title, path }) => (
                           <Styles.PageItem
                              onClick={() => addTab(title, path)}
                              key={path}
                           >
                              <span>{title}</span>
                           </Styles.PageItem>
                        ))}
                  </Styles.Pages>
               </Styles.AppItem>
            ))
         )}
      </Styles.Sidebar>
   )
}
