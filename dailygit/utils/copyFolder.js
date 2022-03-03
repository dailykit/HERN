const fs = require('fs')
const copyFile = require('./copyFile')
const functions = require('../functions')
const get_env = require('../../get_env')
const copyFolder = async (src, dest) => {
   try {
      const FS_PATH = await get_env('FS_PATH')
      const children = await functions.themeStoreDb.getFolderWithFile(src)
      const result = await Promise.all(
         children.map(async child => {
            const path = child.path.replace(FS_PATH, '')
            if (child.type === 'folder') {
               await copyFolder(path, `${path.replace(src, dest)}`)
            } else {
               await copyFile(path, `${path.replace(src, dest)}`)
            }
         })
      )
      return result
   } catch (error) {
      return new Error(error)
   }
}

module.exports = copyFolder
