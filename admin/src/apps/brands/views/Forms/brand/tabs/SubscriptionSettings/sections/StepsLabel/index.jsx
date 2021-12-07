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

export const StepsLabel = ({ update }) => {
   const params = useParams()
   const [form, setForm] = React.useState({
      checkout: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      register: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      selectMenu: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      selectDelivery: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
   })
   const [settingId, setSettingId] = React.useState(null)
   const { loading, error } = useSubscription(BRANDS.SUBSCRIPTION_SETTING, {
      variables: {
         identifier: { _eq: 'steps-labels' },
         type: { _eq: 'conventions' },
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
                  ...(brand.value?.checkout && {
                     checkout: {
                        value: brand.value.checkout,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.register && {
                     register: {
                        value: brand.value.register,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.selectMenu && {
                     selectMenu: {
                        value: brand.value.selectMenu,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.selectDelivery && {
                     selectDelivery: {
                        value: brand.value.selectDelivery,
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
      if (
         form.checkout.meta.isValid &&
         form.register.meta.isValid &&
         form.selectMenu.meta.isValid &&
         form.selectDelivery.meta.isValid
      ) {
         update({
            id: settingId,
            value: {
               checkout: form.checkout.value,
               register: form.register.value,
               selectMenu: form.selectMenu.value,
               selectDelivery: form.selectDelivery.value,
            },
         })
      } else {
         toast.error('Steps Label must be provided')
      }
   }, [form, settingId, update])

   const handleChange = e => {
      const { name, value } = e.target
      switch (name) {
         case 'checkout':
            return setForm({
               ...form,
               checkout: {
                  ...form.checkout,
                  value: value,
               },
            })
         case 'register':
            return setForm({
               ...form,
               register: {
                  ...form.register,
                  value: value,
               },
            })
         case 'selectMenu':
            return setForm({
               ...form,
               selectMenu: {
                  ...form.selectMenu,
                  value: value,
               },
            })
         case 'selectDelivery':
            return setForm({
               ...form,
               selectDelivery: {
                  ...form.selectDelivery,
                  value: value,
               },
            })
      }
   }

   const onBlur = e => {
      const { name, value } = e.target
      switch (name) {
         case 'checkout':
            return setForm({
               ...form,
               checkout: {
                  ...form.checkout,
                  meta: {
                     ...form.checkout.meta,
                     isTouched: true,
                     errors: validator.text(value).errors,
                     isValid: validator.text(value).isValid,
                  },
               },
            })
         case 'register':
            return setForm({
               ...form,
               register: {
                  ...form.register,
                  meta: {
                     ...form.register.meta,
                     isTouched: true,
                     errors: validator.text(value).errors,
                     isValid: validator.text(value).isValid,
                  },
               },
            })
         case 'selectMenu':
            return setForm({
               ...form,
               selectMenu: {
                  ...form.selectMenu,
                  meta: {
                     ...form.selectMenu.meta,
                     isTouched: true,
                     errors: validator.text(value).errors,
                     isValid: validator.text(value).isValid,
                  },
               },
            })
         case 'selectDelivery':
            return setForm({
               ...form,
               selectDelivery: {
                  ...form.selectDelivery,
                  meta: {
                     ...form.selectDelivery.meta,
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
      <div id="steps-labels">
         <Flex>
            <Flex container alignItems="center">
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Checkout Label
                        <Tooltip identifier="brand_checkout_label_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="checkout"
                     name="checkout"
                     value={form.checkout.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.checkout.meta.isTouched &&
                     !form.checkout.meta.isValid &&
                     form.checkout.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
               <Spacer size="16px" xAxis />
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Register Label
                        <Tooltip identifier="brand_register_label_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="register"
                     name="register"
                     value={form.register.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.register.meta.isTouched &&
                     !form.register.meta.isValid &&
                     form.register.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            </Flex>
            <Spacer size="24px" />
            <Flex container alignItems="center">
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Select Menu Label
                        <Tooltip identifier="brand_selectMenu_label_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="selectMenu"
                     name="selectMenu"
                     value={form.selectMenu.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.selectMenu.meta.isTouched &&
                     !form.selectMenu.meta.isValid &&
                     form.selectMenu.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>

               <Spacer size="16px" xAxis />
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Select Delivery Label
                        <Tooltip identifier="brand_delivery_label_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="selectDelivery"
                     name="selectDelivery"
                     value={form.selectDelivery.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.selectDelivery.meta.isTouched &&
                     !form.selectDelivery.meta.isValid &&
                     form.selectDelivery.meta.errors.map((error, index) => (
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
