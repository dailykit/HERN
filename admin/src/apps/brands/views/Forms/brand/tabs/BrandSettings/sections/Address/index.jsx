import React from 'react'
import { isEmpty, isNull } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import {
   Text,
   Spacer,
   Tunnels,
   Tunnel,
   useTunnel,
   TextButton,
} from '@dailykit/ui'

import { AddressTunnel } from '../../../../Tunnels'
import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

export const Address = ({ update }) => {
   const params = useParams()
   const [address, setAddress] = React.useState({})
   const [settingId, setSettingId] = React.useState(null)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Location' },
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
            if (!isNull(brand) && !isEmpty(brand)) {
               setAddress(brand.value || {})
            }
         }
      },
   })

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id="Location">
         <Flex container alignItems="flex-start">
            <Text as="h3">Location</Text>
            <Tooltip identifier="brand_address_info" />
         </Flex>
         <Spacer size="16px" />
         <Flex container alignItems="center" justifyContent="space-between">
            <Text as="p">{normalizeAddress(address)}</Text>
            <TextButton size="sm" type="outline" onClick={() => openTunnel(1)}>
               Update
            </TextButton>
         </Flex>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <AddressTunnel
                  update={update}
                  address={address}
                  settingId={settingId}
                  closeTunnel={closeTunnel}
               />
            </Tunnel>
         </Tunnels>
      </div>
   )
}

const normalizeAddress = (address = {}) => {
   if (isEmpty(address)) return 'No address added yet!'
   let result = ''
   if ('line1' in address) {
      result += address.line1
   }
   if ('line2' in address) {
      result += ', ' + address.line2
   }
   if ('city' in address) {
      result += ', ' + address.city
   }
   if ('state' in address) {
      result += ', ' + address.state
   }
   if ('country' in address) {
      result += ', ' + address.country
   }
   if ('zipcode' in address) {
      result += ', ' + address.zipcode
   }
   return result
}
