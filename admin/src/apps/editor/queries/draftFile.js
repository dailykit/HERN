import gql from 'graphql-tag'

const DRAFT_FILE = gql`
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

export default DRAFT_FILE
