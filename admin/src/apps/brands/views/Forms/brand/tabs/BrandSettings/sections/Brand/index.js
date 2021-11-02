import React from 'react'
import { toast } from 'react-toastify'
import 'antd/dist/antd.css'
import { isEmpty, groupBy } from 'lodash'
import { useParams } from 'react-router-dom'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { BRANDS } from '../../../../../../../graphql'
import validator from '../../../../../../validator'
import { logger } from '../../../../../../../../../shared/utils'

import ConfigTemplateUI from '../../../../../../../../../shared/components/ConfigTemplateUI'

export const Brand = () => {
   const params = useParams()
   const [settings, setSettings] = React.useState({})
   const [settingId, setSettingId] = React.useState(null)
   const [config, setConfig] = React.useState({})

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
         identifier: { _eq: 'Contact' },
         type: { _eq: 'brand' },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { brandSettings = [] } = {} } = {},
      }) => {
         if (!isEmpty(brandSettings)) {
            const index = brandSettings.findIndex(
               node => node?.brand?.brandId === Number(params.id)
            )

            if (index === -1) {
               const { id, brand } = brandSettings[0]
               if (brand.value === null) {
                  updateSetting({
                     variables: {
                        object: {
                           brandId: params.id,
                           brandSettingId: id,
                           value: config,
                        },
                     },
                  })
                  setConfig(brand.value)
               } else {
                  setConfig(brand.value)
               }
               setSettingId(id)
               return
            }
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
   // React.useEffect(() => {
   //    if (!loading && !isEmpty(brandSettings)) {
   //       const grouped = groupBy(brandSettings, 'type')

   //       Object.keys(grouped).forEach(key => {
   //          grouped[key] = grouped[key].map(node => node.identifier)
   //       })
   //       setSettings(grouped)
   //    }
   // }, [loading, brandSettings])

   //    React.useEffect(() => {
   //     updateSetting({
   //         variables: {
   //            object: {
   //               brandId: params?.id,
   //               brandSettingId: settingId,
   //               value: config,
   //            },
   //         },
   //      })
   //    }, [])

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
      <div>
         <ConfigTemplateUI
            config={config}
            setConfig={setConfig}
            configSaveHandler={saveInfo}
         />
      </div>
   )
}
