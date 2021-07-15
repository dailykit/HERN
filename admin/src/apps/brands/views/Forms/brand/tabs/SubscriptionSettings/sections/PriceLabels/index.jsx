import React from 'react'
import { isEmpty, isNull } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { Form, TextButton, Text, Toggle, Spacer } from '@dailykit/ui'
import validator from '../../../../../../validator'
import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

export const PriceLabels = ({ update }) => {
   const params = useParams()
   const [form, setForm] = React.useState({
      pricePerPlanPrefix: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      pricePerPlanSuffix: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      pricePerPlanIsVisible: false,
      pricePerServingPrefix: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      pricePerServingSuffix: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      pricePerServingIsVisible: false,
   })
   const [settingId, setSettingId] = React.useState(null)
   const { loading, error } = useSubscription(BRANDS.SUBSCRIPTION_SETTING, {
      variables: {
         identifier: { _eq: 'priceDisplay' },
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
                  ...(brand.value?.pricePerPlan && {
                     ...(brand.value?.pricePerPlan?.prefix && {
                        pricePerPlanPrefix: {
                           value: brand.value.pricePerPlan.prefix,
                           meta: {
                              isValid: true,
                              isTouched: false,
                              errors: [],
                           },
                        },
                     }),
                     ...(brand.value?.pricePerPlan?.suffix && {
                        pricePerPlanSuffix: {
                           value: brand.value.pricePerPlan.suffix,
                           meta: {
                              isValid: true,
                              isTouched: false,
                              errors: [],
                           },
                        },
                     }),
                     ...(brand.value?.pricePerPlan?.isVisible && {
                        pricePerPlanIsVisible:
                           brand.value.pricePerPlan.isVisible,
                     }),
                     ...(brand.value?.pricePerServing?.prefix && {
                        pricePerServingPrefix: {
                           value: brand.value.pricePerServing.prefix,
                           meta: {
                              isValid: true,
                              isTouched: false,
                              errors: [],
                           },
                        },
                     }),
                     ...(brand.value?.pricePerServing?.suffix && {
                        pricePerServingSuffix: {
                           value: brand.value.pricePerServing.suffix,
                           meta: {
                              isValid: true,
                              isTouched: false,
                              errors: [],
                           },
                        },
                     }),
                     ...(brand.value?.pricePerServing?.isVisible && {
                        pricePerServingIsVisible:
                           brand.value.pricePerServing.isVisible,
                     }),
                  }),
               }))
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      if (!settingId) return
      if (
         form.pricePerPlanPrefix.meta.isValid &&
         form.pricePerPlanSuffix.meta.isValid &&
         form.pricePerServingPrefix.meta.isValid &&
         form.pricePerServingSuffix.meta.isValid
      ) {
         update({
            id: settingId,
            value: {
               pricePerPlan: {
                  prefix: form.pricePerPlanPrefix.value,
                  suffix: form.pricePerPlanSuffix.value,
                  isVisible: form.pricePerPlanIsVisible,
               },
               pricePerServing: {
                  prefix: form.pricePerServingPrefix.value,
                  suffix: form.pricePerServingSuffix.value,
                  isVisible: form.pricePerServingIsVisible,
               },
            },
         })
      } else {
         toast.error('Price Labels must be provided')
      }
   }, [form, settingId, update])

   const handleChange = e => {
      const { name, value } = e.target
      switch (name) {
         case 'pricePerPlanPrefix':
            return setForm({
               ...form,
               pricePerPlanPrefix: {
                  ...form.pricePerPlanPrefix,
                  value: value,
               },
            })
         case 'pricePerPlanSuffix':
            return setForm({
               ...form,
               pricePerPlanSuffix: {
                  ...form.pricePerPlanSuffix,
                  value: value,
               },
            })
         case 'pricePerServingPrefix':
            return setForm({
               ...form,
               pricePerServingPrefix: {
                  ...form.pricePerServingPrefix,
                  value: value,
               },
            })
         case 'pricePerServingSuffix':
            return setForm({
               ...form,
               pricePerServingSuffix: {
                  ...form.pricePerServingSuffix,
                  value: value,
               },
            })
      }
   }

   const onBlur = e => {
      const { name, value } = e.target
      switch (name) {
         case 'pricePerPlanPrefix':
            return setForm({
               ...form,
               pricePerPlanPrefix: {
                  ...form.pricePerPlanPrefix,
                  meta: {
                     ...form.pricePerPlanPrefix.meta,
                     isTouched: true,
                     errors: validator.text(value).errors,
                     isValid: validator.text(value).isValid,
                  },
               },
            })
         case 'pricePerPlanSuffix':
            return setForm({
               ...form,
               pricePerPlanSuffix: {
                  ...form.pricePerPlanSuffix,
                  meta: {
                     ...form.pricePerPlanSuffix.meta,
                     isTouched: true,
                     errors: validator.text(value).errors,
                     isValid: validator.text(value).isValid,
                  },
               },
            })
         case 'pricePerServingPrefix':
            return setForm({
               ...form,
               pricePerServingPrefix: {
                  ...form.pricePerServingPrefix,
                  meta: {
                     ...form.pricePerServingPrefix.meta,
                     isTouched: true,
                     errors: validator.text(value).errors,
                     isValid: validator.text(value).isValid,
                  },
               },
            })
         case 'pricePerServingSuffix':
            return setForm({
               ...form,
               pricePerServingSuffix: {
                  ...form.pricePerServingSuffix,
                  meta: {
                     ...form.pricePerServingSuffix.meta,
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
      <div id="priceDisplay">
         <Flex>
            <Flex container alignItems="center">
               <Text as="h3">Plan Labels</Text>
               <Tooltip identifier="brand_price_plan_label_info" />
            </Flex>
            <Spacer size="16px" />
            <Flex container alignItems="center">
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Prefix
                        <Tooltip identifier="brand_pricePerPlanPrefix_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="pricePerPlanPrefix"
                     name="pricePerPlanPrefix"
                     value={form.pricePerPlanPrefix.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.pricePerPlanPrefix.meta.isTouched &&
                     !form.pricePerPlanPrefix.meta.isValid &&
                     form.pricePerPlanPrefix.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>

               <Spacer size="16px" xAxis />
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Suffix
                        <Tooltip identifier="brand_pricePerPlanSuffix_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="pricePerPlanSuffix"
                     name="pricePerPlanSuffix"
                     value={form.pricePerPlanSuffix.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.pricePerPlanSuffix.meta.isTouched &&
                     !form.pricePerPlanSuffix.meta.isValid &&
                     form.pricePerPlanSuffix.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            </Flex>
            <Spacer size="16px" />
            <Form.Toggle
               id="pricePerPlanIsVisible"
               name="pricePerPlanIsVisible"
               value={form.pricePerPlanIsVisible}
               onChange={() =>
                  handleChange(
                     'pricePerPlanIsVisible',
                     !form.pricePerPlanIsVisible
                  )
               }
            />

            <Spacer size="24px" />
            <Flex container alignItems="center">
               <Text as="h3">Plan Labels</Text>
               <Tooltip identifier="brand_serving_plan_label_info" />
            </Flex>
            <Spacer size="16px" />
            <Flex container alignItems="center">
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Prefix
                        <Tooltip identifier="brand_pricePerServingPrefix_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="pricePerServingPrefix"
                     name="pricePerServingPrefix"
                     value={form.pricePerServingPrefix.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.pricePerServingPrefix.meta.isTouched &&
                     !form.pricePerServingPrefix.meta.isValid &&
                     form.pricePerServingPrefix.meta.errors.map(
                        (error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        )
                     )}
               </Form.Group>

               <Spacer size="16px" xAxis />
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Suffix
                        <Tooltip identifier="brand_pricePerServingSuffix_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="pricePerServingSuffix"
                     name="pricePerServingSuffix"
                     value={form.pricePerServingSuffix.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.pricePerServingSuffix.meta.isTouched &&
                     !form.pricePerServingSuffix.meta.isValid &&
                     form.pricePerServingSuffix.meta.errors.map(
                        (error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        )
                     )}
               </Form.Group>
            </Flex>
            <Spacer size="16px" />
            <Form.Toggle
               id="pricePerServingIsVisible"
               name="pricePerServingIsVisible"
               value={form.pricePerServingIsVisible}
               onChange={() =>
                  handleChange(
                     'pricePerServingIsVisible',
                     !form.pricePerServingIsVisible
                  )
               }
            />

            <Spacer size="16px" />
            <TextButton size="sm" type="outline" onClick={updateSetting}>
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
