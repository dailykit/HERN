import React from 'react'
import { isEmpty, isNull } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { Form, TextButton, Text, Spacer } from '@dailykit/ui'
import validator from '../../../../../../validator'
import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

export const Contact = ({ update }) => {
   const params = useParams()
   const [form, setForm] = React.useState({
      email: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      phoneNo: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
   })
   const [settingId, setSettingId] = React.useState(null)
   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Contact' },
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
               setForm(form => ({
                  ...form,
                  ...(brand.value?.email && {
                     email: {
                        value: brand.value.email,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.phoneNo && {
                     phoneNo: {
                        value: brand.value.phoneNo,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
               }))
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      if (!settingId) return
      if (form.email.meta.isValid && form.phoneNo.meta.isValid) {
         update({
            id: settingId,
            value: {
               email: form.email.value,
               phoneNo: form.phoneNo.value,
            },
         })
      } else {
         toast.error('Contact details must be provided')
      }
   }, [form, settingId, update])

   const handleChange = e => {
      const { name, value } = e.target
      if (name === 'email') {
         setForm({
            ...form,
            email: {
               ...form.email,
               value: value,
            },
         })
      } else {
         setForm({
            ...form,
            phoneNo: {
               ...form.phoneNo,
               value: value,
            },
         })
      }
   }

   const onBlur = e => {
      const { name, value } = e.target
      if (name === 'email') {
         setForm({
            ...form,
            email: {
               ...form.email,
               meta: {
                  ...form.email.meta,
                  isTouched: true,
                  errors: validator.email(value).errors,
                  isValid: validator.email(value).isValid,
               },
            },
         })
      } else {
         setForm({
            ...form,
            phoneNo: {
               ...form.phoneNo,
               meta: {
                  ...form.phoneNo.meta,
                  isTouched: true,
                  errors: validator.phone(value).errors,
                  isValid: validator.phone(value).isValid,
               },
            },
         })
      }
   }

   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }
   if (loading) return <InlineLoader />

   return (
      <div id="Contact">
         <Flex>
            <Flex>
               <Flex container alignItems="flex-start">
                  <Text as="h3">Email</Text>
                  <Tooltip identifier="brand_contact_email_info" />
               </Flex>
               <Spacer size="4px" />
               <Form.Group>
                  <Form.Text
                     id="email"
                     name="email"
                     value={form.email.value}
                     placeholder="Enter email"
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.email.meta.isTouched &&
                     !form.email.meta.isValid &&
                     form.email.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            </Flex>
            <Spacer size="24px" />
            <Flex>
               <Flex container alignItems="flex-start">
                  <Text as="h3">Phone No.</Text>
                  <Tooltip identifier="brand_contact_phone_info" />
               </Flex>
               <Spacer size="4px" />
               <Form.Group>
                  <Form.Number
                     id="phoneNo"
                     name="phoneNo"
                     value={form.phoneNo.value}
                     placeholder="Enter phone no."
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.phoneNo.meta.isTouched &&
                     !form.phoneNo.meta.isValid &&
                     form.phoneNo.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            </Flex>
            <Spacer size="16px" />
            <TextButton size="sm" type="outline" onClick={updateSetting}>
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
