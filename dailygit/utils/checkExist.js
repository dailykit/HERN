const fs = require('fs')
const get_env = require('../../get_env')
let count = 0
const copyName = async url => {
   try {
      const FS_PATH = await get_env('FS_PATH')
      const MARKET_PLACE_PATH = await get_env('MARKET_PLACE_PATH')
      const isExist = fs.existsSync(`${FS_PATH}${MARKET_PLACE_PATH}${url}`)
      if (isExist) {
         // let folderName = url.replace(/^\//g, '').split(/\//g)[0]
         let newPath = url
         count += 1
         if (count <= 1) {
            newPath = newPath.concat(`(${count})`)
         } else {
            newPath = newPath.split('(')[0].concat(`(${count})`)
         }
         const result = await copyName(newPath)
         return result
         //  const checkAgain = copyName()
      } else {
         count = 0
         return `${MARKET_PLACE_PATH}${url}`
      }
   } catch (err) {
      return new Error(err)
   }
}

module.exports = copyName
