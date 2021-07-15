import gql from 'graphql-tag'

const UPDATE_FILE = gql`
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

export default UPDATE_FILE
