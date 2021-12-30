import React from 'react'
import { toast } from 'react-toastify'
import { useMutation } from '@apollo/react-hooks'
import { PRODUCT } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'

import SEOBasics from './SEObasics'
import SocialShare from './SocialShare'
import TwitterCard from './TwitterCard'

const SEOSettings = ({ productId }) => {

   const [updateSetting] = useMutation(PRODUCT.UPDATE_PRODUCT_SETTING, {
      onCompleted: () => {
         toast.success('Successfully updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })


   const update = ({ id, value }) => {
      console.log('🎗🎗', {
         "productPageSettingId": id,
         "productId": productId,
         "value": value,
      })
      updateSetting({
         variables: {
            object: {
               value,
               productId: productId,
               productPageSettingId: id,
            },
         },
      })
   }

   return (
      <div style={{ margin: '35px 35px 35px 35px' }}>
         <SEOBasics update={update} productId={productId} />
         <SocialShare update={update} productId={productId} />
         <TwitterCard update={update} productId={productId} />
      </div>
   )
}
export default SEOSettings