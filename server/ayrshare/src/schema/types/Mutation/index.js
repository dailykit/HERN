const { gql } = require('apollo-server-express')
const mutations = gql`
   type Mutation {
      sendPost(
         post: String!
         platforms: [String]!
         mediaUrls: [String]
      ): PostResponse
      analyticsPost(id: String!, platforms: [String]!): analyticsResponse
      analyticsSocialNetwork(platforms: [String]!): analyticsSocialResponse
      postComment(
         id: String!
         platforms: [String]!
         comment: String!
      ): postCommentResponse
      deletePost(
         Id: String!
         deleteAllScheduled: Boolean
         bulk: [String]
      ): deletePostResponse
   }
`
module.exports = mutations
