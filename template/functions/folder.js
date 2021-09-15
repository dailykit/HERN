const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')
const database = require('./database')
const git = require('isomorphic-git')
const getFolderSize = require('../utils/getFolderSize')
import get_env from '../../get_env'
import * as files from './file'
git.plugins.set('fs', fs)

const getNestedFolders = async url => {
   try {
      let content = await fs.readdirSync(url)
      let folders = await content.filter(
         item =>
            fs.statSync(`${url}/${item}`).isDirectory() &&
            item !== '.git' &&
            item !== 'schema'
      )
      let result = folders.map(async folder => {
         const stats = fs.statSync(`${url}/${folder}`)
         if (stats.isDirectory()) {
            let node = {}
            node.name = folder
            node.path = `${url}/${folder}`.split('/').filter(Boolean).join('/')
            let children = await getNestedFolders(`${url}/${folder}`)
            node.children = children
            return node
         }
      })
      return result
   } catch (error) {
      return new Error(error)
   }
}

const getFolderWithFiles = async url => {
   try {
      const data = await fs.readdirSync(url)
      const FS_PATH = await get_env('FS_PATH')
      const result = await data
         .filter(item => item !== '.git' && item !== 'schema')
         .map(async item => {
            const stats = fs.statSync(`${url}/${item}`)
            let node = {}
            node.name = item
            node.path = `${url}/${item}`.split('/').filter(Boolean).join('/')
            node.createdAt = stats.birthtime
            if (stats.isFile()) {
               const fileData = await files.getFile(`${url}/${item}`)
               const filePath = `${url}/${item}`.replace(FS_PATH, '')
               const id = await database
                  .getFileId(filePath)
                  .catch(err => console.error(err))
               console.log(filePath, id, url, item)
               node.content = fileData.toString()
               node.id = id
               node.size = stats.size
               node.type = 'file'
            } else if (stats.isDirectory()) {
               let folders = await getFolderWithFiles(`${url}/${item}`)
               node.children = folders
               node.id = null
               node.type = 'folder'
               const folderSize = await getFolderSize(`${url}/${item}`)
                  .filter(Boolean)
                  .map(file => fs.readFileSync(file))
                  .join('\n')
               node.size = folderSize.length
            }
            return node
         })
      return result
   } catch (error) {
      return new Error(error)
   }
}

const createFolder = givenPath => {
   return new Promise((resolve, reject) => {
      if (fs.existsSync(givenPath)) {
         return reject(`Folder: ${path.basename(givenPath)} already exist!`)
      }
      return fs.mkdir(givenPath, { recursive: true }, error => {
         if (error) return reject(new Error(error))
         return resolve()
      })
   })
}

const deleteFolder = filePath => {
   return new Promise((resolve, reject) => {
      if (fs.existsSync(filePath)) {
         // Delete the folder
         return rimraf(filePath, error => {
            if (error) return reject(new Error(error))
            return resolve()
         })
      }
      return reject(`Folder: ${path.basename(filePath)} doesn't exist!`)
   })
}

const renameFolder = (oldPath, newPath) => {
   return new Promise((resolve, reject) => {
      // Check if newPath file exists
      if (oldPath === newPath) {
         return reject("New name and old name can't be same!")
      }
      if (fs.existsSync(newPath)) {
         return reject('Folder already exists!')
      }
      if (fs.existsSync(oldPath)) {
         return fs.rename(oldPath, newPath, async error => {
            if (error) return reject(new Error(error))
            return resolve()
         })
      }
      return reject(`Folder: ${path.basename(oldPath)} doesn't exists!`)
   })
}

module.exports = {
   createFolder,
   deleteFolder,
   renameFolder,
   getNestedFolders,
   getFolderWithFiles
}
