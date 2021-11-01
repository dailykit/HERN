import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { TextButton, Text, Spacer, Toggle, Input, Form } from '@dailykit/ui'
import validator from '../../../../../../validator'
import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'
import ConfigTemplateUI from '../../../../../../../../../shared/components/ConfigTemplateUI'

export const Store = ({ update }) => {
   const params = useParams()
   const [configTemplate, setConfigTemplate] = React.useState({})
   const [settingId, setSettingId] = React.useState(null)
   const [isOpen, setIsOpen] = React.useState(false)
   const [from, setFrom] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [to, setTo] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [message, setMessage] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Store Availability' },
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
               setSettingId(id)
               setConfigTemplate(configTemplate)
               return
            }
            const { brand, id, configTemplate } = brandSettings[index]
            setSettingId(id)
            setConfigTemplate(configTemplate)
            if ('isOpen' in brand.value) {
               setIsOpen(brand.value.isOpen)
            }
            if ('shutMessage' in brand.value) {
               setMessage({
                  value: brand.value.shutMessage,
                  meta: {
                     isValid: true,
                     isTouched: false,
                     errors: [],
                  },
               })
            }
            if ('from' in brand.value) {
               setFrom({
                  value: brand.value.from,
                  meta: {
                     isValid: true,
                     isTouched: false,
                     errors: [],
                  },
               })
            }
            if ('to' in brand.value) {
               setTo({
                  value: brand.value.to,
                  meta: {
                     isValid: true,
                     isTouched: false,
                     errors: [],
                  },
               })
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      if (message.meta.isValid) {
         update({
            id: settingId,
            value: {
               to: to.value,
               from: from.value,
               isOpen: isOpen.value,
               shutMessage: message.value,
            },
         })
      } else {
         toast.error('Store Availability Options must be provided')
      }
   }, [isOpen, from, to, message, settingId])

   const onBlur = e => {
      const { name, value } = e.target
      switch (name) {
         case 'from':
            return setFrom({
               ...from,
               meta: {
                  ...from.meta,
                  isTouched: true,
                  errors: validator.time(value).errors,
                  isValid: validator.time(value).isValid,
               },
            })
         case 'to':
            return setTo({
               ...to,
               meta: {
                  ...to.meta,
                  isTouched: true,
                  errors: validator.time(value).errors,
                  isValid: validator.time(value).isValid,
               },
            })
         case 'shut-message':
            return setMessage({
               ...message,
               meta: {
                  ...message.meta,
                  isTouched: true,
                  errors: validator.text(value).errors,
                  isValid: validator.text(value).isValid,
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
      <div id="Store Availability">
         <ConfigTemplateUI config={configTemplate} />
      </div>
   )
}
