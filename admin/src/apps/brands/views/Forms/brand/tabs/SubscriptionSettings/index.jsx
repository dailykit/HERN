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
   Brand,
   Contact,
   Address,
   StepsLabel,
   PrimaryLabels,
   ThemeColor,
   PriceLabels,
   FirstDelivery,
   DeliveryDay,
   DeliveryAddress,
   DeliveryPage,
   PlanMetaDetails,
   RegisterPage,
   Wallet,
   LoyaltyPoints,
   Coupons,
   Referral,
} from './sections'

export const SubscriptionSettings = () => {
   const params = useParams()
   const [settings, setSettings] = React.useState({})
   const [updateSetting] = useMutation(BRANDS.UPDATE_SUBSCRIPTION_SETTING, {
      onCompleted: () => {
         toast.success('Successfully updated!')
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })
   const {
      loading,
      error,
      data: { subscriptionSettings = [] } = {},
   } = useSubscription(BRANDS.SUBSCRIPTION_SETTINGS_TYPES)

   React.useEffect(() => {
      if (!loading && !isEmpty(subscriptionSettings)) {
         const grouped = groupBy(subscriptionSettings, 'type')

         Object.keys(grouped).forEach(key => {
            grouped[key] = grouped[key].map(node => node.identifier)
         })
         setSettings(grouped)
      }
   }, [loading, subscriptionSettings])

   const update = ({ id, value }) => {
      updateSetting({
         variables: {
            object: {
               value,
               brandId: params.id,
               subscriptionStoreSettingId: id,
            },
         },
      })
   }

   if (error) {
      toast.error('Somthing went wrong!')
      logger(error)
   }

   return (
      <ScrollSection height="calc(100vh - 154px)">
         <ScrollSection.Aside links={settings} />
         <ScrollSection.Main>
            <ScrollSection.Section hash="brand" title="Brand">
               <Brand update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="brand" title="Contact">
               <Contact update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="avalability" title="Availability">
               <Address update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="conventions" title="Steps Label">
               <StepsLabel update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="conventions" title="Primary Label">
               <PrimaryLabels update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="Visual" title="Theme Color">
               <ThemeColor update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="Visual" title="Price Label">
               <PriceLabels update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section
               hash="Select-Delivery"
               title="Delivery Details"
            >
               <FirstDelivery update={update} />
               <Spacer size="24px" />
               <DeliveryDay update={update} />
               <Spacer size="24px" />
               <DeliveryAddress update={update} />
               <Spacer size="24px" />
               <DeliveryPage update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="Select-Plan" title="Plan Details">
               <PlanMetaDetails update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="Register" title="Register Page">
               <RegisterPage update={update} />
            </ScrollSection.Section>
            <Spacer size="48px" />
            <ScrollSection.Section hash="rewards" title="Rewards">
               <Wallet update={update} />
               <Spacer size="24px" />
               <LoyaltyPoints update={update} />
               <Spacer size="24px" />
               <Coupons update={update} />
               <Spacer size="24px" />
               <Referral update={update} />
               <Spacer size="24px" />
            </ScrollSection.Section>
            <Spacer size="48px" />
         </ScrollSection.Main>
      </ScrollSection>
   )
}
