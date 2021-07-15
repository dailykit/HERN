import React from 'react'
import { Text } from '@dailykit/ui'
import { Route } from 'react-router-dom'

// Views
import { useAccess } from '../../../../shared/providers'
import { ErrorBoundary, Flex } from '../../../../shared/components'
import { Home, AddOnMenu, Menu, Subscriptions, Subscription } from '../../views'

const Main = () => {
   return (
      <>
         <Route path="/subscription" exact>
            <AccessCheck
               title="home"
               message="You do not have sufficient permission to see subscription app."
            >
               <Home />
            </AccessCheck>
         </Route>
         <Route path="/subscription/menu" exact>
            <AccessCheck
               title="menu"
               message="You do not have sufficient permission to see menu page."
            >
               <Menu />
            </AccessCheck>
         </Route>
         <Route path="/subscription/addon-menu" exact>
            <AddOnMenu />
         </Route>
         <Route path="/subscription/subscriptions" exact>
            <AccessCheck
               title="subscriptions"
               message="You do not have sufficient permission to see subscription listing."
            >
               <Subscriptions />
            </AccessCheck>
         </Route>
         <Route path="/subscription/subscriptions/:id" exact>
            <AccessCheck
               title="subscription"
               message="You do not have sufficient permission to see subscription details."
            >
               <Subscription />
            </AccessCheck>
         </Route>
      </>
   )
}

export default Main

const AccessCheck = ({ title, children, message }) => {
   const { canAccessRoute, accessPermission } = useAccess()
   return canAccessRoute(title) ? (
      <ErrorBoundary rootRoute="/apps/subscription">{children}</ErrorBoundary>
   ) : (
      <Flex container height="100%" alignItems="center" justifyContent="center">
         <Text as="title">
            {accessPermission('ROUTE_READ', title)?.fallbackMessage || message}
         </Text>
      </Flex>
   )
}
