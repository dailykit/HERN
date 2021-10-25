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

import { RichTextEditorTunnel } from '../../../../Tunnels'
import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

export const TermsAndConditions = ({ update }) => {
   const title = 'Terms and Conditions'

   const params = useParams()
   const [text, setText] = React.useState({})
   const [settingId, setSettingId] = React.useState(null)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Terms and Conditions' },
         type: { _eq: 'brand' },
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
               setText(brand.value.value || '')
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
      <div id={title}>
         <Flex container alignItems="flex-start">
            <Text as="h3">{title}</Text>
            <Tooltip identifier="brand_terms_and_conditions" />
         </Flex>
         <Spacer size="16px" />
         <Flex container alignItems="center" justifyContent="space-between">
            <TextButton size="sm" type="outline" onClick={() => openTunnel(1)}>
               Update
            </TextButton>
         </Flex>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <RichTextEditorTunnel
                  title={title}
                  update={update}
                  text={text}
                  settingId={settingId}
                  closeTunnel={closeTunnel}
               />
            </Tunnel>
         </Tunnels>
      </div>
   )
}
