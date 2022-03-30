import aws from '../lib/aws'
import get_env from '../../get_env'
import { minifyImage } from './minify-image'

export const uploadFile = async (buffer, name, type) => {
   const AWS = await aws()
   const s3 = new AWS.S3()
   const S3_BUCKET = await get_env('S3_BUCKET')
   let s3buffer
   // minify image buffer
   const validImageTypes = ['png', 'jpg', 'jpeg', 'webp', 'tiff']
   if (validImageTypes.includes(type.ext) && buffer.length > 100000) {
      s3buffer = await minifyImage(buffer, type)
   } else {
      s3buffer = buffer
   }

   const params = {
      ACL: 'public-read',
      Body: s3buffer,
      Bucket: S3_BUCKET,
      ContentType: type.mime,
      Key: `${name}.${type.ext}`,
      Metadata: {
         CacheControl: 'max-age=604800'
      }
   }

   return s3.upload(params).promise()
}
