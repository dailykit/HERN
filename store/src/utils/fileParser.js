import { get_env } from './get_env'
const axios = require('axios')

const fetchFile = fold => {
   return new Promise(async (resolve, reject) => {
      const { path, linkedCssFiles, linkedJsFiles } = fold.subscriptionDivFileId

      // const url = get_env('EXPRESS_URL')  not working since get_env works only on client side
      const url = 'https://testhern.dailykit.org'
      console.log({ url: `${url}/template/files${path}` })
      const { data } = await axios.get(`${url}/template/files${path}`)

      // add css links + html
      const parsedData =
         linkedCssFiles.length > 0
            ? linkedCssFiles.map(
                 ({ cssFile }) =>
                    `<link rel="stylesheet" type="text/css" href="${url}/template/files${cssFile.path}" media="screen"/>`
              ).join`` + data
            : data

      // script urls
      const scripts = linkedJsFiles.map(
         ({ jsFile }) => `${url}/template/files${jsFile.path}`
      )

      if (data) {
         resolve({ id: fold.id, content: data, scripts })
      } else {
         reject('Failed to load file')
      }
   })
}

const intermediateFunction = async fold => {
   return new Promise(async (resolve, reject) => {
      const output = await Promise.all(
         fold.subscriptionDivFileId.map(divFold =>
            fetchFile({
               id: fold.id,
               subscriptionDivFileId: divFold
            })
         )
      )
      if (output) {
         resolve(...output)
      } else {
         reject('Failed to load file')
      }
   })
}

export const fileParser = async folds => {
   const allFolds = Array.isArray(folds) ? folds : [folds]
   const output = await Promise.all(
      allFolds.map(fold => {
         const subscriptionDivFileId = Array.isArray(fold.subscriptionDivFileId)
            ? fold.subscriptionDivFileId
            : [fold.subscriptionDivFileId]
         const updatedFold = {
            id: fold.id,
            subscriptionDivFileId
         }
         return intermediateFunction(updatedFold)
      })
   )
   return output
}
