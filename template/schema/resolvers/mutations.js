const path = require('path')
const fs = require('fs')

const git = require('isomorphic-git')
git.plugins.set('fs', fs)

const dailygit = require('../../functions')

const { getFilePaths } = require('../../utils/getFilePaths')

const { getRepoPath, getFilePath } = require('../../utils/parsePath')

const resolvers = {
   Mutation: {
      createFolder: async (_, args, { root }) => {
         try {
            await dailygit.folders.createFolder(`${root}${args.path}`)
            return {
               success: true,
               message: `Folder: ${path.basename(args.path)} has been created!`
            }
         } catch (error) {
            return {
               success: false,
               error
            }
         }
      },
      deleteFolder: async (_, args, { root }) => {
         const filepaths = await getFilePaths(`${root}${args.path}`).map(path =>
            path.replace(new RegExp(root), '')
         )
         try {
            // File System
            await dailygit.folders.deleteFolder(`${root}${args.path}`)

            const author = {
               name: 'placeholder',
               email: 'placeholder@example.com'
            }
            const committer = {
               name: 'placeholder',
               email: 'placeholder@example.com'
            }

            await filepaths.map(async filepath => {
               //    // Git
               await dailygit.git.removeAndCommit(
                  {
                     repoPath: `${root}${getRepoPath(filepath)}`,
                     filePath: getFilePath(filepath)
                  },
                  author,
                  committer,
                  `Deleted: File ${path.basename(filepath)}`
               )

               // Database
               await dailygit.database
                  .deleteRecordedFile({ path: filepath })
                  .catch(error => console.error(error))
            })

            return {
               success: true,
               message: `Folder: ${path.basename(args.path)} has been deleted!`
            }
         } catch (error) {
            return {
               success: false,
               error
            }
         }
      },
      renameFolder: async (_, args, { root }) => {
         try {
            const oldFiles = await getFilePaths(`${root}${args.oldPath}`).map(
               path => path.replace(new RegExp(root), '')
            )

            console.log(oldFiles)
            // File System
            await dailygit.folders.renameFolder(
               `${root}${args.oldPath}`,
               `${root}${args.newPath}`
            )

            // Git
            const newFiles = await getFilePaths(`${root}${args.newPath}`).map(
               path => path.replace(new RegExp(root), '')
            )
            const author = {
               name: 'placeholder',
               email: 'placeholder@example.com'
            }
            const committer = {
               name: 'placeholder',
               email: 'placeholder@example.com'
            }

            await oldFiles.map(filepath => {
               return git.remove({
                  dir: `${root}${getRepoPath(filepath)}`,
                  filepath: getFilePath(filepath)
               })
            })

            await newFiles.map(async filepath => {
               try {
                  const sha = await dailygit.git.addAndCommit(
                     {
                        repoPath: `${root}${getRepoPath(filepath)}`,
                        filePath: getFilePath(filepath)
                     },
                     author,
                     committer,
                     `Moved: ${path.basename(filepath)} from ${path.basename(
                        args.oldPath
                     )} to ${path.basename(args.newPath)}`
                  )

                  //       // Database
                  await dailygit.database
                     .renameRecordedFile({
                        oldFilePath: oldFiles[newFiles.indexOf(filepath)],
                        newFilePath: filepath,
                        fileName: path.basename(filepath),
                        lastSaved: new Date().toISOString()
                     })
                     .catch(error => console.error(error))
               } catch (error) {
                  throw error
               }
            })

            return {
               success: true,
               message: `Folder ${path.basename(
                  args.oldPath
               )} renamed to ${path.basename(args.newPath)}`
            }
         } catch (error) {
            return {
               success: false,
               error
            }
         }
      },
      createFile: async (_, args, { root }) => {
         try {
            console.log('from createFile mutation', { args })
            // Filesystem
            await dailygit.files.createFile(`${root}${args.path}`, args.content)

            // Git
            const author = {
               name: 'placeholder',
               email: 'placeholder@example.com'
            }
            const committer = {
               name: 'placeholder',
               email: 'placeholder@example.com'
            }

            const sha = await dailygit.git.addAndCommit(
               {
                  repoPath: `${root}${getRepoPath(args.path)}`,
                  filePath: getFilePath(args.path)
               },
               author,
               committer,
               `Added: ${path.basename(args.path)}`
            )

            // Database
            const record = await dailygit.database.createFileRecord(args.path)

            return {
               success: true,
               message: `File ${path.basename(args.path)} has been created `,
               id: record
            }
         } catch (error) {
            return {
               success: false,
               error: error.code === 'ResolveRefError' ? error.message : error
            }
         }
      },
      deleteFile: async (_, args, { root }) => {
         try {
            // Filesystem
            await dailygit.files.deleteFile(`${root}${args.path}`)

            // Git
            const author = {
               name: 'placeholder',
               email: 'placeholder@example.com'
            }
            const committer = {
               name: 'placeholder',
               email: 'placeholder@example.com'
            }
            await dailygit.git.removeAndCommit(
               {
                  repoPath: `${root}${getRepoPath(args.path)}`,
                  filePath: getFilePath(args.path)
               },
               author,
               committer
            )
            // Database
            await dailygit.database
               .deleteRecordedFile({ path: args.path })
               .catch(error => console.error(error))

            return {
               success: true,
               message: `File ${path.basename(args.path)} has been deleted`
            }
         } catch (error) {
            return {
               success: false,
               error
            }
         }
      },
      updateFile: async (_, args, { root }) => {
         try {
            // File System
            await dailygit.files.updateFile(`${root}${args.path}`, args.content)

            // Git
            const author = {
               name: 'placeholder',
               email: 'placeholder@example.com'
            }
            const committer = {
               name: 'placeholder',
               email: 'placeholder@example.com'
            }
            const sha = await dailygit.git.addAndCommit(
               {
                  repoPath: `${root}${getRepoPath(args.path)}`,
                  filePath: getFilePath(args.path)
               },
               author,
               committer,
               args.message
            )

            // Database
            await dailygit.database
               .updateRecordedFile({
                  path: args.path,
                  lastSaved: new Date().toISOString()
               })
               .catch(error => console.error(error))

            return {
               success: true,
               message: `File: ${path.basename(args.path)} has been updated!`
            }
         } catch (error) {
            return {
               success: false,
               error
            }
         }
      },
      draftFile: async (_, args, { root }) => {
         try {
            // File System
            await dailygit.files.updateFile(`${root}${args.path}`, args.content)

            // Database
            await dailygit.database
               .updateRecordedFile({
                  path: args.path,
                  lastSaved: new Date().toISOString()
               })
               .catch(error => console.error(error))

            return {
               success: true,
               message: `File: ${path.basename(args.path)} has been updated!`
            }
         } catch (error) {
            return {
               success: false,
               error
            }
         }
      },
      renameFile: async (_, args, { root }) => {
         try {
            // File System
            await dailygit.files.renameFile(
               `${root}${args.oldPath}`,
               `${root}${args.newPath}`
            )

            // Git
            const author = {
               name: 'placeholder',
               email: 'placeholder@example.com'
            }
            const committer = {
               name: 'placeholder',
               email: 'placeholder@example.com'
            }

            await git.remove({
               dir: `${root}${getRepoPath(args.oldPath)}`,
               filepath: getFilePath(args.oldPath)
            })

            const sha = await dailygit.git.addAndCommit(
               {
                  repoPath: `${root}${getRepoPath(args.newPath)}`,
                  filePath: getFilePath(args.newPath)
               },
               author,
               committer,
               `Renamed: ${path.basename(args.oldPath)} file to ${path.basename(
                  args.newPath
               )}`
            )

            // Database
            await dailygit.database
               .renameRecordedFile({
                  oldFilePath: args.oldPath,
                  newFilePath: args.newPath,
                  fileName: path.basename(args.newPath),
                  lastSaved: new Date().toISOString()
               })
               .catch(error => console.error(error))

            return {
               success: true,
               message: `File: ${path.basename(
                  args.oldPath
               )} renamed to ${path.basename(args.newPath)}`
            }
         } catch (error) {
            return {
               success: false,
               error
            }
         }
      },
      imageUpload: async (_, args, { media }) => {
         try {
            const { files } = await args

            await Object.keys(files).map(async key => {
               // File System
               const file = await files[key]
               await dailygit.files.upload(`${media}`, file)
            })
            return {
               success: true,
               message: `${files.length} file${
                  files.length > 1 ? 's' : ''
               } has been uploaded`
            }
         } catch (error) {
            return {
               success: false,
               error
            }
         }
      }
   }
}

module.exports = resolvers
