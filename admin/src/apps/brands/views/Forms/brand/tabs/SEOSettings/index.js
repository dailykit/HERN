import React from 'react'
import { toast } from 'react-toastify'
import { isEmpty, groupBy } from 'lodash'
import { useParams } from 'react-router-dom'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { BRANDS } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'

import SEOBasics from './SEObasics'
import SocialShare from './SocialShare'
import TwitterCard from './TwitterCard'
import MarketingIntegration from './MarketingIntegration'

export const SEOSettings = ({ domain }) => {
   const params = useParams()


   const [updateSetting] = useMutation(BRANDS.UPDATE_BRAND_SETTING, {
      onCompleted: () => {
         toast.success('Successfully updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })


   const update = ({ id, value }) => {
      updateSetting({
         variables: {
            object: {
               value,
               brandId: params.id,
               brandSettingId: id,
            },
         },
      })
   }
   return (
      <div style={{ margin: '35px 35px 35px 35px' }}>
         <SEOBasics update={update} domain={domain} />
         <SocialShare update={update} domain={domain} />
         <TwitterCard update={update} domain={domain} />
         <MarketingIntegration />
      </div>
   )
}
