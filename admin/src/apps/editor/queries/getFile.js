import gql from 'graphql-tag'

const GET_FILE = gql`
    query getFile($path: String!) {
        getFile(path: $path) {
            size
            name
            createdAt
            content
        }
    }
`

const GET_FILE_FETCH = `
	query getFile($path: String!) {
		getFile(path: $path) {
			size
			name
			createdAt
			content
			path			
		}
	}
`

export { GET_FILE, GET_FILE_FETCH }
