import AWS from 'aws-sdk'
import get_env from '../../get_env'

const aws = async () => {
   const AWS_ACCESS_KEY_ID = await get_env('AWS_ACCESS_KEY_ID')
   const AWS_SECRET_ACCESS_KEY = await get_env('AWS_SECRET_ACCESS_KEY')
   AWS.config.update({
      region: 'us-east-2',
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
   })
   return AWS
}

export default aws
