import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useSubscription, useMutation } from '@apollo/react-hooks'
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

export const TaxPercentage = () => {
   const params = useParams()
   const [config, setConfig] = React.useState({})

   const [settingId, setSettingId] = React.useState(null)
   const [updateSetting] = useMutation(BRANDS.UPDATE_BRAND_SETTING, {
      onCompleted: () => {
         toast.success('Successfully updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log('error', error)
         logger(error)
      },
   })

   const { loading: loadingSettings } = useSubscription(BRANDS.SETTING, {
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
            const { brand, id, configTemplate } = brandSettings[index]
            setSettingId(id)
            if (configTemplate !== null && brand.value === null) {
               updateSetting({
                  variables: {
                     object: {
                        brandId: params.id,
                        brandSettingId: id,
                        value: configTemplate,
                     },
                  },
               })
               setConfig(brand.value)
            } else {
               setConfig(brand.value)
            }
         }
      },
   })

   const {
      loading,
      error,
      data: { brandSettings = [] } = {},
   } = useSubscription(BRANDS.SETTINGS_TYPES)
   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }
   const saveInfo = () => {
      updateSetting({
         variables: {
            object: {
               brandId: params?.id,
               brandSettingId: settingId,
               value: config,
            },
         },
      })
   }
   return (
      <div id="Tax Percentage">
         <ConfigTemplateUI
            config={config}
            setConfig={setConfig}
            configSaveHandler={saveInfo}
         />
      </div>
   )
}
