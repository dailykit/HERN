import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { TextButton, Text, Spacer, Form } from '@dailykit/ui'
import validator from '../../../../../../validator'

import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { logger } from '../../../../../../../../../shared/utils'

export const NavLinks = ({ update }) => {
   const params = useParams()
   const [aboutUs, setAboutUs] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [settingId, setSettingId] = React.useState(null)
   const { loading, error } = useSubscription(BRANDS.ONDEMAND_SETTING, {
      variables: {
         identifier: { _eq: 'Nav Links' },
         type: { _eq: 'brand' },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { storeSettings = [] } = {} } = {},
      }) => {
         if (!isEmpty(storeSettings)) {
            const index = storeSettings.findIndex(
               node => node?.brand?.brandId === Number(params.id)
            )

            if (index === -1) {
               const { id } = storeSettings[0]
               setSettingId(id)
               return
            }
            const { brand, id } = storeSettings[index]
            setSettingId(id)
            if ('aboutUs' in brand.value) {
               setAboutUs({
                  ...aboutUs,
                  value: brand.value.aboutUs,
               })
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      if (!settingId) return
      update({ id: settingId, value: { aboutUs: aboutUs.value } })
   }, [aboutUs, settingId])

   const onBlur = target => {
      const { name, value } = target
      const { isValid, errors } = validator.url(value)
      if (name === 'aboutUs') {
         setAboutUs({ ...aboutUs, meta: { isTouched: true, isValid, errors } })
      }
   }

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id="Nav Links">
         <Flex container alignItems="flex-start">
            <Text as="h3">Nav Links</Text>
            <Tooltip identifier="brand_nav_links" />
         </Flex>
         <Spacer size="4px" />
         <Flex container alignItems="flex-end">
            <Form.Group>
               <Form.Label htmlFor="aboutUs" title="aboutUs">
                  'About Us' link
               </Form.Label>
               <Form.Text
                  id="aboutUs"
                  name="aboutUs"
                  value={aboutUs.value}
                  placeholder="Enter URL"
                  onChange={e =>
                     setAboutUs({ ...aboutUs, value: e.target.value })
                  }
                  onBlur={e => onBlur(e.target)}
               />
               {aboutUs.meta.isTouched &&
                  !aboutUs.meta.isValid &&
                  aboutUs.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="8px" xAxis />
            <TextButton
               size="lg"
               type="outline"
               onClick={() => aboutUs.meta.isValid && updateSetting()}
            >
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
