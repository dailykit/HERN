import React from 'react'

import { ApolloProvider } from '@apollo/react-hooks'
import { ApolloClient } from 'apollo-client'
import { setContext } from 'apollo-link-context'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

import { useAuth } from './auth'
import { get_env } from '../utils'

export const DataProvider = ({ children }) => {
   const { user } = useAuth()
   const isByPassKeycloak = get_env('BYPASS_KEYCLOAK')
   const staffId = isByPassKeycloak === "true" ? '1253dc8d-09d9-4574-aeb8-fed6bb15c9ef' : user?.sub
   const staffEmail = isByPassKeycloak === "true" ? 'test@dailykit.org' : user?.email

   const authLink = setContext((_, { headers }) => {
      return {
         headers: {
            ...headers,
            'Staff-Id': staffId,
            'Staff-Email': staffEmail,
         },
      }
   })

   const wsLink = new WebSocketLink({
      uri: get_env('REACT_APP_DATA_HUB_SUBSCRIPTIONS_URI'),
      options: {
         reconnect: true,
         connectionParams: {
            headers: {
               'Staff-Id': staffId,
               'Staff-Email': staffEmail,
            },
         },
      },
   })

   const httpLink = new HttpLink({
      uri: get_env('REACT_APP_DATA_HUB_URI'),
   })

   const link = split(
      ({ query }) => {
         const definition = getMainDefinition(query)
         return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
         )
      },
      wsLink,
      authLink.concat(httpLink)
   )

   const client = new ApolloClient({
      link,
      cache: new InMemoryCache(),
   })

   return <ApolloProvider client={client}>{children}</ApolloProvider>
}
