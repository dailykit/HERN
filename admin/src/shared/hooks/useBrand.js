import React from 'react'
import { useLazyQuery, useQuery, useSubscription } from '@apollo/react-hooks'
import { SETTINGS_QUERY } from '../graphql'
import isEmpty from 'lodash/isEmpty'
import has from 'lodash/has'

export const useBrand = () => {
   const domainRef = React.useRef('')
   const identifiersRef = React.useRef([])
   const { refetch } = useQuery(SETTINGS_QUERY, {
      skip: !domainRef.current && identifiersRef.current.length === 0,
   })
   let settings = {}
   const configOf = React.useCallback(
      (identifier = '', localType = '') => {
         const type = localType
         if (isEmpty(settings)) return {}
         if (identifier && type && has(settings, type)) {
            return settings[type][identifier] || {}
         }
         return {}
      },
      [settings]
   )
   const fetchBrandSettings = async ({ domain, identifiers }) => {
      domainRef.current = domain
      identifiersRef.current = identifiers
      const { data } = await refetch({
         where: {
            brand: {
               _or: [{ domain: { _eq: domain } }, { isDefault: { _eq: true } }],
            },
            brandSetting: {
               identifier: {
                  _in: identifiers,
               },
            },
         },
      })

      if (data) {
         const brandId = data.settings[0].brandId
         settings = { brandId }
         data.settings.forEach(setting => {
            if (settings[setting.meta.type]) {
               settings[setting.meta.type][setting.meta.identifier] =
                  setting.value
            } else {
               settings[setting.meta.type] = {}
               settings[setting.meta.type][setting.meta.identifier] =
                  setting.value
            }
         })
      }

      return { settings, configOf }
   }

   return {
      fetchBrandSettings,
   }
}
