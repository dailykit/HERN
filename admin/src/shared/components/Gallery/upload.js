import React from 'react'
import { TunnelHeader, Flex } from '@dailykit/ui'
import { AssetUploader } from '../../components'
import Banner from '../Banner'

const Asset = ({ onImageSave, closeTunnel }) => {
   const addImage = image => {
      onImageSave(image.url)
      closeTunnel(1)
   }
   return (
      <>
         <TunnelHeader title="Select Photo" close={() => closeTunnel(2)} />
         <Banner id="select-photo-tunnel-top" />
         <Flex padding="0 16px">
            <AssetUploader
               onAssetUpload={url => addImage(url)}
               onImageSelect={image => addImage(image)}
            />
            <Banner id="select-photo-tunnel-bottom" />
         </Flex>
      </>
   )
}

export default Asset
