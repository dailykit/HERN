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
export const REMOVE_CSS_LINK = gql`
   mutation REMOVE_CSS_LINK($guiFileId: Int!, $id: Int!) {
      delete_editor_cssFileLinks(
         where: { guiFileId: { _eq: $guiFileId }, id: { _eq: $id } }
      ) {
         returning {
            cssFileId
            guiFileId
         }
      }
   }
`
export const REMOVE_JS_LINK = gql`
   mutation REMOVE_JS_LINK($guiFileId: Int!, $id: Int!) {
      delete_editor_jsFileLinks(
         where: { guiFileId: { _eq: $guiFileId }, id: { _eq: $id } }
      ) {
         returning {
            jsFileId
            guiFileId
         }
      }
   }
`

export const LINK_CSS_FILES = gql`
   mutation LINK_CSS_FILES($objects: [editor_cssFileLinks_insert_input!]!) {
      insert_editor_cssFileLinks(objects: $objects) {
         returning {
            cssFileId
            guiFileId
         }
      }
   }
`
export const LINK_JS_FILES = gql`
   mutation LINK_JS_FILES($objects: [editor_jsFileLinks_insert_input!]!) {
      insert_editor_jsFileLinks(objects: $objects) {
         returning {
            jsFileId
            guiFileId
         }
      }
   }
`

export const UPDATE_LINK_CSS_FILES = gql`
   mutation UPDATE_LINK_CSS_FILES(
      $objects: [editor_cssFileLinks_update_input!]!
   ) {
      update_editor_cssFileLinks(objects: $objects) {
         returning {
            cssFileId
            guiFileId
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
