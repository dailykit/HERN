import React from 'react'
import { toast } from 'react-toastify'
import { useMutation } from '@apollo/react-hooks'
import { PRODUCT } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'

import SEOBasics from './SEObasics'
import SocialShare from './SocialShare'
import TwitterCard from './TwitterCard'

const SEOSettings = ({ data }) => {
   const domain = `${window.location.origin}/product/${data?.id}`
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
      console.log(id, value, "id,value", data?.id)
      updateSetting({
         variables: {
            object: {
               value,
               productId: data?.id,
               productSettingId: id,
            },
         },
      })
   }

   return (
      <div style={{ margin: '35px 35px 35px 35px' }}>
         <SEOBasics update={update} domain={domain} product={data} />
         <SocialShare update={update} domain={domain} product={data} />
         <TwitterCard update={update} domain={domain} product={data} />
      </div>
   )
}
export default SEOSettings