import React, { useContext } from 'react'
import { TunnelHeader, Tunnel, Tunnels } from '@dailykit/ui'
import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { TunnelBody } from './style'
import { UPDATE_WEBPAGE } from '../../../../../graphql'
import {
   Banner,
   ConfigTemplateUI,
} from '../../../../../../../shared/components'
import { BrandContext } from '../../../../../../../App'

export default function AnimationSettingTunnel({
   tunnels,
   closeTunnel,
   brandPage,
}) {
   const [brandContext, setBrandContext] = useContext(BrandContext)
   const [isChangeSaved, setIsSavedChange] = React.useState(true)
   const [mode, setMode] = React.useState('save')
   const [saveAllSettings, setSaveAllSettings] = React.useState({})
   const [alertShow, setAlertShow] = React.useState(false)
   const [config, setConfig] = React.useState({})

   const [updatePage] = useMutation(UPDATE_WEBPAGE, {
      onCompleted: () => {
         toast.success('Successfully updated productSetting')
      },
      onError: error => {
         toast.error('Something went wrong!!')
         console.error(error)
      },
   })

   const saveInfo = () => {
      //saving changes in alert box(save changes button)
      console.log('save changes', brandPage)

      if (saveAllSettings !== {} && isChangeSaved == false && brandPage?.id) {
         updatePage({
            variables: {
               pageId: brandPage?.id,
               set: {
                  animationConfig: config,
               },
            },
         })
         setAlertShow(true)
      } else {
         updatePage({
            variables: {
               pageId: brandPage?.id,
               set: {
                  animationConfig: config,
               },
            },
         })
      }
   }

   React.useEffect(() => {
      if (brandPage && brandPage.animationConfig) {
         setConfig(brandPage.animationConfig)
      }
   }, [brandPage.animationConfig])

   return (
      <div>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="full">
               <TunnelHeader
                  title="Animation Settings"
                  close={() => closeTunnel(1)}
               />
               <Banner id="content-app-pages-page-details-page-preview-tunnel-top" />
               <TunnelBody>
                  <ConfigTemplateUI
                     config={config}
                     setConfig={setConfig}
                     configSaveHandler={saveInfo}
                     identifier="Animation"
                     isChangeSaved={isChangeSaved}
                     setIsSavedChange={setIsSavedChange}
                     mode={mode}
                     setMode={setMode}
                     //all for alert box
                     saveAllSettings={saveAllSettings}
                     setSaveAllSettings={setSaveAllSettings}
                     alertShow={alertShow}
                  />
               </TunnelBody>
               <Banner id="content-app-pages-page-details-page-preview-tunnel-bottom" />
            </Tunnel>
         </Tunnels>
      </div>
   )
}
