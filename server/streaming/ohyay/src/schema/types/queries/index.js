const { gql } = require('apollo-server-express')
const typeDefs = gql`
   type Query {
      ohyay_workspaces(userId: String!): [Workspace]!
      ohyay_workspaceInfo(userId: String!, wsid: String!): WorkspaceInfo!
      ohyay_workspaceUsers(userId: String!, wsid: String!): [User]!
      ohyay_workspaceActiveUsers(userId: String!, wsid: String!): [ActiveUser]!
      ohyay_workspaceRecordings(userId: String!, wsid: String!): [Recording]!
      ohyay_workspaceRecordingMetaData(
         userId: String!
         wsid: String!
         recordingId: String!
      ): RecordingMetaData!
      ohyay_workspaceChats(userId: String!, wsid: String!): WorkspaceChat!
      ohyay_getWorkspaceMovement(
         userId: String!
         wsid: String!
         startTime: Float!
         endTime: Float!
      ): [WorkspaceMovement]!
   }
`

module.exports = typeDefs
