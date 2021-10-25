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

export const Delivery = ({ update }) => {
   const params = useParams()
   const [settingId, setSettingId] = React.useState(null)
   const [isAvailable, setIsAvailable] = React.useState(false)
   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Delivery Availability' },
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
            if ('isAvailable' in brand.value) {
               setIsAvailable(brand.value.isAvailable)
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      update({ id: settingId, value: { isAvailable } })
   }, [isAvailable, settingId])

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id="Delivery Availability">
         <Flex container alignItems="center">
            <Text as="h3">Delivery</Text>
            <Tooltip identifier="brand_delivery_info" />
         </Flex>
         <Spacer size="8px" />
         <Flex container alignItems="center" justifyContent="space-between">
            <Form.Toggle
               name="delivery"
               value={isAvailable}
               onChange={() => setIsAvailable(!isAvailable)}
            >
               <Flex container alignItems="center">
                  Available
                  <Tooltip identifier="brand_delivery_available_info" />
               </Flex>
            </Form.Toggle>
            <TextButton size="sm" type="outline" onClick={updateSetting}>
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
