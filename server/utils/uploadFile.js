import get_env from '../../get_env'

import aws from '../lib/aws'

export const uploadFile = async (buffer, name, type) => {
   const AWS = await aws()
   const s3 = new AWS.S3()
   const S3_BUCKET = await get_env('S3_BUCKET')
   const params = {
      ACL: 'public-read',
      Body: buffer,
      Bucket: S3_BUCKET,
      ContentType: type.mime,
      Key: `${name}.${type.ext}`,
      Metadata: {}
   }

   return s3.upload(params).promise()
}
