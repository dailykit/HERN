import React from 'react'
import { TunnelHeader } from '@dailykit/ui'
import {
   AssetUploader,
   Tooltip,
   Banner,
} from '../../../../../../../shared/components'
import { TunnelBody } from '../styled'
import { useMutation } from '@apollo/react-hooks'
import { INSTRUCTION_STEP } from '../../../../../graphql'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../shared/utils'

const StepPhotoTunnel = ({ stepId, closeTunnel }) => {
   // Mutation
   const [updateInstructionStep] = useMutation(INSTRUCTION_STEP.UPDATE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const addImage = image => {
      updateInstructionStep({
         variables: {
            id: stepId,
            set: {
               assets: {
                  images: [image],
                  videos: [],
               },
            },
         },
      })
      closeTunnel(1)
   }

   return (
      <>
         <TunnelHeader
            title="Select Photo"
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="cooking_step_photo_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-recipes-create-recipe-cooking-step-photo-tunnel-top" />
            <AssetUploader
               onAssetUpload={url => addImage(url)}
               onImageSelect={image => addImage(image)}
            />
            <Banner id="products-app-recipes-create-recipe-cooking-step-photo-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default StepPhotoTunnel
