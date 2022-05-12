import React from 'react'
import { isClient } from './isClient'

export const useWindowOnload = () => {
   const [isWindowLoading, setWindowLoading] = React.useState(true)

   React.useEffect(() => {
      const handleWindowLoad = () => {
         setWindowLoading(false)
      }
      if (isClient) {
         window.addEventListener('load', handleWindowLoad)
      }

      return () => {
         if (isClient) {
            window.removeEventListener('load', handleWindowLoad)
         }
      }
   }, [])
   return { isWindowLoading }
}
