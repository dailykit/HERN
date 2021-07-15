import { useMutation } from '@apollo/react-hooks'
import { Flex, TunnelHeader } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import {
   AssetUploader,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { GENERAL_ERROR_MESSAGE } from '../../../../../constants/errorMessages'
import { UPDATE_PACKAGING } from '../../../../../graphql'

export default function PhotoTunnel({ close, state }) {
   const [updatePackaging, { loading }] = useMutation(UPDATE_PACKAGING, {
      onCompleted: () => {
         close(1)
         toast.info('Packaging Image added !')
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
         close(1)
      },
   })

   const addImage = ({ url }) => {
      const oldImages = state.images && state.images.length ? state.images : []
      updatePackaging({
         variables: {
            id: state.id,
            object: {
               assets: {
                  images: [url, ...oldImages],
               },
            },
         },
      })
   }

   if (loading) return <InlineLoader />

   return (
      <>
         <TunnelHeader
            title="Select Image"
            close={() => close(1)}
            description="select an image for this packaging"
            tooltip={
               <Tooltip identifier="packaging_form-image_select_tunnel" />
            }
         />
         <Flex padding="0 14px">
            <AssetUploader
               onAssetUpload={url => addImage(url)}
               onImageSelect={image => addImage(image)}
            />
         </Flex>
      </>
   )
}
