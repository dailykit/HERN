// source: https://usehooks.com/useOnClickOutside/

import { useEffect } from 'react'

import { isClient } from './isClient'

export const useOnClickOutside = (ref, handler) => {
   useEffect(() => {
      const listener = event => {
         if (!ref.current || ref.current.contains(event.target)) {
            return
         }
         handler(event)
      }

      if (isClient) {
         isClient && document.addEventListener('mousedown', listener)
         isClient && document.addEventListener('touchstart', listener)
      }

      return () => {
         if (isClient) {
            isClient && document.removeEventListener('mousedown', listener)
            isClient && document.removeEventListener('touchstart', listener)
         }
      }
   }, [ref, handler])
}
