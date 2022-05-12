import React from 'react'
import { Text } from '@dailykit/ui'
import { Route } from 'react-router-dom'

// Views
import {
   Home,
   AppsListing,
   RolesListing,
   UsersListing,
   DevicesListing,
   UserForm,
   RoleForm,
   MasterListForm,
   StationsListing,
   StationForm,
   MasterList,
} from '../../views'
import { useAccess } from '../../../../shared/providers'
import { ErrorBoundary, Flex } from '../../../../shared/components'
import { EnvsList, MarketPlace } from '../../views/Listings'

const Main = () => {
   return (
      <>
         <Route path="/settings" exact>
            <AccessCheck
               title="home"
               message="You do not have sufficient permission to see settings app."
            >
               <Home />
            </AccessCheck>
         </Route>
         <Route path="/settings/apps" exact>
            <AccessCheck
               title="apps"
               message="You do not have sufficient permission to see apps listing."
            >
               <AppsListing />
            </AccessCheck>
         </Route>
         <Route path="/settings/users" exact>
            <AccessCheck
               title="users"
               message="You do not have sufficient permission to see users listing."
            >
               <UsersListing />
            </AccessCheck>
         </Route>
         <Route path="/settings/users/:id">
            <AccessCheck
               title="user"
               message="You do not have sufficient permission to see user details."
            >
               <UserForm />
            </AccessCheck>
         </Route>
         <Route path="/settings/roles" exact>
            <RolesListing />
         </Route>
         <Route path="/settings/roles/:id">
            <RoleForm />
         </Route>
         <Route path="/settings/devices" exact>
            <AccessCheck
               title="devices"
               message="You do not have sufficient permission to see devices listing."
            >
               <DevicesListing />
            </AccessCheck>
         </Route>
         <Route path="/settings/stations" exact>
            <AccessCheck
               title="stations"
               message="You do not have sufficient permission to see stations listing."
            >
               <StationsListing />
            </AccessCheck>
         </Route>
         <Route path="/settings/stations/:id">
            <AccessCheck
               title="station"
               message="You do not have sufficient permission to see station details."
            >
               <StationForm />
            </AccessCheck>
         </Route>
         <Route path="/settings/master-lists" exact>
            <AccessCheck
               title="master-lists"
               message="You do not have sufficient permission to see master listing."
            >
               <MasterList />
            </AccessCheck>
         </Route>
         <Route path="/settings/master-lists/:list">
            <AccessCheck
               title="master-list"
               message="You do not have sufficient permission to see master list details"
            >
               <MasterListForm />
            </AccessCheck>
         </Route>
         <Route path="/settings/marketplace" exact>
            <AccessCheck
               title="marketplace"
               message="You do not have sufficient permission to see market place."
            >
               <MarketPlace />
            </AccessCheck>
         </Route>
         <Route path="/settings/envs" exact>
            <AccessCheck
               title="envs"
               message="You do not have sufficient permission to see envs list."
            >
               <EnvsList />
            </AccessCheck>
         </Route>
      </>
   )
}

export default Main

const AccessCheck = ({ title, children, message }) => {
   const { canAccessRoute, accessPermission } = useAccess()
   return canAccessRoute(title) ? (
      <ErrorBoundary rootRoute="/apps/settings">{children}</ErrorBoundary>
   ) : (
      <Flex container height="100%" alignItems="center" justifyContent="center">
         <Text as="title">
            {accessPermission('ROUTE_READ', title)?.fallbackMessage || message}
         </Text>
      </Flex>
   )
}
