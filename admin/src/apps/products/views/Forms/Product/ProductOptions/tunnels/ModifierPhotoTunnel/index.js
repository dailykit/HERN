import React from 'react'
import { TunnelHeader, Flex } from '@dailykit/ui'
import {
   AssetUploader,
   Tooltip,
   Banner,
} from '../../../../../../../../shared/components'
import { ModifiersContext } from '../../../../../../context/product/modifiers'
import { TunnelBody } from '../../../tunnels/styled'
import { useMutation } from '@apollo/react-hooks'
import { MODIFIER_OPTION } from '../../../../../../graphql/modifiers'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../shared/utils'

const ModifierPhotoTunnel = ({ close }) => {
   const {
      modifiersState: { optionId },
   } = React.useContext(ModifiersContext)

   const [updateOption] = useMutation(MODIFIER_OPTION.UPDATE, {
      onCompleted: () => {
         toast.success('Updated!')
         close(5)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const addImage = image => {
      if (image?.url) {
         updateOption({
            variables: {
               id: optionId,
               _set: {
                  image: image.url,
               },
            },
         })
      }
   }

   return (
      <>
         <TunnelHeader
            title="Select Photo"
            close={() => close(5)}
            tooltip={<Tooltip identifier="modifier_option_photo_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-single-product-modifier-option-photo-tunnel-top" />
            <AssetUploader
               onAssetUpload={url => addImage(url)}
               onImageSelect={image => addImage(image)}
            />
            <Banner id="products-app-single-product-modifier-option-photo-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default ModifierPhotoTunnel
