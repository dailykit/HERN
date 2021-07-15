import fs from 'fs'
import { get_env } from './get_env'

const axios = require('axios')

const fetchFile = fold => {
   return new Promise(async (resolve, reject) => {
      try {
         if (fold.moduleType === 'system-defined') {
            return resolve({ id: fold.id, component: fold.name })
         }

         const { path, linkedCssFiles, linkedJsFiles } =
            fold.subscriptionDivFileId

         const extension = path.split('.').pop()

         const content = await fs.readFileSync(
            process.cwd() + '/public/env-config.js',
            'utf-8'
         )
         const config = JSON.parse(content.replace('window._env_ = ', ''))

         // script urls
         const scripts = linkedJsFiles.map(
            ({ jsFile }) =>
               `${config['EXPRESS_URL']}/template/files${jsFile.path}`
         )

         if (extension !== 'html') {
            return resolve({ id: fold.id, scripts, extension })
         }

         const { data } = await axios.get(
            `${config['EXPRESS_URL']}/template/files${path}`
         )

         // add css links + html
         const parsedData =
            linkedCssFiles.map(
               ({ cssFile }) =>
                  `<link rel="stylesheet" type="text/css" href="${config['EXPRESS_URL']}/template/files${cssFile.path}" media="screen"/>`
            ).join`` + data

         if (data) {
            return resolve({
               id: fold.id,
               content: parsedData + data,
               scripts,
               extension,
            })
         } else {
            return reject('Failed to load file')
         }
      } catch (error) {
         console.log('fetchFile', error)
         return reject(error.message)
      }
   })
}

export const fileParser = async folds => {
   const allFolds = Array.isArray(folds) ? folds : [folds]

   const output = await Promise.all(allFolds.map(fold => fetchFile(fold)))

   return output
}
