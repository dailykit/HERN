import gql from 'graphql-tag'

const GET_COMMITS = gql`
	query getCommits($path: String!, $commits: [String]!) {
		getCommits(path: $path, commits: $commits) {
			message
			author {
				name
			}
			committer {
				name
				timestamp
			}
		}
	}
`

export default GET_COMMITS
