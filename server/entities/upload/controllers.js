import get_env from '../../../get_env'
import aws from '../../lib/aws'
import { removeBackgroundFromImageUrl } from 'remove.bg'
import axios from 'axios'

const fs = require('fs')
const fileType = require('file-type')
const multiparty = require('multiparty')
const {
   listS3Files,
   uploadFile,
   createUrl,
   resizeImage
} = require('../../utils')

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
      // console.log('from /api/assets endpoint', { S3_BUCKET })
      const { Contents } = await listS3Files(S3_BUCKET, type)
      // console.log('from /api/assets endpoint', { Contents })
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
      console.log('remove reached', req.query)
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

// to do in future :- send mail to customers in case monthly free tries have been used using remove.bg apiKey
// for our customers :-  company api key will be used
export const serveImage = async (req, res) => {
   try {
      // get the src url of the original image from the url query string
      const url = req.query.src
      const imageWidth = parseInt(req.query.width)
      const imageHeight = parseInt(req.query.height)
      const imageFit = req.query.fit || 'cover'
      const removeImageBg = req.query.removebg || false

      // get only remove background image
      if (removeImageBg && !(Boolean(imageWidth) && Boolean(imageHeight))) {
         const api_key = await get_env('REMOVE_BG_API_KEY')
         // directory to store output image after altering the image
         const outputFile = `${__dirname}/image.png`
         const validURL = url.replaceAll(' ', '+')

         await removeBackgroundFromImageUrl({
            url: validURL,
            apiKey: api_key,
            size: 'regular',
            outputFile
         })
         // to get the image name and alter it from /images/ to /images-rb/
         const IndexFromString = url.indexOf('/images/')
         var imageName = url.slice(IndexFromString)

         // imageName example /images/xyz --> /images-rb/xyz
         imageName = imageName.replace('/images/', 'images-rb/')
         // remove format from image name
         imageName = imageName.replace('.jpg', '')
         imageName = imageName.replace('.jpeg', '')
         imageName = imageName.replace('.png', '')

         // now upload it to aws
         const buffer = fs.readFileSync(outputFile)
         let type = await fileType.fromBuffer(buffer)
         const data = await uploadFile(buffer, imageName, type)

         fs.unlink(`${__dirname}/image.png`, function (err) {
            if (err) throw err
            // if no error, file has been deleted successfully
            console.log('File deleted!')
         })
         res.status(200).send(data.Location)
      } else if (
         !removeImageBg &&
         Boolean(imageWidth) &&
         Boolean(imageHeight)
      ) {
         // create a buffer of regular image
         const response = await axios.get(url, {
            responseType: 'arraybuffer'
         })
         const urlBuffer = response.data

         // resizing of regular image according to requirements
         const s3buffer = await resizeImage(
            urlBuffer,
            imageWidth,
            imageHeight,
            imageFit
         )

         const IndexFromString = url.indexOf('/images/')
         var imageName = url.slice(IndexFromString)

         // change folder for image
         // /images/xyz --> /300x400/xyz
         imageName = imageName.replace(
            '/images/',
            `${imageWidth}x${imageHeight}/`
         )
         imageName = imageName.replace('.jpg', '')
         imageName = imageName.replace('.jpeg', '')
         imageName = imageName.replace('.png', '')

         // upload in s3
         let type = await fileType.fromBuffer(s3buffer)
         const data = await uploadFile(s3buffer, imageName, type)

         // send image url as response
         res.status(200).send(data.Location)
      } else if (removeImageBg && Boolean(imageWidth) && Boolean(imageHeight)) {
         // particular dimension image without background
         const imageUrlWithoutBg = url.slice().replace('images', 'images-rb')

         // to get the image name and alter it from /images/ to /images-rb/
         const IndexFromString = url.indexOf('/images/')
         var imageName = url.slice(IndexFromString)

         // imageName example --> /images-rb/xyz
         imageName = imageName.replace(
            '/images/',
            `${imageWidth}x${imageHeight}-rb/`
         )
         // remove format from image name
         imageName = imageName.replace('.jpg', '')
         imageName = imageName.replace('.jpeg', '')
         imageName = imageName.replace('.png', '')

         // check is there image without bg is available
         // if available the need not remove.bg, use that image to direct resize
         try {
            const removedBackgroundBuffer = await axios.get(imageUrlWithoutBg, {
               responseType: 'arraybuffer'
            })

            // resize removedBackgroundBuffer buffer
            const resizeRemovedBackgroundBuffer = await resizeImage(
               removedBackgroundBuffer.data,
               imageWidth,
               imageHeight,
               imageFit
            )

            // upload in s3
            let type = await fileType.fromBuffer(resizeRemovedBackgroundBuffer)
            const data = await uploadFile(
               resizeRemovedBackgroundBuffer,
               imageName,
               type
            )
            res.status(200).send(data.Location)
         } catch (e) {
            // when image-rb not available
            const api_key = await get_env('REMOVE_BG_API_KEY')
            // the path to save the returned file to
            const outputFile = `${__dirname}/image.png`

            const validURL = url.replaceAll(' ', '+')
            await removeBackgroundFromImageUrl({
               url: validURL,
               apiKey: api_key,
               size: 'regular',
               outputFile
            })

            // crate a buffer of removed background image
            const removedBackgroundBuffer = fs.readFileSync(outputFile)

            // resize removedBackgroundBuffer buffer
            const resizeRemovedBackgroundBuffer = await resizeImage(
               removedBackgroundBuffer,
               imageWidth,
               imageHeight,
               imageFit
            )

            // upload in s3
            let type = await fileType.fromBuffer(resizeRemovedBackgroundBuffer)
            const data = await uploadFile(
               resizeRemovedBackgroundBuffer,
               imageName,
               type
            )
            // delete saved file on server bcz it has been save on s3
            fs.unlink(`${__dirname}/image.png`, function (err) {
               if (err) throw err
               // if no error, file has been deleted successfully
               console.log('File deleted!')
            })
            res.status(200).send(data.Location)
         }
      }
   } catch (error) {
      console.log(error)
      return res.status(400).send(error)
   }
}
