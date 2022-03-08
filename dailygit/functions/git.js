const fs = require('fs')
const git = require('isomorphic-git')
const path = require('path')

git.plugins.set('fs', fs)

const addAndCommit = ({ repoPath, filePath }, author, committer, message) => {
   return new Promise((resolve, reject) => {
      if (fs.existsSync(`${repoPath}/${filePath}`)) {
         git.add({
            dir: repoPath,
            filepath: filePath,
         })
         const sha = git.commit({
            dir: repoPath,
            author,
            committer,
            message,
         })
         return resolve(sha)
      }
      return reject(`File: ${path.basename(filePath)} doesn't exist!`)
   })
}

const removeAndCommit = ({ repoPath, filePath }, author, committer) => {
   return new Promise((resolve, reject) => {
      git.remove({
         dir: repoPath,
         filepath: filePath,
      })
      const sha = git.commit({
         dir: repoPath,
         author,
         committer,
         message: `Deleted: ${path.basename(filePath)}`,
      })
      resolve(sha)
   })
}

module.exports = {
   addAndCommit,
   removeAndCommit,
}
