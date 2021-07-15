import React from 'react'
import { toast } from 'react-toastify'
import { useMutation } from '@apollo/react-hooks'
import { TunnelHeader, Flex } from '@dailykit/ui'
import { AssetUploader, Tooltip } from '../../../../../../../shared/components'
import { UPDATE_INGREDIENT } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'

const PhotoTunnel = ({ state, closeTunnel }) => {
   const [updateIngredient] = useMutation(UPDATE_INGREDIENT, {
      onCompleted: () => {
         toast.success('Image added!')
         closeTunnel(1)
      },
      onError: error => {
         toast.error('something went wrong!')
         logger(error)
      },
   })

   const addImage = image => {
      updateIngredient({
         variables: {
            id: state.id,
            set: {
               image: image.url,
            },
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title="Select Photo"
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="ingredient_assets_tunnel" />}
         />
         <Flex padding="0 16px">
            <AssetUploader
               onAssetUpload={url => addImage(url)}
               onImageSelect={image => addImage(image)}
            />
         </Flex>
      </>
   )
}

export default PhotoTunnel
