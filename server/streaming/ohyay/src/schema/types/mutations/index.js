const { gql } = require('apollo-server-express')

const mutations = gql`
   type Mutation {
      ohyay_createInvites(
         userId: String!
         wsid: String!
         invites: [Invite]
      ): InviteUrl
      ohyay_cloneWorkspace(cloneWorkspace: CloneWorkspaceInput): CloneWorkspace
      ohyay_deleteWorkspace(userId: String!, wsid: String!): DeleteWorkspace
      ohyay_createPrettyUrl(
         userId: String!
         wsid: String!
         urlPath: String!
      ): PrettyUrl
      ohyay_clearPrettyUrl(userId: String!, wsid: String!): ClearPrettyUrl
      ohyay_updateUsers(updateUserInput: UpdateUserInput): UpdateUser
      ohyay_updateWorkspaceInfo(
         userId: String!
         wsid: String!
         tagsToAdd: [String]!
         tagsToRemove: [String]!
      ): UpdateWorkspaceInfo
   }
`

module.exports = mutations
