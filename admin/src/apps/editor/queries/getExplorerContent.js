import gql from 'graphql-tag'

const GET_EXPLORER_CONTENT = gql`
	query getFolderWithFiles($path: String!) {
		getFolderWithFiles(path: $path) {
			name
			path
			type
			children {
				name
				path
				type
				children {
					name
					path
					type
					children {
						name
						path
						type
						children {
							name
							path
							type
							children {
								name
								path
								type
								children {
									name
									path
									type
									children {
										name
										path
										type
										children {
											name
											path
											type
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
`

export default GET_EXPLORER_CONTENT
