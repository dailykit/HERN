import { useState, useCallback } from 'react'
import qs from 'query-string'
import { useHistory, useLocation } from 'react-router-dom'

const useQueryParamState = (key, initialValue) => {
   const { search } = useLocation()
   const history = useHistory()
   const [value, setValue] = useState(qs.parse(search)[key] || initialValue)

   const onSetValue = useCallback(
      queryTerm => {
         const values = qs.parse(window.location.search)
         if (queryTerm) {
            setValue(queryTerm)
            const newQsValue = qs.stringify({ ...values, [key]: queryTerm })
            history.push(`?${newQsValue}`)
         }
      },
      [key, history]
   )
   const deleteQuery = useCallback(option => {
      const values = qs.parse(window.location.search)
      if (key === option) {
         const newQsValue = qs.stringify({ ...values, [key]: undefined })
         history.push({ search: `?${newQsValue}` })
      }
   })
   return [value, onSetValue, deleteQuery]
}

export default useQueryParamState
