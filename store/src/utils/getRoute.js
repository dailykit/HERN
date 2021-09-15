export const getRoute = route => {
   if (process.env.NODE_ENV === 'development') {
      return `/test${route}`
   }
   return route
}
