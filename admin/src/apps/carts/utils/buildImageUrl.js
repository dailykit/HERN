import { get_env } from '../../../shared/utils'

export const buildImageUrl = (size, url) => {
   const server_url = `${get_env('REACT_APP_DAILYOS_SERVER_URI')}/images`
   let bucket = ''
   if (new URL(url).host.split('.').length > 0) {
      bucket = new URL(url).host.split('.')[0]
   }
   const name = url.slice(url.lastIndexOf('/') + 1)

   return `${server_url}/http://${bucket}.s3-website.us-east-2.amazonaws.com\\${size}\\${name}`
}
