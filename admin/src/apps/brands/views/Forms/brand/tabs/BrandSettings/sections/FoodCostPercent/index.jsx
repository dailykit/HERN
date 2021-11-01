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

export const FoodCostPercent = ({ update }) => {
   const params = useParams()
   const [configTemplate, setConfigTemplate] = React.useState({})
   const [lowerLimit, setLowerLimit] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [upperLimit, setUpperLimit] = React.useState({
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
         identifier: { _eq: 'Food Cost Percent' },
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
               setConfigTemplate(configTemplate)
               setSettingId(id)
               return
            }
            const { brand, id, configTemplate } = brandSettings[index]
            setSettingId(id)
            setConfigTemplate(configTemplate)
            if ('lowerLimit' in brand.value || 'upperLimit' in brand.value) {
               setLowerLimit({
                  ...lowerLimit,
                  value: brand.value.lowerLimit,
               })
               setUpperLimit({
                  ...upperLimit,
                  value: brand.value.upperLimit,
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
            lowerLimit: +lowerLimit.value,
            upperLimit: +upperLimit.value,
         },
      })
   }, [lowerLimit, upperLimit, settingId])

   const onBlur = target => {
      const { name, value } = target
      const { isValid, errors } = validator.percentage(value)
      if (name === 'lowerLimit') {
         setLowerLimit({
            ...lowerLimit,
            meta: {
               isTouched: true,
               isValid,
               errors,
            },
         })
      }
      if (name === 'upperLimit') {
         setUpperLimit({
            ...upperLimit,
            meta: {
               isTouched: true,
               isValid,
               errors,
            },
         })
      }
   }

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id="Food Cost Percent">
         <ConfigTemplateUI config={configTemplate} />
      </div>
   )
}
