import React from 'react'
import { Text } from '@dailykit/ui'
import { Route } from 'react-router-dom'

import { useAccess } from '../../../../shared/providers'
import { ErrorBoundary, Flex } from '../../../../shared/components'

// Views
import {
   Home,
   CollectionForm,
   CollectionsListing,
   RecurrencesForm,
} from '../../views'

const Main = () => {
   return (
      <>
         <Route exact path="/menu">
            <AccessCheck
               title="home"
               message="You do not have sufficient permission to access menu app."
            >
               <Home />
            </AccessCheck>
         </Route>
         <Route exact path="/menu/collections">
            <AccessCheck
               title="collections"
               message="You do not have sufficient permission to access collections listing."
            >
               <CollectionsListing />
            </AccessCheck>
         </Route>
         <Route path="/menu/collections/:id">
            <AccessCheck
               title="collection"
               message="You do not have sufficient permission to access collection details."
            >
               <CollectionForm />
            </AccessCheck>
         </Route>
         <Route path="/menu/recurrences/:type">
            <AccessCheck
               title="recurrence"
               message="You do not have sufficient permission to see recurrence details."
            >
               <RecurrencesForm />
            </AccessCheck>
         </Route>
      </>
   )
}

export default Main

const AccessCheck = ({ title, children, message }) => {
   const { canAccessRoute, accessPermission } = useAccess()
   return canAccessRoute(title) ? (
      <ErrorBoundary rootRoute="/apps/menu">{children}</ErrorBoundary>
   ) : (
      <Flex container height="100%" alignItems="center" justifyContent="center">
         <Text as="title">
            {accessPermission('ROUTE_READ', title)?.fallbackMessage || message}
         </Text>
      </Flex>
   )
}
