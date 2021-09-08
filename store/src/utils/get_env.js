import get from 'lodash/get'

export const get_env = title => {
   if (process.browser) {
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
      const env = process.browser ? get(window, '_env_.' + title, '') : null
      return env
   }
   return null
}
