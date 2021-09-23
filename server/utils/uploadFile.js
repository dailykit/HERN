import aws from '../lib/aws'
import get_env from '../../get_env'
import { minifyImage } from '../utils'

export const uploadFile = async (buffer, name, type) => {
   const AWS = await aws()
   const s3 = new AWS.S3()
   const S3_BUCKET = await get_env('S3_BUCKET')

   // minify image buffer
   const minifiedBuffer = await minifyImage(buffer)

   const params = {
      ACL: 'public-read',
      Body: minifiedBuffer,
      Bucket: S3_BUCKET,
      ContentType: type.mime,
      Key: `${name}.${type.ext}`,
      Metadata: {}
   }

   return s3.upload(params).promise()
}
