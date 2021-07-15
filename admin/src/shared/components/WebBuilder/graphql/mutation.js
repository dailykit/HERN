import gql from 'graphql-tag'

export const UPDATE_TEMPLATE = gql`
   mutation updateFile($path: String!, $content: String!, $message: String!) {
      updateFile(path: $path, content: $content, message: $message) {
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
