import { ApolloClient, InMemoryCache } from '@apollo/client'

export const graphqlClient = new ApolloClient({
   uri:
      (process.browser && window?._env_?.DATA_HUB_HTTPS) ||
      process.env.DATA_HUB_HTTPS,
   cache: new InMemoryCache(),
   headers: {
      'x-hasura-admin-secret': `${
         (process.browser && window?._env_?.ADMIN_SECRET) ||
         process.env.ADMIN_SECRET
      }`
   }
})
