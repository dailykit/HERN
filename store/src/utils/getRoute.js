import { isClient } from './isClient'

export const getRoute = route => {
   // const host = isClient ? window.location.host : ''
   // if (process.env.NODE_ENV === 'development' && host === 'localhost:3000') {
   //    return `/test${route}`
   // }
   return route
}
