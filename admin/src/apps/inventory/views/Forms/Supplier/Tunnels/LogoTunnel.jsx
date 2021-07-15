import { useMutation } from '@apollo/react-hooks'
import { Flex, TunnelHeader } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import {
   AssetUploader,
   InlineLoader,
   Tooltip,
} from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import { GENERAL_ERROR_MESSAGE } from '../../../../constants/errorMessages'
import { SUPPLIER_LOGO_ADDED } from '../../../../constants/successMessages'
import { UPDATE_SUPPLIER } from '../../../../graphql'

export default function LogoTunnel({ close, formState }) {
   const [updateSupplier, { loading }] = useMutation(UPDATE_SUPPLIER, {
      onCompleted: () => {
         toast.info(SUPPLIER_LOGO_ADDED)
         close(1)
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
         close(1)
      },
   })

   const addImage = ({ url }) => {
      updateSupplier({ variables: { id: formState.id, object: { logo: url } } })
   }

   if (loading) return <InlineLoader />

   return (
      <>
         <TunnelHeader
            title="Select Photo"
            close={() => close(1)}
            description="select a photo to use with this supplier"
            tooltip={
               <Tooltip identifier="suppliers_form_view_add_logo_tunnel_header" />
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
