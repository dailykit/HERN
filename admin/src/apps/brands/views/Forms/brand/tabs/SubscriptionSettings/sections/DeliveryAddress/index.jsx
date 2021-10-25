import React from 'react'
import { isEmpty, isNull } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { Form, Text, TextButton, Spacer } from '@dailykit/ui'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { BRANDS } from '../../../../../../../graphql'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'
import validator from '../../../../../../validator'

export const DeliveryAddress = ({ update }) => {
   const params = useParams()
   const [form, setForm] = React.useState({
      title: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      description: {
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
         identifier: { _eq: 'address' },
         type: { _eq: 'Select-Delivery' },
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
                  ...(brand.value?.title && {
                     title: {
                        value: brand.value.title,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.description && {
                     description: {
                        value: brand.value.description,
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
      if (form.title.meta.isValid && form.description.meta.isValid) {
         update({
            id: settingId,
            value: {
               title: form.title.value,
               description: form.description.value,
            },
         })
      } else {
         toast.error('Delivery Address Details must be provided')
      }
   }, [form, settingId, update])

   const handleChange = e => {
      const { name, value } = e.target
      if (name === 'title') {
         setForm({
            ...form,
            title: {
               ...form.title,
               value: value,
            },
         })
      } else {
         setForm({
            ...form,
            description: {
               ...form.description,
               value: value,
            },
         })
      }
   }
   const onBlur = e => {
      const { name, value } = e.target
      if (name === 'title') {
         setForm({
            ...form,
            title: {
               ...form.title,
               meta: {
                  ...form.title.meta,
                  isTouched: true,
                  errors: validator.text(value).errors,
                  isValid: validator.text(value).isValid,
               },
            },
         })
      } else {
         setForm({
            ...form,
            description: {
               ...form.description,
               meta: {
                  ...form.description.meta,
                  isTouched: true,
                  errors: validator.text(value).errors,
                  isValid: validator.text(value).isValid,
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
      <div id="address">
         <Flex container alignItems="center">
            <Text as="h3">Delivery Address Details</Text>
            <Tooltip identifier="brand_deliveryAddress_info" />
         </Flex>
         <Spacer size="24px" />
         <Form.Group>
            <Form.Label htmlFor="title" title="title">
               <Flex container alignItems="center">
                  Title
                  <Tooltip identifier="brand_deliveryAddress_title_info" />
               </Flex>
            </Form.Label>
            <Form.Text
               id="title"
               name="title"
               value={form.title.value}
               onChange={e => handleChange(e)}
               onBlur={onBlur}
            />
            {form.title.meta.isTouched &&
               !form.title.meta.isValid &&
               form.title.meta.errors.map((error, index) => (
                  <Form.Error key={index}>{error}</Form.Error>
               ))}
         </Form.Group>
         <Spacer size="24px" />
         <Form.Group>
            <Form.Label htmlFor="title" title="title">
               <Flex container alignItems="center">
                  Description
                  <Tooltip identifier="brand_deliveryAddress_description_info" />
               </Flex>
            </Form.Label>
            <Form.TextArea
               id="description"
               name="description"
               onChange={e => handleChange(e)}
               onBlur={onBlur}
            />
            {form.description.meta.isTouched &&
               !form.description.meta.isValid &&
               form.description.meta.errors.map((error, index) => (
                  <Form.Error key={index}>{error}</Form.Error>
               ))}
         </Form.Group>
         <Spacer size="16px" />
         <TextButton size="sm" type="outline" onClick={updateSetting}>
            Update
         </TextButton>
      </div>
   )
}
