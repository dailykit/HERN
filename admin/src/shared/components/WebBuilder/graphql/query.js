import gql from 'graphql-tag'

export const TEMPLATE = gql`
   query($path: String!) {
      getFile(path: $path) {
         content
         path
         name
      }
   }
`

export const BLOCKS = gql`
   query($path: String!) {
      getFolderWithFiles(path: $path) {
         name
         path
         type
         size
         createdAt
         content
         children {
            name
            path
            type
            size
            createdAt
            content
            file: children {
               name
               path
               type
               size
               createdAt
               content
            }
         }
      }
   }
`
