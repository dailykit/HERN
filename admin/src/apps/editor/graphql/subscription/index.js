import gql from 'graphql-tag'

export const FILE_LINKS = gql`
   subscription FILE_LINKS($path: String!) {
      editor_file(where: { path: { _eq: $path } }) {
         fileId: id
         linkedCssFiles(order_by: { position: desc_nulls_last }) {
            position
            id
            cssFile {
               path
               fileName
               fileType
               cssFileId: id
            }
         }
         linkedJsFiles(order_by: { position: desc_nulls_last }) {
            position
            id
            jsFile {
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
