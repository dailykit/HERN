import gql from 'graphql-tag'

export const DRAFT_FILE = gql`
   mutation draftFile($path: String!, $content: String!) {
      draftFile(path: $path, content: $content) {
         ... on Error {
            success
            error
         }
         ... on Success {
            success
            message
         }
      }
   }
`

export const CREATE_FOLDER = gql`
   mutation createFolder($path: String) {
      createFolder(path: $path) {
         ... on Error {
            success
            error
         }
         ... on Success {
            success
            message
         }
      }
   }
`
export const CREATE_FILE = gql`
   mutation createFile($path: String, $content: String) {
      createFile(path: $path, content: $content) {
         ... on Error {
            success
            error
         }
         ... on Success {
            success
            message
         }
      }
   }
`
export const RENAME_FILE = gql`
   mutation renameFile($oldPath: String!, $newPath: String!) {
      renameFile(oldPath: $oldPath, newPath: $newPath) {
         ... on Error {
            success
            error
         }
         ... on Success {
            success
            message
         }
      }
   }
`
export const RENAME_FOLDER = gql`
   mutation renameFolder($oldPath: String!, $newPath: String!) {
      renameFolder(oldPath: $oldPath, newPath: $newPath) {
         ... on Error {
            success
            error
         }
         ... on Success {
            success
            message
         }
      }
   }
`
export const DELETE_FOLDER = gql`
   mutation deleteFolder($path: String!) {
      deleteFolder(path: $path) {
         ... on Error {
            success
            error
         }
         ... on Success {
            success
            message
         }
      }
   }
`
export const DELETE_FILE = gql`
   mutation deleteFile($path: String!) {
      deleteFile(path: $path) {
         ... on Error {
            success
            error
         }
         ... on Success {
            success
            message
         }
      }
   }
`

export const INSERT_RECORD = gql`
   mutation INSERT_FILE($object: editor_file_insert_input!) {
      insert_editor_file_one(object: $object) {
         id
      }
   }
`

export const UPDATE_RECORD = gql`
   mutation UPDATE_FILE($path: String!, $set: editor_file_set_input!) {
      update_editor_file(where: { path: { _eq: $path } }, _set: $set) {
         returning {
            id
            path
         }
      }
   }
`

export const DELETE_RECORD = gql`
   mutation DELETE_RECORD($path: String!) {
      delete_editor_file(where: { path: { _eq: $path } }) {
         returning {
            id
            path
         }
      }
   }
`

export const CREATE_BLOCK = gql`
   mutation CREATE_BLOCK($object: editor_block_insert_input!) {
      insert_editor_block_one(object: $object) {
         fileId
         id
         name
         category
      }
   }
`
