import get from 'lodash/get'

const isClient = typeof window !== 'undefined' && window.document ? true : false

export const get_env = title => {
   if (!get(window, '_env_')) {
      const hostName = window.location.hostname

      let getEnvUrl

      if (hostName === 'localhost') {
         getEnvUrl = `http://${hostName}:4000/server/api/envs`
      } else {
         getEnvUrl = `https://${hostName}/server/api/envs`
      }
      fetch(getEnvUrl, {
         method: 'POST',
      }).then(() => {
         window.location.reload()
      })
   }

   return isClient ? get(window, '_env_.' + title, '') : null
}
