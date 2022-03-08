import fs from 'fs'
import { get_env } from './get_env'

const axios = require('axios')

const fetchFile = fold => {
   return new Promise(async (resolve, reject) => {
      try {
         const { path, linkedCssFiles, linkedJsFiles } =
            fold.subscriptionDivFileId

         const content = await fs.readFileSync(
            process.cwd() + '/public/env-config.js',
            'utf-8'
         )
         const config = JSON.parse(content.replace('window._env_ = ', ''))

         const { data } = await axios.get(
            `${config['BASE_BRAND_URL']}/template/files${path}`
         )

         // add css links + html
         const parsedData =
            linkedCssFiles.map(
               ({ cssFile }) =>
                  `<link rel="stylesheet" type="text/css" href="${config['BASE_BRAND_URL']}/template/files${cssFile.path}" media="screen"/>`
            ).join`` + data

         // script urls
         const scripts = linkedJsFiles.map(
            ({ jsFile }) =>
               `${config['BASE_BRAND_URL']}/template/files${jsFile.path}`
         )

         if (data) resolve({ id: fold.id, content: parsedData, scripts })
         else reject('Failed to load file')
      } catch (error) {
         console.log('fetchFile', error)
      }
   })
}

export const fileParser = async folds => {
   const allFolds = Array.isArray(folds) ? folds : [folds]

   const output = await Promise.all(allFolds.map(fold => fetchFile(fold)))

   return output
}
