import React from 'react'
import { Spacer } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { isEmpty, groupBy } from 'lodash'
import { useParams } from 'react-router-dom'
import { useMutation, useSubscription } from '@apollo/react-hooks'

import { BRANDS } from '../../../../../graphql'
import { ScrollSection } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import {
   BrandName,
   BrandLogo,
   BrandContact,
   AppTitle,
   Favicon,
   Slides,
   PrimaryColor,
   Payments,
   Pickup,
   Delivery,
   Store,
   Address,
   Coupons,
   Wallet,
   LoyaltyPoints,
   Scripts,
   NavLinks,
   Referral,
   FoodCostPercent,
   TermsAndConditions,
   PrivacyPolicy,
   TaxPercentage,
} from './sections'
import { RefundPolicy } from './sections/RefundPolicy'

export const OnDemandSettings = () => {
   const params = useParams()
   const [settings, setSettings] = React.useState({})
   const [updateSetting] = useMutation(BRANDS.UPDATE_BRAND_SETTING, {
      onCompleted: () => {
         toast.success('Successfully updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const {
      loading,
      error,
      data: { brandSettings = [] } = {},
   } = useSubscription(BRANDS.SETTINGS_TYPES)
   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }

   React.useEffect(() => {
      if (!loading && !isEmpty(brandSettings)) {
         const grouped = groupBy(brandSettings, 'type')

         Object.keys(grouped).forEach(key => {
            grouped[key] = grouped[key].map(node => node.identifier)
         })
         setSettings(grouped)
      }
   }, [loading, brandSettings])

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
      <div height="calc(100vh - 154px)">
         {/* <ScrollSection.Aside links={settings} /> */}
         <ScrollSection.Main>
            <ScrollSection.Section hash="brand" title="Brand">
               <BrandName update={update} />
               <Spacer size="24px" />
               <BrandLogo update={update} />
               <Spacer size="24px" />
               <BrandContact update={update} />
               <Spacer size="24px" />
               <NavLinks update={update} />
               <Spacer size="24px" />
               <TermsAndConditions update={update} />
               <Spacer size="24px" />
               <PrivacyPolicy update={update} />
               <Spacer size="24px" />
               <RefundPolicy update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="visual" title="Visual">
               <AppTitle update={update} />
               <Spacer size="24px" />
               <Favicon update={update} />
               <Spacer size="24px" />
               <Slides update={update} />
               <Spacer size="24px" />
               <PrimaryColor update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="availability" title="Availability">
               <Payments update={update} />
               <Spacer size="24px" />
               <Address update={update} />
               <Spacer size="24px" />
               <Store update={update} />
               <Spacer size="24px" />
               <Pickup update={update} />
               <Spacer size="24px" />
               <Delivery update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="rewards" title="Rewards">
               <Referral update={update} />
               <Spacer size="24px" />
               <Coupons update={update} />
               <Spacer size="24px" />
               <Wallet update={update} />
               <Spacer size="24px" />
               <LoyaltyPoints update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="app" title="App">
               <Scripts update={update} />
               <Spacer size="24px" />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="sales" title="Sales">
               <FoodCostPercent update={update} />
               <Spacer size="24px" />
               <TaxPercentage update={update} />
               <Spacer size="24px" />
            </ScrollSection.Section>
            <Spacer size="48px" />
         </ScrollSection.Main>
      </div>
   )
}
