import React from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useLazyQuery } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { useInView } from 'react-intersection-observer'
import ConfigTemplateUI from '../../../../../shared/components/ConfigTemplateUI'
import { logger } from '../../../../../shared/utils'
import { ENVS } from '../../../graphql'

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

   const [updateSetting] = useMutation(ENVS.UPDATE, {
      onCompleted: () => {
         toast.success('Successfully updated Env')
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
               _set: {
                  config: setting.config,
               },
               id: setting.id,
            },
         })
      }
   }, [])

   const saveInfo = () => {
      //saving changes in alert box(save changes button)
      if (
         saveAllSettings !== {} &&
         isChangeSaved == false &&
         setting_brand_Id
      ) {
         updateSetting({
            variables: {
               id: setting.id,
               _set: { config: saveAllSettings },
            },
         })
         setAlertShow(true)
      } else {
         //normal updating setting(save button in each config)
         console.log({
            id: setting.id,
            _set: { config: config },
         })
         updateSetting({
            variables: {
               id: setting.id,
               _set: { config: config },
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
