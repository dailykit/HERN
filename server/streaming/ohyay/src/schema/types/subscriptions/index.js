const { gql } = require('apollo-server-express')

const typeDefs = gql`
    type Subscription {
        openFileSub: File
    }
`

module.exports = typeDefs
