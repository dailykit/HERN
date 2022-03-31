import { useQueryParamState } from './useQueryParamState'
import { isClient } from '.'
export const isKiosk = () => {
   const pathName = isClient ? window.location.pathname : ''

   return pathName.includes('/kiosk/')
}
