import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { TextButton, Text, Spacer, Form } from '@dailykit/ui'
import validator from '../../../../../../../validator'
import { BRANDS } from '../../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../../shared/utils'
import ConfigTemplateUI from '../../../../../../../../../../shared/components/ConfigTemplateUI'

const LoyaltyPointsUsage = ({ update }) => {
   const params = useParams()
   const [settingId, setSettingId] = React.useState(null)
   const [configTemplate, setConfigTemplate] = React.useState({})
   const [conversionRate, setConversionRate] = React.useState({
      value: 1,
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [percentage, setPercentage] = React.useState({
      value: 1,
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [max, setMax] = React.useState({
      value: 1,
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Loyalty Points Usage' },
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
            if ('conversionRate' in brand.value) {
               setConversionRate({
                  value: brand.value.conversionRate,
                  meta: {
                     isValid: true,
                     isTouched: false,
                     errors: [],
                  },
               })
            }
            if ('percentage' in brand.value) {
               setPercentage({
                  value: brand.value.percentage,
                  meta: {
                     isValid: true,
                     isTouched: false,
                     errors: [],
                  },
               })
            }
            if ('max' in brand.value) {
               setMax({
                  value: brand.value.max,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               })
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      if (
         conversionRate.meta.isValid &&
         percentage.meta.isValid &&
         max.meta.isValid
      ) {
         update({
            id: settingId,
            value: {
               conversionRate: conversionRate.value,
               percentage: percentage.value,
               max: max.value,
            },
         })
      } else {
         toast.error('Must provide all loyalty points usage options!!')
      }
   }, [conversionRate, percentage, max, settingId])

   const onBlur = e => {
      const { name, value } = e.target
      switch (name) {
         case 'conversionRate':
            return setConversionRate({
               ...conversionRate,
               meta: {
                  ...conversionRate.meta,
                  isTouched: true,
                  errors: validator.amount(value).errors,
                  isValid: validator.amount(value).isValid,
               },
            })
         case 'percentage':
            return setPercentage({
               ...percentage,
               meta: {
                  ...percentage.meta,
                  isTouched: true,
                  errors: validator.amount(value).errors,
                  isValid: validator.amount(value).isValid,
               },
            })
         case 'maxAmount':
            return setMax({
               ...max,
               meta: {
                  ...max.meta,
                  isTouched: true,
                  errors: validator.amount(value).errors,
                  isValid: validator.amount(value).isValid,
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
      <div id="Loyalty Points Availability">
         <ConfigTemplateUI config={configTemplate} />
      </div>
   )
}

export default LoyaltyPointsUsage
