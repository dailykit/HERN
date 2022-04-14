import React from 'react'
import { toast } from 'react-toastify'
import { useMutation } from '@apollo/react-hooks'
import { PRODUCT } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'
import {
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import SEOBasics from './SEObasics'
import SocialShare from './SocialShare'
import TwitterCard from './TwitterCard'

import { BrandContext } from '../../../../../../../App'
import BrandListing from '../BrandListing'


const SEOSettings = ({ data }) => {
   const [brandContext] = React.useContext(BrandContext)
   const [brandListTunnel, openBrandListTunnel, closeBrandListTunnel] =
      useTunnel(1)
   // domain formatted like this=> https://testhern.dailykit.org/products/2960
   const domain = 'https://' + brandContext?.brandDomain + '/products' + "/" + data?.id
   const [updateSetting] = useMutation(PRODUCT.UPDATE_PRODUCT_SETTING, {
      onCompleted: () => {
         toast.success('Successfully updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   console.log(data, "data")

   const update = ({ id, value }) => {
      updateSetting({
         variables: {
            object: {
               value,
               productId: data?.id,
               productSettingId: id,
               brandId: brandContext.brandId
            },
         },
      })
   }

   React.useEffect(() => {
      if (brandContext.brandId == null) {
         openBrandListTunnel(1)
      }
   }, [brandContext.brandId])

   return (<>
      <div style={{ margin: '35px 35px 35px 35px' }}>
         <SEOBasics update={update} domain={domain} brandId={brandContext.brandId} product={data} />
         <SocialShare update={update} domain={domain} brandId={brandContext.brandId} product={data} />
         <TwitterCard update={update} domain={domain} brandId={brandContext.brandId} product={data} />
      </div>
      <Tunnels tunnels={brandListTunnel}>
         <Tunnel popup={true} layer={1} size="md">
            <BrandListing
               closeTunnel={closeBrandListTunnel}
            />
         </Tunnel>
      </Tunnels>
   </>
   )
}
export default SEOSettings