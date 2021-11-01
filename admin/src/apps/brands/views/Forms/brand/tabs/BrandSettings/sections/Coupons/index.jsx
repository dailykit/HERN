import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { TextButton, Text, Spacer, Form } from '@dailykit/ui'

import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'
import ConfigTemplateUI from '../../../../../../../../../shared/components/ConfigTemplateUI'

export const Coupons = ({ update }) => {
   const params = useParams()
   const [settingId, setSettingId] = React.useState(null)
   const [isAvailable, setIsAvailable] = React.useState(false)
   const [configTemplate, setConfigTemplate] = React.useState({})
   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Coupons Availability' },
         type: { _eq: 'rewards' },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { brandSettings = [] } = {} } = {},
      }) => {
         if (!isEmpty(brandSettings)) {
            const index = brandSettings.findIndex(
               node => node?.brand?.brandId === Number(params.id)
            )

            if (index === -1) {
               const { id, configTemplate } = brandSettings[0]
               setSettingId(id)
               setConfigTemplate(configTemplate)
               return
            }
            const { brand, id, configTemplate } = brandSettings[index]
            setSettingId(id)
            setConfigTemplate(configTemplate)
            if ('isAvailable' in brand.value) {
               setIsAvailable(brand.value.isAvailable)
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      update({ id: settingId, value: { isAvailable } })
   }, [isAvailable, settingId])

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id="Coupons Availability">
         <ConfigTemplateUI config={configTemplate} />
      </div>
   )
}
