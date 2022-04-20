import React from 'react'
import { toast } from 'react-toastify'
import { TextButton } from '@dailykit/ui'

import axios from 'axios'

import { get_env } from '../../../shared/utils'

export function Revalidate({ cell = null, brandDetails = null }) {
   const brand = cell ? cell._cell.row.data : brandDetails
   const REVALIDATE_TOKEN = get_env('REVALIDATE_TOKEN')
   const [isRevalidating, setIsRevalidation] = React.useState(false)

   // revalidate api
   const revalidateHandler = async () => {
      if (
         window.confirm(
            `Are you sure you want to Publish New Version on this Brand - ${brand.title}?`
         )
      ) {
         setIsRevalidation(true)
         try {
            const origin = `https://${brand.domain}`

            const response = await axios({
               method: 'POST',
               url: `${origin}/api/revalidate`,
               headers: {
                  'Content-Type': 'application/json',
                  'revalidate-token': REVALIDATE_TOKEN,
               },
            })
            if (!response.status === 200) {
               toast.error('Something went wrong while publishing!')
               setIsRevalidation(false)
            }
            toast.success(
               `Successfully published new version for ${brand.title}`
            )
            setIsRevalidation(false)
         } catch (error) {
            toast.error('Something went wrong while publishing!')
            setIsRevalidation(false)
            console.error(error)
         }
      }
   }
   return (
      <TextButton
         isLoading={isRevalidating}
         type="solid"
         onClick={revalidateHandler}
         size="sm"
      >
         {isRevalidating ? 'Publishing...' : 'Publish New Version'}
      </TextButton>
   )
}
