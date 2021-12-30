import React from 'react'
import { toast } from 'react-toastify'
import { useMutation } from '@apollo/react-hooks'
import { PRODUCT } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'

import SEOBasics from './SEObasics'
import SocialShare from './SocialShare'
import TwitterCard from './TwitterCard'

const SEOSettings = ({ productId }) => {
   const domain = `${window.location.origin}/product/${productId}`
   const [updateSetting] = useMutation(PRODUCT.UPDATE_PRODUCT_SETTING, {
      onCompleted: () => {
         toast.success('Successfully updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   console.log(domain, "🎁🎀🎄🎋🎍🎎")
   const update = ({ id, value }) => {
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
         <SEOBasics update={update} productId={productId} domain={domain} />
         <SocialShare update={update} productId={productId} domain={domain} />
         <TwitterCard update={update} productId={productId} domain={domain} />
      </div>
   )
}
export default SEOSettings