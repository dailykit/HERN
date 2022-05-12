import { isClient } from './isClient'
export const isKiosk = () => {
   const pathName = isClient ? window.location.pathname : ''
   return pathName.includes('/kiosk/')
}
