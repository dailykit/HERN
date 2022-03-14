const fs = require('fs')
const path = require('path')
const git = require('isomorphic-git')
const { createFolder } = require('./folder')
git.plugins.set('fs', fs)

const createFile = (filePath, content) => {
   console.log('init createFile function')
   return new Promise((resolve, reject) => {
      const parentDir = path.dirname(filePath)
      if (fs.existsSync(parentDir)) {
         if (fs.existsSync(filePath)) {
            return reject(`File: ${path.basename(filePath)} already exists!`)
         }
         return fs.writeFile(filePath, content, error => {
            if (error) return reject(new Error(error))
            return resolve()
         })
      } else {
         createFolder(parentDir).then(() => {
            return fs.writeFile(filePath, content, error => {
               if (error) return reject(new Error(error))
               return resolve()
            })
         })
      }
   })
}

const deleteFile = async filePath => {
   return new Promise((resolve, reject) => {
      if (fs.existsSync(filePath)) {
         return fs.unlink(filePath, error => {
            if (error) return reject(new Error(error))
            return resolve()
         })
      }
      return reject(`File ${path.basename(filePath)} doesn't exists`)
   })
}

const getFile = filePath => {
   return new Promise((resolve, reject) => {
      if (fs.existsSync(filePath)) {
         return fs.readFile(filePath, (error, file) => {
            if (error) reject(new Error(error))
            return resolve(file)
         })
      }
      return reject(`File: ${path.basename(filePath)} doesn't exists!`)
   })
}

const updateFile = async (filePath, content) => {
   return new Promise((resolve, reject) => {
      if (fs.existsSync(filePath)) {
         return fs.writeFile(filePath, content, err => {
            if (err) return reject(new Error(err))
            resolve(`Updated: ${path.basename(filePath)} file`)
         })
      }
      return reject(`File ${path.basename(filePath)} doesn't exists`)
   })
}

const renameFile = async (oldPath, newPath) => {
   return new Promise((resolve, reject) => {
      // Check if newPath file exists
      if (oldPath === newPath) {
         return reject("New name and old name can't be same")
      }

      if (fs.existsSync(newPath)) {
         return reject(`File ${path.basename(newPath)} already exists`)
      }

      if (fs.existsSync(oldPath)) {
         return fs.rename(oldPath, newPath, err => {
            if (err) return reject(new Error(err))
            return resolve()
         })
      }
      return reject(`File ${path.basename(oldPath)} already exists`)
   })
}

const upload = async (filePath, file) => {
   return new Promise((resolve, reject) => {
      const { createReadStream, filename } = file
      const stream = createReadStream()
      return stream
         .on('error', error => {
            fs.unlinkSync(`${filePath}/${filename}`)
            return reject(new Error(error))
         })
         .pipe(fs.createWriteStream(`${filePath}/${filename}`))
         .on('finish', () => resolve())
   })
}

module.exports = {
   createFile,
   deleteFile,
   getFile,
   updateFile,
   renameFile,
   upload
}
