import { useEffect, useState } from 'react'
import { get_env } from '../../../../shared/utils'

const DATAHUB = get_env('REACT_APP_DATA_HUB_URI')

export default function useOrganizationBalance(accountId) {
   const [data, setData] = useState()
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState()

   useEffect(() => {
      const abortController = new window.AbortController()

      if (accountId) {
         const url = `${new URL(DATAHUB).origin}/api/balance`

         fetch(`${url}?accountId=${accountId}`, {
            signal: abortController.signal,
         })
            .then(x => x.json())
            .then(res => {
               setLoading(false)
               setData(res.data)
            })
            .catch(error => setError(error))
      }

      return function cancelFetch() {
         abortController.abort()
      }
   }, [accountId])

   return { loading, data, error }
}
