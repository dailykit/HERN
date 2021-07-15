import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { TunnelHeader } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { AssetUploader, Tooltip } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { UPDATE_RECIPE } from '../../../../../graphql'
import { TunnelBody } from '../styled'

const PhotoTunnel = ({ state, closeTunnel }) => {
   const [updateRecipe] = useMutation(UPDATE_RECIPE, {
      onCompleted: () => {
         toast.success('Image added!')
         closeTunnel(1)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const addImage = image => {
      updateRecipe({
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
            tooltip={<Tooltip identifier="recipe_assets_tunnel" />}
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

export default PhotoTunnel
