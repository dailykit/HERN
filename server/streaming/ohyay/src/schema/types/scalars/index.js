const { gql } = require('apollo-server-express')

const typeDefs = gql`
   input Invite {
      to: String
      validFrom: Int
      validUntil: Int
   }

   type Editor {
      email: String
   }
   input EditorInput {
      email: String
      directorModeOnly: Boolean
   }

   type InviteUrl {
      inviteUrl: [String]
   }

   type Workspace {
      wsid: String
      title: String
      editors: [Editor]
   }

   type WorkspaceInfo {
      prettyUrl: String
      tags: [String]
   }

   type Message {
      from: String
      to: String
      time: Float
   }

   type Chat {
      channel: String
      messages: [Message]
   }

   type WorkspaceChat {
      chats: [Chat]
   }

   type WorkspaceMovement {
      userId: String
      roomId: String
      enterTime: Float
      duration: Float
   }

   enum AllowedRegion {
      USEAST
      USWEST
      EU
      ASIA
   }

   input TagInput {
      email: String
      toAdd: [String]
      toRemove: [String]
   }

   input CloneWorkspaceInput {
      userId: String
      wsid: String
      title: String
      region: String
      editors: [EditorInput]
      tags: [String]
      tagsToRemove: [String]
   }

   input UpdateUserInput {
      userId: String
      wsid: String
      editorsToRemove: [String]
      editorsToAdd: [EditorInput]
      tagUpdates: [TagInput]
   }

   type CloneWorkspace {
      wsid: String
   }

   type UpdateUser {
      success: Boolean
   }

   type UpdateWorkspaceInfo {
      success: Boolean
   }

   type User {
      email: String
      tags: [String]
      uid: String
   }
   type ActiveUser {
      userId: String
      roomIds: [String]
   }

   type Recording {
      timestamp: Float
      downloadUrl: String
      roomId: String
      duration: Float
      recordingId: String
   }

   type SpeakerInfo {
      speakerId: String
      talkStartTime: Float
      duration: Float
   }
   type EmojiInfo {
      userId: String
      emoji: String
      timestamp: Float
      count: Float
   }

   type RecordingMetaData {
      speakers: [SpeakerInfo]
      emojis: [EmojiInfo]
   }

   type PrettyUrl {
      prettyUrl: String
   }

   type ClearPrettyUrl {
      success: Boolean
   }

   type DeleteWorkspace {
      success: Boolean
      errorCode: String
   }
`

module.exports = typeDefs
