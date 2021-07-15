import React from 'react'
import { TunnelHeader, Flex } from '@dailykit/ui'
import {
   AssetUploader,
   Tooltip,
} from '../../../../../../../../../shared/components'
import { ModifiersContext } from '../../../../context/modifier'
import { TunnelBody } from '../../../styled'
import { useMutation } from '@apollo/react-hooks'
import { MODIFIER_OPTION } from '../../../../../../../graphql/modifiers'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

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
            <AssetUploader
               onAssetUpload={url => addImage(url)}
               onImageSelect={image => addImage(image)}
            />
         </TunnelBody>
      </>
   )
}

export default ModifierPhotoTunnel
