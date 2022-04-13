import React from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useLazyQuery } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { useInView } from 'react-intersection-observer'
import ConfigTemplateUI from '../../../../../shared/components/ConfigTemplateUI'
import { logger } from '../../../../../shared/utils'
import { BRANDS, BRAND_ID } from '../../../../brands/graphql'

export const SettingsCard = ({
   setting,
   title,
   isChangeSaved,
   setIsSavedChange,
   setIsComponentIsOnView,
   componentIsOnView,
   setMode,
   mode,
   saveAllSettings,
   setSaveAllSettings,
   alertShow,
   setAlertShow,
}) => {
   const [config, setConfig] = React.useState({})
   const params = useParams()
   const [setting_brand_Id, setBrandId] = React.useState('')
   const { ref, inView } = useInView({
      threshold: 0,
   })

   React.useEffect(() => {
      if (inView && !componentIsOnView.includes(title)) {
         setIsComponentIsOnView([...componentIsOnView, title])
      } else if (!inView && componentIsOnView.includes(title)) {
         const res = componentIsOnView.filter(i => i !== title)

         setIsComponentIsOnView([...res])
      }
   }, [inView, title])

   const [updateSetting] = useMutation(BRANDS.UPDATE_BRAND_SETTING, {
      onCompleted: () => {
         toast.success('Successfully updated brandSetting')
      },
      onError: error => {
         toast.error('Something went wrong!!')
         logger(error)
      },
   })
   React.useEffect(() => setConfig(setting?.config), [config])

   React.useEffect(() => {
      if (setting == [] && setting?.config == null) {
         updateSetting({
            variables: {
               object: {
                  brandId: params?.id,
                  brandSettingId: setting?.brandSetting?.id,
                  value: setting.configTemplate,
               },
            },
         })
      }
   }, [])

   //for updating previous changes
   React.useEffect(() => {
      if (saveAllSettings !== {} && isChangeSaved == false) {
         getBrandSettingId({
            variables: {
               identifier: { _eq: Object.keys(saveAllSettings)[0] },
            },
         })
      }
   }, [saveAllSettings, isChangeSaved])

   //from identifier getting brandId
   const [getBrandSettingId, { loading, brands_brand_brandSetting }] =
      useLazyQuery(BRAND_ID, {
         onCompleted: ({ brands_brand_brandSetting }) => {
            console.log(brands_brand_brandSetting, 'inside onComplted')
            setBrandId(brands_brand_brandSetting[0]?.brandSettingId)
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      })

   const saveInfo = () => {
      //saving changes in alert box(save changes button)
      if (
         saveAllSettings !== {} &&
         isChangeSaved == false &&
         setting_brand_Id
      ) {
         updateSetting({
            variables: {
               object: {
                  brandId: params?.id,
                  brandSettingId: setting_brand_Id,
                  value: saveAllSettings,
               },
            },
         })
         setAlertShow(true)
      } else {
         //normal updating setting(save button in each config)
         console.log({
            object: {
               brandId: params?.id,
               brandSettingId: setting?.brandSetting?.id,
               config: config,
            },
         })
         updateSetting({
            variables: {
               object: {
                  brandId: params?.id,
                  brandSettingId: setting?.brandSetting?.id,
                  value: config,
               },
            },
         })
      }
   }

   return (
      <div ref={ref} style={{ marginBottom: '1em' }}>
         <ConfigTemplateUI
            config={config}
            setConfig={setConfig}
            configSaveHandler={saveInfo}
            identifier={title}
            isChangeSaved={isChangeSaved}
            setIsSavedChange={setIsSavedChange}
            mode={mode}
            setMode={setMode}
            //all for alert box
            saveAllSettings={saveAllSettings}
            setSaveAllSettings={setSaveAllSettings}
            alertShow={alertShow}
         />
      </div>
   )
}
