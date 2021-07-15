export const getRoute = route => {
   if (process.env.NODE_ENV === 'development') {
      return `/localhost4000${route}`
   }
   return route
}
