import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { BRANDS } from '../../../../../graphql'
import { Text, Spacer, Loader } from '@dailykit/ui'
import { Flex, Tooltip } from '../../../../../../../shared/components'
import { SettingsCard } from './SettingsCard'
import { Card } from 'antd'
import LinkFiles from '../../../../../../content/views/Forms/Page/ContentSelection/components/LinkFiles'

export const BrandSettings = () => {
   const params = useParams()
   const [settings, setSettings] = React.useState([])
   const identifiers = [
      'Contact',
      'Brand Logo',
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
         identifiers: identifiers,
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { brands_brand_brandSetting = [] } = {},
         } = {},
      }) => {
         if (!isEmpty(brands_brand_brandSetting)) {
            setSettings(brands_brand_brandSetting)
         } else {
            setSettings({
               notAvailable: 'There are no config related to this brand.',
            })
         }
      },
   })

   if (error) {
      toast.error('Something went wrong')
      console.log(error, 'error')
   }

   if (loadingSettings) return <Loader />

   return (
      <div>
         <Flex padding="16px 16px 16px 34px">
            <Flex container alignItems="center">
               <Text as="h2">Brand Settings</Text>
               <Tooltip identifier="brands_collection_listing_heading" />
            </Flex>
            <Spacer size="24px" />
            {'notAvailable' in settings ? (
               <p style={{ textAlign: 'center', fontSize: '2rem' }}>
                  {settings.notAvailable}
               </p>
            ) : (
               settings.map(setting => (
                  <SettingsCard
                     setting={setting}
                     key={setting?.brandSetting?.id}
                     title={setting?.brandSetting?.identifier}
                  />
               ))
            )}
            <Card
               title={<Text as="h3">Link JS and CSS file</Text>}
               style={{ width: '100%', margin: '16px 0' }}
            >
               <LinkFiles
                  title="Linked CSS files"
                  fileType="css"
                  entityId={params?.id}
                  scope="brand"
               />
               <LinkFiles
                  title="Linked JS files"
                  fileType="js"
                  entityId={params?.id}
                  scope="brand"
               />
            </Card>
         </Flex>
      </div>
   )
}
