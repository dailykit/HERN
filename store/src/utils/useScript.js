import React from 'react'

import { isClient } from './isClient'

let cachedScripts = []

export const useScript = src => {
   const [state, setState] = React.useState({
      loaded: false,
      error: false,
   })

   React.useEffect(() => {
      if (cachedScripts.includes(src)) {
         setState({
            loaded: true,
            error: false,
         })
      } else {
         cachedScripts.push(src)
         let script = isClient ? document.createElement('script') : null
         script.src = src
         script.async = true

         const onScriptLoad = () => {
            setState({
               loaded: true,
               error: false,
            })
         }

         const onScriptError = () => {
            const index = cachedScripts.indexOf(src)
            if (index >= 0) cachedScripts.splice(index, 1)
            script.remove()
            setState({
               loaded: true,
               error: true,
            })
         }

         script.addEventListener('load', onScriptLoad)
         script.addEventListener('error', onScriptError)
         isClient && document.body.appendChild(script)

         return () => {
            script.removeEventListener('load', onScriptLoad)
            script.removeEventListener('error', onScriptError)
         }
      }
   }, [src])
   return [state.loaded, state.error]
}
