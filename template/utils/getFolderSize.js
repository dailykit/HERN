import fs from 'fs'
import _ from 'lodash'

const getFolderSize = dir => {
   dir = dir.replace(/\/$/, '')
   return _.flatten(
      fs.readdirSync(dir).map(file => {
         if (file === '.git' || file === 'schema') return ''
         let fileOrDir = fs.statSync([dir, file].join('/'))
         if (fileOrDir.isFile()) {
            return (dir + '/' + file).replace(/^\.\/\/?/, '')
         } else if (fileOrDir.isDirectory()) {
            return getFolderSize([dir, file].join('/'))
         }
      })
   )
}

export default getFolderSize
