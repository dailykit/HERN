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
            case 'full-dev':
               return 'http://localhost:4000'
            case 'store-dev':
               const { origin } = new URL(
                  get(window, '_env_.' + 'DATA_HUB_HTTPS', '')
               )
               return origin
            default:
               return env
         }
      }
      return env
   }
   return null
}
