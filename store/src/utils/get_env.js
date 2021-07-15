import get from 'lodash/get'

export const get_env = title => {
   const env = process.browser ? get(window, '_env_.' + title, '') : null
   return env
}
