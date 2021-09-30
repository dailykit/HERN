const { gql } = require('apollo-server-express')
const typeDefs = gql`
   type Query {
      # queryName: TypeName
      getUser: User
      getAnalytics(lastDays: Int): Analytics
      getComments(Id: String!): Comments
   }
`
module.exports = typeDefs
