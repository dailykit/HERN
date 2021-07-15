const GET_COMMIT_FETCH = `
	query getCommit($path: String!, $id: String!) {
		getCommit(path: $path, id: $id) {
            message
            author {
                name
                email
            }
            committer {
                name
                email
                timestamp
            }
		}
	}
`

export default GET_COMMIT_FETCH
