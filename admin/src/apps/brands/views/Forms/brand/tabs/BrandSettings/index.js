import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { BRANDS } from '../../../../../graphql'
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
         console.log("brandSettings", brands_brand_brandSetting)
         if (!isEmpty(brands_brand_brandSetting)) {
            // const requiredSettings = brandSettings.filter((setting) => identifiers.includes(setting.identifier))
            setSettings(brands_brand_brandSetting)
         }
      },
   })
   console.log(settings, "Settings")
   if (error) {
      toast.error('Something went wrong')
      console.log(error, "error")
   }


   return (
      <div>
         {settings.map(setting =>
            (<SettingsCard setting={setting} key={setting?.brandSetting?.id} title={setting?.brandSetting?.identifier} />)
         )}
      </div>
   )
}


