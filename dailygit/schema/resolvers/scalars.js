const resolvers = {
    Result: {
        __resolveType: obj => {
            if (obj.error) return 'Error'
            if (obj.message) return 'Success'
            return null
        },
    },
}

module.exports = resolvers
