import { useMutation } from '@apollo/react-hooks'
import { Flex, TunnelHeader } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import {
   AssetUploader,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils/errorLog'
import { GENERAL_ERROR_MESSAGE } from '../../../../../constants/errorMessages'
import { BULK_ITEM_IMAGE_ADDED } from '../../../../../constants/successMessages'
import { UPDATE_BULK_ITEM } from '../../../../../graphql'

export default function PhotoTunnel({ close, bulkItemId }) {
   const [udpateBulkItem, { loading }] = useMutation(UPDATE_BULK_ITEM, {
      onCompleted: () => {
         close(1)

         toast.info(BULK_ITEM_IMAGE_ADDED)
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
         close(1)
      },
   })

   const addImage = ({ url }) => {
      udpateBulkItem({
         variables: {
            id: bulkItemId,
            object: {
               image: url,
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
            description="select an image for this bulk item"
            tooltip={
               <Tooltip identifier="supplier_item_form_add_image_for _bulkItem_tunnel" />
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
