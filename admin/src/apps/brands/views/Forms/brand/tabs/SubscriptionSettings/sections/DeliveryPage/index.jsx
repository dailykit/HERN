import React from 'react'
import { isEmpty, isNull } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import {
   Text,
   IconButton,
   PlusIcon,
   TextButton,
   Spacer,
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

export const DeliveryPage = ({ update }) => {
   const params = useParams()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [form, setForm] = React.useState({
      backgroundColor: '#f7f7f7',
      backgroundImage: '',
   })
   const [settingId, setSettingId] = React.useState(null)
   const { loading, error } = useSubscription(BRANDS.SUBSCRIPTION_SETTING, {
      variables: {
         identifier: { _eq: 'select-delivery-background' },
         type: { _eq: 'Select-Delivery' },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { subscriptionSetting = [] } = {} } = {},
      }) => {
         if (!isEmpty(subscriptionSetting)) {
            const index = subscriptionSetting.findIndex(
               node => node?.brand?.brandId === Number(params.id)
            )

            if (index === -1) {
               const { id } = subscriptionSetting[0]
               setSettingId(id)
               return
            }
            const { brand, id } = subscriptionSetting[index]
            setSettingId(id)
            if (!isNull(brand) && !isEmpty(brand)) {
               setForm(form => ({
                  ...form,
                  ...(brand.value?.background && {
                     ...(brand.value?.background?.color && {
                        backgroundColor: brand.value.background.color,
                     }),
                     ...(brand.value?.background?.image && {
                        backgroundImage: brand.value.background.image,
                     }),
                  }),
               }))
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      if (!settingId) return
      update({
         id: settingId,
         value: {
            background: {
               color: form.backgroundColor,
               image: form.backgroundImage,
            },
         },
      })
   }, [form, settingId, update])

   const handleChange = (name, value) => {
      setForm(form => ({ ...form, [name]: value }))
      closeTunnel(1)
   }

   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }
   if (loading) return <InlineLoader />

   return (
      <div id="select-delivery-background">
         <Flex container alignItems="center">
            <Text as="h3">Delivery Page Background</Text>
            <Tooltip identifier="brand_deliveryBackground_info" />
         </Flex>
         <Spacer size="24px" />
         <Flex container alignItems="center">
            <Text as="p">Background Color</Text>
            <Tooltip identifier="brand_deliveryBackground_color_info" />
         </Flex>
         <Spacer size="8px" />
         <input
            type="color"
            name="backgroundColor"
            value={form.backgroundColor}
            onChange={e => handleChange('backgroundColor', e.target.value)}
         />
         <Spacer size="16px" />
         <ImageItem
            alt="Background Image"
            title="Background Image"
            image={form.backgroundImage}
            openTunnel={openTunnel}
         />
         <Spacer size="24px" />
         <TextButton size="sm" type="outline" onClick={updateSetting}>
            Update
         </TextButton>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <TunnelHeader title="Add Image" close={() => closeTunnel(1)} />
               <Banner id="brands-app-brands-brand-details-subscription-settings-delivery-page-bg-tunnel-top" />
               <Flex padding="16px">
                  <AssetUploader
                     onAssetUpload={data =>
                        handleChange('backgroundImage', data?.url || '')
                     }
                     onImageSelect={data =>
                        handleChange('backgroundImage', data?.url || '')
                     }
                  />
               </Flex>
               <Banner id="brands-app-brands-brand-details-subscription-settings-delivery-page-bg-tunnel-bottom" />
            </Tunnel>
         </Tunnels>
      </div>
   )
}

const ImageItem = ({ image, title, alt, openTunnel }) => {
   return (
      <Flex>
         <Text as="p">{title}</Text>
         <Spacer size="12px" />
         {image ? (
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
               <img src={image} alt={alt} />
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
      </Flex>
   )
}
