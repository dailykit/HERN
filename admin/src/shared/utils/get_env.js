import get from 'lodash/get'

const isClient = typeof window !== 'undefined' && window.document ? true : false

export const get_env = title => {
   return isClient ? get(window, '_env_.' + title, '') : null
}
