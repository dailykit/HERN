const path = require('path')
const fs = require('fs')

export const getFilePaths = folder => {
   const filepaths = []
   const result = fs
      .readdirSync(folder)
      .filter(item => path.basename(item) !== '.git')
   result.map(item => {
      const isFolder = fs.statSync(`${folder}/${item}`).isDirectory()
      if (isFolder) {
         const data = getFilePaths(`${folder}/${item}`)
         filepaths.push(...data)
      } else {
         return filepaths.push(`${folder}/${item}`)
      }
   })
   return filepaths
}

module.exports = { getFilePaths }
