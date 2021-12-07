import React from 'react'
import { isEmpty, isNull } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { TextButton, Text, Spacer } from '@dailykit/ui'

import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

export const ThemeColor = ({ update }) => {
   const params = useParams()
   const [form, setForm] = React.useState({
      accent: '#38a169',
      highlight: '#38a169',
   })
   const [settingId, setSettingId] = React.useState(null)
   const { loading, error } = useSubscription(BRANDS.SUBSCRIPTION_SETTING, {
      variables: {
         identifier: { _eq: 'theme-color' },
         type: { _eq: 'Visual' },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { subscriptionSetting = [] } = {} } = {},
      }) => {
         if (!isEmpty(subscriptionSetting)) {
            const index = subscriptionSetting.findIndex(
               node => node?.brand?.brandId === Number(params.id)
            )

            if (index === -1) {
               const { id } = subscriptionSetting[0]
               setSettingId(id)
               return
            }
            const { brand, id } = subscriptionSetting[index]
            setSettingId(id)
            if (!isNull(brand) && !isEmpty(brand)) {
               setForm(form => ({
                  ...form,
                  ...(brand.value?.accent && { accent: brand.value.accent }),
                  ...(brand.value?.highlight && {
                     highlight: brand.value.highlight,
                  }),
               }))
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      if (!settingId) return
      update({
         id: settingId,
         value: {
            accent: form.accent,
            highlight: form.highlight,
         },
      })
   }, [form, settingId, update])

   const handleChange = (name, value) => {
      setForm(form => ({ ...form, [name]: value }))
   }

   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }
   if (loading) return <InlineLoader />

   return (
      <div id="Contact">
         <Flex container alignItems="center" justifyContent="space-between">
            <Flex>
               <Flex container alignItems="center">
                  <Text as="h3">Accent</Text>
                  <Tooltip identifier="brand_theme_accent_info" />
               </Flex>
               <Spacer size="4px" />
               <input
                  type="color"
                  name="accent"
                  value={form.accent}
                  onChange={e => handleChange(e.target.name, e.target.value)}
               />
            </Flex>
            <Spacer size="24px" xAxis />
            <Flex>
               <Flex container alignItems="center">
                  <Text as="h3">Highlight</Text>
                  <Tooltip identifier="brand_theme_highlight_info" />
               </Flex>
               <Spacer size="4px" />
               <input
                  type="color"
                  name="highlight"
                  value={form.highlight}
                  onChange={e => handleChange(e.target.name, e.target.value)}
               />
            </Flex>
            <TextButton size="sm" type="outline" onClick={updateSetting}>
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
