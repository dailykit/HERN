import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { TextButton, Text, Spacer, Toggle, Form } from '@dailykit/ui'

import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'
import ConfigTemplateUI from '../../../../../../../../../shared/components/ConfigTemplateUI'

export const Payments = ({ update }) => {
   const params = useParams()
   const [settingId, setSettingId] = React.useState(null)
   const [isStoreLive, setIsStoreLive] = React.useState(false)
   const [configTemplate, setConfigTemplate] = React.useState({})
   const [isStripeConfigured, setIsStripeConfigured] = React.useState(false)
   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Store Live' },
         type: { _eq: 'availability' },
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
               setConfigTemplate(configTemplate)
               setSettingId(id)
               return
            }
            const { brand, id, configTemplate } = brandSettings[index]
            setConfigTemplate(configTemplate)
            setSettingId(id)
            if ('isStoreLive' in brand.value) {
               setIsStoreLive(brand.value.isStoreLive)
            }
            if ('isStripeConfigured' in brand.value) {
               setIsStripeConfigured(brand.value.isStripeConfigured)
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      update({ id: settingId, value: { isStoreLive, isStripeConfigured } })
   }, [isStoreLive, isStripeConfigured, settingId])

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id="Store Live">
         <ConfigTemplateUI config={configTemplate} />
      </div>
   )
}
