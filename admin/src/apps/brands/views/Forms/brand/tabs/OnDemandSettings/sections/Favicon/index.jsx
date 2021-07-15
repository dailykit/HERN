import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import {
   Text,
   IconButton,
   Spacer,
   PlusIcon,
   Tunnels,
   Tunnel,
   TunnelHeader,
   useTunnel,
} from '@dailykit/ui'

import { ImageContainer } from '../styled'
import { BRANDS } from '../../../../../../../graphql'
import { EditIcon } from '../../../../../../../../../shared/assets/icons'
import {
   Flex,
   AssetUploader,
   Tooltip,
   InlineLoader,
   Banner,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

export const Favicon = ({ update }) => {
   const params = useParams()
   const [url, setUrl] = React.useState('')
   const [settingId, setSettingId] = React.useState(null)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const { loading, error } = useSubscription(BRANDS.ONDEMAND_SETTING, {
      variables: {
         identifier: { _eq: 'Favicon' },
         type: { _eq: 'visual' },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { storeSettings = [] } = {} } = {},
      }) => {
         if (!isEmpty(storeSettings)) {
            const index = storeSettings.findIndex(
               node => node?.brand?.brandId === Number(params.id)
            )

            if (index === -1) {
               const { id } = storeSettings[0]
               setSettingId(id)
               return
            }
            const { brand, id } = storeSettings[index]
            setSettingId(id)
            if ('url' in brand.value) {
               setUrl(brand.value.url)
            }
         }
      },
   })

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   const updateSetting = (data = {}) => {
      if ('url' in data) {
         update({ id: settingId, value: { url: data.url } })
      }
      closeTunnel(1)
   }

   return (
      <div id="Favicon">
         <Flex container alignItems="flex-start">
            <Text as="h3">Fav Icon</Text>
            <Tooltip identifier="brand_favicon_info" />
         </Flex>
         <Spacer size="16px" />
         {url ? (
            <ImageContainer width="120px" height="120px">
               <div>
                  <IconButton
                     size="sm"
                     type="solid"
                     onClick={() => openTunnel(1)}
                  >
                     <EditIcon />
                  </IconButton>
               </div>
               <img src={url} alt="Favicon" />
            </ImageContainer>
         ) : (
            <ImageContainer width="120px" height="120px" noThumb>
               <div>
                  <IconButton
                     size="sm"
                     type="solid"
                     onClick={() => openTunnel(1)}
                  >
                     <PlusIcon />
                  </IconButton>
               </div>
            </ImageContainer>
         )}
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <TunnelHeader title="Add Favicon" close={() => closeTunnel(1)} />
               <Banner id="brands-app-brands-brand-details-fav-icon-tunnel-top" />
               <Flex padding="16px">
                  <AssetUploader
                     onAssetUpload={data => updateSetting(data)}
                     onImageSelect={data => updateSetting(data)}
                  />
               </Flex>
               <Banner id="brands-app-brands-brand-details-fav-icon-tunnel-bottom" />
            </Tunnel>
         </Tunnels>
      </div>
   )
}
