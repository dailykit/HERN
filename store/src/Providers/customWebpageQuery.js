import React, { useEffect } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { Loader } from '@dailykit/ui'
import { BRAND_PAGE_MODULE } from '../graphql'
import { formatWebRendererData } from '../utils'

export const useCustomWebpageModuleQuery = variables => {
   const [webpageModule, setWebPageModule] = React.useState(null)
   useQuery(BRAND_PAGE_MODULE, {
      variables,
      onCompleted: async ({ content_experienceDivId }) => {
         const result = await formatWebRendererData(content_experienceDivId)
         console.log('customResult', result)
         setWebPageModule(result)
      },
      onError: error => {
         console.log(error)
      }
   })
   return webpageModule
}
