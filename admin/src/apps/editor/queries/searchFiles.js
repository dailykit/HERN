import gql from 'graphql-tag'

const SEARCH_FILES = gql`
	query searchFiles($fileName: String!) {
		searchFiles(fileName: $fileName)
	}
`

export default SEARCH_FILES
