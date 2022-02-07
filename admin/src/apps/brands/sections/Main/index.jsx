import React from 'react'
import { Text } from '@dailykit/ui'
import { Switch, Route } from 'react-router-dom'

// Views
import { Home, Brands, Brand, Locations, Location } from '../../views'
import { Flex } from '../../../../shared/components'
import { useAccess } from '../../../../shared/providers'
export default function Main() {
   return (
      <main>
         <Switch>
            <Route path="/brands" exact>
               <AccessCheck
                  title="home"
                  message="You do not have sufficient permission to access brands app."
               >
                  <Home />
               </AccessCheck>
            </Route>
            <Route path="/brands/brands" exact>
               <AccessCheck
                  title="brands"
                  message="You do not have sufficient permission to access brands listing."
               >
                  <Brands />
               </AccessCheck>
            </Route>
            <Route path="/brands/locations" exact>
               <AccessCheck
                  title="locations"
                  message="You do not have sufficient permission to access locations listing."
               >
                  <Locations />
               </AccessCheck>
            </Route>
            <Route path="/brands/brands/:id" exact>
               <AccessCheck
                  title="brand"
                  message="You do not have sufficient permission to access brand details."
               >
                  <Brand />
               </AccessCheck>
            </Route>
            <Route path="/brands/locations/:id" exact>
               <AccessCheck
                  title="location"
                  message="You do not have sufficient permission to access location details."
               >
                  <Location />
               </AccessCheck>
            </Route>
         </Switch>
      </main>
   )
}

const AccessCheck = ({ title, children, message }) => {
   const { canAccessRoute, accessPermission } = useAccess()
   return canAccessRoute(title) ? (
      children
   ) : (
      <Flex container height="100%" alignItems="center" justifyContent="center">
         <Text as="title">
            {accessPermission('ROUTE_READ', title)?.fallbackMessage || message}
         </Text>
      </Flex>
   )
}
