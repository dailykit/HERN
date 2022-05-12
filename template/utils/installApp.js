import fs from 'fs'
import git from 'isomorphic-git'
git.plugins.set('fs', fs)

const dailygit = require('../functions')

const addDataFolders = folders => {
   return folders.map(path =>
      dailygit.folders
         .createFolder(path)
         .then(() => git.init({ dir: path }))
         .catch(error => ({
            success: false,
            error: new Error(error)
         }))
   )
}

const addSchemaFolders = async (folders, schema, appPath) => {
   try {
      // Create schema folders
      await folders.map(path => fs.mkdirSync(path, { recursive: true }))
      // Create entity files
      await schema.map(({ path, entities }) => {
         return entities.map(entity =>
            fs.writeFileSync(
               `${appPath}/schema/${path}/${entity.name}.json`,
               JSON.stringify(entity.content, null, 3)
            )
         )
      })
   } catch (error) {
      throw error
   }
}

const addExtendedSchemaFiles = (apps, name, root) => {
   return apps.map(app => {
      return app.entities.map(entity => {
         const path = `${root}${app.name}/schema/${entity.name}/ext.${name}.json`
         return fs.writeFile(
            path,
            JSON.stringify(entity.schema, null, 2),
            error => {
               if (error) throw error
            }
         )
      })
   })
}
export { addDataFolders, addSchemaFolders, addExtendedSchemaFiles }
