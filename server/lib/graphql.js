import { GraphQLClient } from 'graphql-request'

require('dotenv').config()

export const client = new GraphQLClient(process.env.DATA_HUB, {
   headers: {
      'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET
   }
})
