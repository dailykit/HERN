const { makeExecutableSchema } = require('graphql-tools')

// Import Schema Types
const { queryTypes, mutationTypes, scalarTypes } = require('./types/index')

// Import Schema Resolvers
const {
   queries: queryResolvers,
   scalars: scalarResolvers,
   mutations: mutationResolvers
} = require('./resolvers/index')

// Compose Schema
const schema = makeExecutableSchema({
   typeDefs: [queryTypes, mutationTypes, scalarTypes],
   resolvers: {
      ...queryResolvers,
      ...scalarResolvers,
      ...mutationResolvers
   }
})

module.exports = schema
