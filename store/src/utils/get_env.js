import get from 'lodash/get'
import { isClient } from './isClient'

export const get_env = title => {
   if (isClient) {
      if (!get(window, '_env_')) {
         const getEnvUrl = `${window.location.origin}/server/api/envs`
         fetch(getEnvUrl, {
            method: 'POST',
         }).then(() => {
            console.log(
               'fetch then promise',
               title,
               get(window, '_env_.' + title, '')
            )
            window.location.reload()
         })
      }
      const env = get(window, '_env_.' + title, '')
      if (title === 'BASE_BRAND_URL') {
         switch (process.env.NEXT_PUBLIC_MODE) {
            case 'production':
               return window.location.origin
            // full-dev will still give error because now we are using BASE_BRAND_URL
            // as http://localhost:4000 and since we have also replaced express url
            // with BASE_BRAND_URL hence in development it will look for local templates folder
            case 'full-dev':
               return 'http://localhost:4000'
            case 'store-dev':
               const { origin } = new URL(
                  get(window, '_env_.' + 'DATA_HUB_HTTPS', '')
               )
               return origin
            default:
               return window.location.origin
         }
      }
      return env
   }
   return null
}
