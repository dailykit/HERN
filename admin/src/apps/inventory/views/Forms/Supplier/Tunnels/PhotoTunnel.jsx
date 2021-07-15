import { useMutation } from '@apollo/react-hooks'
import { Flex, TunnelHeader } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import {
   AssetUploader,
   Banner,
   InlineLoader,
   Tooltip,
} from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import { GENERAL_ERROR_MESSAGE } from '../../../../constants/errorMessages'
import { SUPPLIER_IMAGE_ADDED } from '../../../../constants/successMessages'
import { UPDATE_SUPPLIER } from '../../../../graphql'

export default function PhotoTunnel({ close, formState }) {
   const [updateSupplier, { loading }] = useMutation(UPDATE_SUPPLIER, {
      onCompleted: () => {
         toast.info(SUPPLIER_IMAGE_ADDED)
         close(1)
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
         close(1)
      },
   })

   const addImage = ({ url }) => {
      updateSupplier({
         variables: {
            id: formState.id,
            object: {
               contactPerson: { ...formState.contactPerson, imageUrl: url },
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
            description="select a photo for the person of contact"
            tooltip={
               <Tooltip identifier="suppliers_form_view_add_personOfContact_photo_tunnel_header" />
            }
         />
         <Banner id="inventory-apps-suppliers-person-of-contact-photo-tunnel-top" />
         <Flex padding="0 14px">
            <AssetUploader
               onAssetUpload={url => addImage(url)}
               onImageSelect={image => addImage(image)}
            />
         </Flex>
         <Banner id="inventory-apps-suppliers-person-of-contact-photo-tunnel-bottom" />
      </>
   )
}
