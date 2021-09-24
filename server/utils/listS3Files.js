import aws from '../lib/aws'

export const listS3Files = async (bucket, prefix) => {
   const AWS = await aws()
   const s3 = new AWS.S3()
   let isTruncated = true
   let marker
   while (isTruncated) {
      let params = { Bucket: bucket }
      if (prefix) params.Prefix = prefix
      if (marker) params.Marker = marker
      try {
         const response = await s3.listObjects(params).promise()
         isTruncated = response.IsTruncated
         if (isTruncated) {
            marker = response.Contents.slice(-1)[0].Key
         }
         return response
      } catch (error) {
         console.log('list S3 files ->', error)
         throw error
      }
   }
   return marker
}
