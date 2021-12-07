import get_env from '../../../get_env'
import aws from '../../lib/aws'

const fs = require('fs')
const fileType = require('file-type')
const multiparty = require('multiparty')
const { listS3Files, uploadFile, createUrl } = require('../../utils')

export const upload = (request, response) => {
   const form = new multiparty.Form()
   form.parse(request, async (error, fields, list) => {
      if (error) throw new Error(error)
      try {
         const files = Object.keys(list).map(key => {
            if (
               key in list &&
               Array.isArray(list[key]) &&
               list[key].length > 0
            ) {
               return list[key][0]
            }
            return null
         })

         const result = await Promise.all(
            files.map(async file => {
               try {
                  const buffer = fs.readFileSync(file.path)
                  let type = await fileType.fromBuffer(buffer)
                  const timestamp = Date.now().toString().slice(-5)
                  let originalFilename = `${timestamp}-${file.originalFilename
                     .split('.')
                     .slice(0, -1)
                     .join('.')}`

                  let name
                  if (type && type.mime.includes('image')) {
                     name = `images/${originalFilename}`
                  } else if (type && type.mime.includes('video')) {
                     name = `videos/${originalFilename}`
                  } else {
                     name = `misc/${originalFilename}`
                     let ext = file.originalFilename
                        .split('.')
                        .slice(-1)
                        .join('')
                     let mime
                     if (ext === 'csv') {
                        mime = 'text/csv'
                     } else if (ext === 'svg') {
                        mime = 'image/svg+xml'
                     } else if (ext === 'xls') {
                        mime = 'application/vnd.ms-excel'
                     }

                     type = { ext, mime }
                  }
                  const data = await uploadFile(buffer, name, type)
                  return data
               } catch (error) {
                  return error
               }
            })
         )
         return response.status(200).send(result)
      } catch (error) {
         console.log(error)
         return response.status(400).send(error)
      }
   })
}

const extractName = key =>
   key
      .split(/misc\/|videos\/|images\//)
      .filter(Boolean)
      .join()

export const list = async (req, res) => {
   try {
      const { type } = req.query
      const AWS = await aws()
      const s3 = new AWS.S3()
      const S3_BUCKET = await get_env('S3_BUCKET')
      console.log('from /api/assets endpoint', { S3_BUCKET })
      const { Contents } = await listS3Files(S3_BUCKET, type)
      console.log('from /api/assets endpoint', { Contents })
      const formatAssets = await Promise.all(
         Contents.map(async item => {
            try {
               const result = await s3
                  .headObject({
                     Bucket: S3_BUCKET,
                     Key: item.Key
                  })
                  .promise()
               return {
                  key: item.Key,
                  size: item.Size,
                  url: await createUrl(item.Key),
                  // metadata: result.Metadata,
                  name: extractName(item.Key)
               }
            } catch (error) {
               console.log(error)
            }
         })
      )

      return res.status(200).json({
         success: true,
         data: formatAssets.filter(node => node.size)
      })
   } catch (error) {
      console.log('list -> error', error)
      return res.status(400).send(error)
   }
}

export const remove = async (req, res) => {
   try {
      const { key } = req.query
      const AWS = await aws()
      const s3 = new AWS.S3()
      const S3_BUCKET = await get_env('S3_BUCKET')
      const data = await s3
         .deleteObject({ Bucket: S3_BUCKET, Key: key })
         .promise()
      if (data.constructor === Object) {
         return res
            .status(200)
            .json({ success: true, message: 'Succesfully deleted!' })
      }
   } catch (error) {
      console.log(error)
      return res.status(400).send(error)
   }
}
