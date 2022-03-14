const { gql } = require('apollo-server-express')

const typeDefs = gql`
   type Folder {
      name: String
      path: String
      type: String
      size: Int
      createdAt: String
      children: [Folder]
   }
   type FolderWithFiles {
      id: Int
      name: String
      path: String
      type: String
      size: Int
      createdAt: String
      content: String
      children: [FolderWithFiles]
   }
   type File {
      name: String
      path: String
      type: String
      content: String
      size: Int
      createdAt: String
   }
   type Author {
      name: String
      email: String
      timestamp: String
   }
   type Committer {
      name: String
      email: String
      timestamp: String
   }
   type Commit {
      oid: String
      message: String
      tree: String
      parent: [String]
      author: Author
      committer: Committer
   }
   union Result = Success | Error
   type Success {
      success: Boolean
      message: String
   }
   type Error {
      success: Boolean
      error: String
   }
   scalar Upload
`

module.exports = typeDefs
