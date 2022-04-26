import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { useInView } from 'react-intersection-observer'
import ConfigTemplateUI from '../../../../../components/ConfigTemplateUI'
import { PAYMENT_OPTIONS } from '../../../../../../apps/brands/graphql'
import { logger } from '../../../../../utils'

export const SettingsCard = ({
   option,
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
   creds,
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

   const [updateCreds] = useMutation(PAYMENT_OPTIONS.UPDATE_CREDS, {
      onCompleted: () => {
         toast.success('Successfully updated Env')
      },
      onError: error => {
         console.log(error)
         toast.error('Something went wrong!!')
         logger(error)
      },
   })
   React.useEffect(
      () =>
         setConfig(
            creds === 'privateCreds'
               ? option?.privateCreds
               : option?.publicCreds
         ),
      [config]
   )

   //    React.useEffect(() => {
   //       if (option == [] && option?.privateCreds == null) {
   //          updateCreds({
   //             variables: {
   //                _set: {
   //                   privateCreds: option.privateCreds,
   //                },
   //                id: option.id,
   //             },
   //          })
   //       }
   //    }, [])

   const saveInfo = () => {
      //saving changes in alert box(save changes button)
      if (
         saveAllSettings !== {} &&
         isChangeSaved == false &&
         setting_brand_Id
      ) {
         if (creds == 'privateCreds') {
            updateCreds({
               variables: {
                  id: option.id,
                  _set: { privateCreds: saveAllSettings },
               },
            })
         } else {
            updateCreds({
               variables: {
                  id: option.id,
                  _set: { publicCreds: saveAllSettings },
               },
            })
         }
         setAlertShow(true)
      } else {
         //normal updating option(save button in each config)
         if (creds == 'privateCreds') {
            updateCreds({
               variables: {
                  id: option.id,
                  _set: { privateCreds: config },
               },
            })
         } else {
            updateCreds({
               variables: {
                  id: option.id,
                  _set: { publicCreds: config },
               },
            })
         }
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
