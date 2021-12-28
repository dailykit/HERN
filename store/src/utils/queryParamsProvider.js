import qs from 'query-string'
import { isClient } from '.'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'

export const useQueryParamState = (key, initialValue) => {
   const router = useRouter()

   const search = isClient ? window.location.search : ''
   let queryParams = new URLSearchParams(search)

   const [value, setValue] = useState(qs.parse(search)[key] || initialValue)

   const onSetValue = useCallback(
      queryTerm => {
         if (queryTerm) {
            setValue(queryTerm)
            // Set new or modify existing page value
            queryParams.set(key, queryTerm)
            // Replace current querystring with the new one
            history.pushState(null, null, '?' + queryParams.toString())
         }
      },
      [key, router]
   )
   const deleteQuery = useCallback(option => {
      // const values = qs.parse(window.location.search)
      if (key === option) {
         // const newQsValue = qs.stringify({ ...values, [key]: undefined })
         // router.push({ search: `?${newQsValue}` })
         // Set new or modify existing page value
         setValue(initialValue)
         queryParams.delete(key)
         // Replace current querystring with the new one
         history.pushState(null, null, '?' + queryParams.toString())
      }
   })
   return [value, onSetValue, deleteQuery]
}

export default useQueryParamState
