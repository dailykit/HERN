import React from 'react'
import qs from 'query-string'

export const useQueryParams = () => {
   const [params, setParams] = React.useState({})
   React.useEffect(() => {
      function track(fn, handler, before) {
         return function interceptor() {
            if (before) {
               handler.apply(this, arguments)
               return fn.apply(this, arguments)
            } else {
               var result = fn.apply(this, arguments)
               handler.apply(this, arguments)
               return result
            }
         }
      }

      var oldQs = location.search

      function handler() {
         console.log(
            'Query-string changed:',
            oldQs || '(empty)',
            '=>',
            location.search || '(empty)'
         )
         oldQs = location.search
         setParams(qs.parse(location.search))
      }

      // Assign listeners
      history.pushState = track(history.pushState, handler)
      history.replaceState = track(history.replaceState, handler)
      window.addEventListener('popstate', handler)
   }, [])
   return params
}

// import React from 'react'

// export const useQueryParams = () => {
//    const [params, setParams] = React.useState(null)

//    React.useEffect(() => {
//       if (window?.location?.search) {
//          const str = window.location.search.slice(1)
//          const paramsFound = {}
//          str.split('&').forEach(param => {
//             const [key, value] = param.split('=')
//             paramsFound[key] = value
//          })
//          setParams(paramsFound)
//       }
//    }, [])

//    return params
// }
