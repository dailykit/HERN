import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { TextButton, Text, Spacer, Form } from '@dailykit/ui'
import validator from '../../../../../../validator'

import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { logger } from '../../../../../../../../../shared/utils'
import ConfigTemplateUI from '../../../../../../../../../shared/components/ConfigTemplateUI'

export const TaxPercentage = ({ update }) => {
   const params = useParams()
   const [configTemplate, setConfigTemplate] = React.useState({})
   const [tax, setTax] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })

   const [settingId, setSettingId] = React.useState(null)
   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Tax Percentage' },
         type: { _eq: 'sales' },
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
            if ('value' in brand.value) {
               setTax({
                  ...tax,
                  value: brand.value.value,
               })
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      if (!settingId) return
      update({
         id: settingId,
         value: {
            value: +tax.value,
         },
      })
   }, [tax, settingId])

   const onBlur = target => {
      const { value } = target
      const { isValid, errors } = validator.percentage(value)
      setTax({
         ...tax,
         meta: {
            isTouched: true,
            isValid,
            errors,
         },
      })
   }

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id="Tax Percentage">
         <ConfigTemplateUI config={configTemplate} />
      </div>
   )
}
