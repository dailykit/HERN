import fs from 'fs'
import path from 'path'

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
