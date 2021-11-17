import gql from 'graphql-tag'

export const FILE_LINKS = gql`
   subscription FILE_LINKS($path: String!) {
      editor_file(where: { path: { _eq: $path } }) {
         fileId: id
         linkedCssFiles: attachedJSFiles(
            order_by: { position: desc_nulls_last }
         ) {
            position
            id
            cssFile: file {
               path
               fileName
               fileType
               cssFileId: id
            }
         }
         linkedJsFiles: attachedJSFiles(
            order_by: { position: desc_nulls_last }
         ) {
            position
            id
            jsFile: file {
               path
               fileName
               fileType
               jsFileId: id
            }
         }
      }
   }
`

export const GET_FILES = gql`
   subscription GET_FILES($linkedFiles: [Int!]!, $fileType: String!) {
      editor_file_aggregate(
         where: { id: { _nin: $linkedFiles }, fileType: { _eq: $fileType } }
      ) {
         nodes {
            id
            fileName
            fileType
            path
         }
      }
   }
`
export const GET_FILE_ID_BY_PATH = gql`
   subscription MyQuery($where: editor_file_bool_exp!) {
      editor_file(where: $where) {
         id
         path
      }
   }
`
