const getRepoPath = path => path.split('/').slice(0, 1).join('/')
const getFilePath = path => path.split('/').slice(1).join('/')

module.exports = {
   getRepoPath,
   getFilePath
}
