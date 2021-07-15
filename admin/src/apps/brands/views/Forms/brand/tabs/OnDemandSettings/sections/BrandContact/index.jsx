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

export const BrandContact = ({ update }) => {
   const params = useParams()
   const [email, setEmail] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [phone, setPhone] = React.useState({
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
         identifier: { _eq: 'Contact' },
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
            if ('email' in brand.value || 'phoneNo' in brand.value) {
               setEmail({
                  ...email,
                  value: brand.value.email,
               })
               setPhone({
                  ...phone,
                  value: brand.value.phoneNo,
               })
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      if (!settingId) return
      update({
         id: settingId,
         value: { email: email.value, phoneNo: phone.value },
      })
   }, [email, phone, settingId])

   const onBlur = target => {
      const { name, value } = target
      if (name === 'email') {
         const { isValid, errors } = validator.email(value)
         setEmail({
            ...email,
            meta: {
               isTouched: true,
               isValid,
               errors,
            },
         })
      }
      if (name === 'phone') {
         const { isValid, errors } = validator.phone(value)
         setPhone({
            ...phone,
            meta: {
               isTouched: true,
               isValid,
               errors,
            },
         })
      }
   }

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id="Contact">
         <Flex container alignItems="flex-start">
            <Text as="h3">Contact</Text>
            <Tooltip identifier="brand_contact_info" />
         </Flex>
         <Spacer size="4px" />
         <Flex container alignItems="flex-end">
            <Form.Group>
               <Form.Label htmlFor="email" title="email">
                  Email
               </Form.Label>
               <Form.Text
                  id="email"
                  name="email"
                  value={email.value}
                  placeholder="Enter brand email"
                  onChange={e => setEmail({ ...email, value: e.target.value })}
                  onBlur={e => onBlur(e.target)}
               />
               {email.meta.isTouched &&
                  !email.meta.isValid &&
                  email.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="8px" xAxis />
            <TextButton
               size="lg"
               type="outline"
               onClick={() => email.meta.isValid && updateSetting()}
            >
               Update
            </TextButton>
         </Flex>
         <Spacer size="4px" />
         <Flex container alignItems="flex-end">
            <Form.Group>
               <Form.Label htmlFor="phone" title="phone">
                  Phone
               </Form.Label>
               <Form.Text
                  id="phone"
                  name="phone"
                  value={phone.value}
                  placeholder="Enter brand phone number"
                  onChange={e => setPhone({ ...phone, value: e.target.value })}
                  onBlur={e => onBlur(e.target)}
               />
               {phone.meta.isTouched &&
                  !phone.meta.isValid &&
                  phone.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="8px" xAxis />
            <TextButton
               size="lg"
               type="outline"
               onClick={() => phone.meta.isValid && updateSetting()}
            >
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
