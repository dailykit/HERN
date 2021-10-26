import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { TextButton, Text, Spacer, Toggle, Form } from '@dailykit/ui'

import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

export const Payments = ({ update }) => {
   const params = useParams()
   const [settingId, setSettingId] = React.useState(null)
   const [isStoreLive, setIsStoreLive] = React.useState(false)
   const [isStripeConfigured, setIsStripeConfigured] = React.useState(false)
   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Store Live' },
         type: { _eq: 'availability' },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { brandSettings = [] } = {} } = {},
      }) => {
         if (!isEmpty(brandSettings)) {
            const index = brandSettings.findIndex(
               node => node?.brand?.brandId === Number(params.id)
            )

            if (index === -1) {
               const { id } = brandSettings[0]
               setSettingId(id)
               return
            }
            const { brand, id } = brandSettings[index]
            setSettingId(id)
            if ('isStoreLive' in brand.value) {
               setIsStoreLive(brand.value.isStoreLive)
            }
            if ('isStripeConfigured' in brand.value) {
               setIsStripeConfigured(brand.value.isStripeConfigured)
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      update({ id: settingId, value: { isStoreLive, isStripeConfigured } })
   }, [isStoreLive, isStripeConfigured, settingId])

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id="Store Live">
         <Flex container alignItems="flex-start">
            <Text as="h4" style={{ textTransform: 'none' }}>
               Payments
            </Text>
            <Tooltip identifier="brand_payments_info" />
         </Flex>
         <Spacer size="4px" />
         <Flex container alignItems="center" justifyContent="space-between">
            <Form.Toggle
               name="stripe"
               isDisabled
               value={isStripeConfigured}
               onChange={() => {}}
            >
               <Flex container alignItems="center">
                  Stripe Configured
                  <Tooltip identifier="brand_payments_stripeConfig_info" />
               </Flex>
            </Form.Toggle>
            <Form.Toggle
               name="livePayment"
               value={isStoreLive}
               onChange={() => setIsStoreLive(!isStoreLive)}
            >
               <Flex container alignItems="center">
                  Accept Live Payments
                  <Tooltip identifier="brand_payments_livePayment_info" />
               </Flex>
            </Form.Toggle>

            <TextButton size="sm" type="outline" onClick={updateSetting}>
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
