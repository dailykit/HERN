import get from 'lodash/get'
import { isClient } from './useUtils'

export const get_env = title => {
   const env = isClient ? get(window, '_env_.' + title, '') : null
   return env
}
