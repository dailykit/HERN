import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { BRANDS } from '../../../../../graphql'
import { Text, Spacer } from '@dailykit/ui'
import {
   Flex, Tooltip
} from '../../../../../../../shared/components'
import { SettingsCard } from './SettingsCard'

export const BrandSettings = () => {
   const params = useParams()
   const [settings, setSettings] = React.useState([])
   const identifiers = [
      'Contact', 'Brand Logo',
      'Store Live',
      'Location',
      'Store Availability',
      'Pickup Availability',
      'Delivery Availability',
      'Referral Availability',
      'Coupons Availability',
      'Wallet Availability',
      'Loyalty Points Availability',
      'Terms and Conditions',
      'Refund Policy',
      'Privacy Policy',
      'Food Cost Percent',
      'Tax Percentage',
   ]
   const { loading: loadingSettings, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         brandId: Number(params.id),
         identifiers: identifiers
      },
      onSubscriptionData: ({
         subscriptionData: { data: { brands_brand_brandSetting = [] } = {} } = {},
      }) => {
         if (!isEmpty(brands_brand_brandSetting)) {
            setSettings(brands_brand_brandSetting)
         } else {
            setSettings({ notAvailable: "There are no config related to this brand." })
         }
      },
   })

   if (error) {
      toast.error('Something went wrong')
      console.log(error, "error")
   }


   return (
      <div>
         <Flex padding="16px 16px 16px 34px">
            <Flex container alignItems="center">
               <Text as="h2">Brand Settings</Text>
               <Tooltip identifier="brands_collection_listing_heading" />
            </Flex>
            <Spacer size="24px" />
            {'notAvailable' in settings ? (<p style={{ textAlign: "center", fontSize: "2rem" }}>
               {settings.notAvailable}
            </p>) : (settings.map(setting =>
               (<SettingsCard setting={setting} key={setting?.brandSetting?.id} title={setting?.brandSetting?.identifier} />)
            ))}
         </Flex>
      </div>
   )
}


