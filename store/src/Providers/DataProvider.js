import React from 'react'
import {
   split,
   ApolloClient,
   InMemoryCache,
   HttpLink,
   ApolloProvider
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { WebSocketLink } from '@apollo/client/link/ws'
import { get_env } from '../utils'

export const DataProvider = ({ children }) => {
   const authLink = setContext((_, { headers }) => {
      return {
         headers: {
            ...headers,
            'x-hasura-admin-secret': get_env('ADMIN_SECRET')
         }
      }
   })

   const wsLink = process.browser
      ? new WebSocketLink({
           uri: get_env('DATA_HUB_WSS'),
           options: {
              reconnect: true,
              connectionParams: {
                 headers: {
                    'x-hasura-admin-secret': get_env('ADMIN_SECRET')
                 }
              }
           }
        })
      : null

   const httpLink = new HttpLink({
      uri: get_env('DATA_HUB_HTTPS')
   })

   const link = process.browser
      ? split(
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
      : httpLink

   const client = new ApolloClient({
      link,
      fetch,
      cache: new InMemoryCache()
   })

   return <ApolloProvider client={client}>{children}</ApolloProvider>
}
