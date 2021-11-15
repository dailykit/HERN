import React from 'react'

export const useQueryParams = () => {
   const [params, setParams] = React.useState(null)

   React.useEffect(() => {
      if (window?.location?.search) {
         const str = window.location.search.slice(1)
         const paramsFound = {}
         str.split('&').forEach(param => {
            const [key, value] = param.split('=')
            paramsFound[key] = value
         })
         setParams(paramsFound)
      }
   }, [])

   return params
}
