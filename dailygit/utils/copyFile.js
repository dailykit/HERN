const fs = require('fs')
const path = require('path')
const axios = require('axios')
const functions = require('../functions')
const resolvers = require('../schema/resolvers')
const checkExist = require('./checkExist')
const get_env = require('../../get_env')

const copyFile = async (filePath, dest) => {
   console.log(filePath, dest)
   try {
      const THEME_STORE_EXPRESS_URL = await get_env('THEME_STORE_EXPRESS_URL')
      const FS_PATH = await get_env('FS_PATH')
      const { data } = await axios.get(`${THEME_STORE_EXPRESS_URL}${filePath}`)

      const { id } = await resolvers.mutations.Mutation.createFile(
         '_',
         (args = {
            path: dest,
            content: data
         }),
         { root: FS_PATH }
      )

      const { linkedCssFiles, linkedJsFiles } =
         await functions.themeStoreDb.getLinkedFiles(filePath)
      console.log({
         linkedCssFiles,
         linkedJsFiles
      })
      if (linkedCssFiles.length) {
         linkedCssFiles.forEach(async cssPath => {
            const srcRootFolder = path.dirname(cssPath.path)
            const dest = await checkExist(srcRootFolder)
            await copyFile(
               cssPath.path,
               `${cssPath.path.replace(srcRootFolder, dest)}`
            )

            const cssId = await functions.database.getFileId(
               `${cssPath.path.replace(srcRootFolder, dest)}`
            )
            await functions.database.createCsslinkRecord({
               guiFileId: id,
               cssFileId: cssId,
               position: cssPath.position
            })
         })
      }
      if (linkedJsFiles.length) {
         linkedJsFiles.forEach(async jsPath => {
            const srcRootFolder = path.dirname(jsPath.path)
            const dest = checkExist(srcRootFolder)
            await copyFile(
               jsPath.path,
               `${jsPath.path.replace(srcRootFolder, dest)}`
            )

            const jsId = await functions.database.getFileId(
               `${jsPath.path.replace(srcRootFolder, dest)}`
            )
            await functions.database.createJslinkRecord({
               guiFileId: id,
               jsFileId: jsId,
               position: jsPath.position
            })
         })
      }
   } catch (error) {
      console.log(error)
   }
}

module.exports = copyFile
