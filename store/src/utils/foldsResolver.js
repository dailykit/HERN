import fs from 'fs'
import { get_env } from './get_env'

const axios = require('axios')
/*
There could be two type of fold[module] 
1. system defined (These are mainly components exists in  our code base)
2. Plugin or third party plugin 
 - This could be either html file or JS file
*/
const resolveComponent = fold => {
   return new Promise(async (resolve, reject) => {
      try {
         if (fold.moduleType === 'system-defined') {
            // component exists in our codebase
            return resolve({
               id: fold.id,
               component: fold.internalModuleIdentifier,
               moduleType: fold.moduleType,
               position: fold.position,
               config: fold.config
            })
         }

         // else this is plugin/3rd party module
         const { path, linkedCssFiles, linkedJsFiles } =
            fold.subscriptionDivFileId

         const extension = path.split('.').pop()
         // html or js

         const content = await fs.readFileSync(
            process.cwd() + '/public/env-config.js',
            'utf-8'
         )

         /* config file */
         const config = JSON.parse(content.replace('window._env_ = ', ''))

         // script urls
         const scripts = linkedJsFiles.map(
            ({ jsFile }) =>
               `${config['EXPRESS_URL']}/template/files${jsFile.path}`
         )

         if (extension !== 'html') {
            return resolve({
               id: fold.id,
               scripts,
               moduleType: fold.moduleType,
               position: fold.position,
               config: fold.config
            })
         }

         const { data } = await axios.get(
            `${config['EXPRESS_URL']}/template/files${path}`
            // `${config['EXPRESS_URL']}/template/files/default/components/faq.html`
         )

         // add css links + html
         const parsedData =
            linkedCssFiles.map(
               ({ cssFile }) =>
                  `<link rel="stylesheet" type="text/css" href="${config['EXPRESS_URL']}/template/files${cssFile.path}" media="screen"/>`
            ).join`` + data

         /*
               {
                  id: 1017,
                  scripts: ['https://test.dailykit.org/template/files/componeent/faq.js', 'https://test.dailykit.org/template/files/componeent/test.js'],
                  content: `
                     <link rel="stylesheet" type="text/css" href="https://test.dailykit.org/template/filescomponeent/faq.css" media="screen"/>
                     <h1>Hello</h1>
                  `
               }
            
            */

         if (data) {
            return resolve({
               id: fold.id,
               content: parsedData,
               scripts,
               moduleType: fold.moduleType,
               position: fold.position,
               config: fold.config
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

export const foldsResolver = async folds => {
   const allFolds = Array.isArray(folds) ? folds : [folds]

   const output = await Promise.all(
      allFolds.map(fold => resolveComponent(fold))
   )

   return output
}
