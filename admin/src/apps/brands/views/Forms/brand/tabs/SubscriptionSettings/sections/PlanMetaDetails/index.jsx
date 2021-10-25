import React from 'react'
import { isEmpty, isNull } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { Form, TextButton, Text, Spacer, Toggle } from '@dailykit/ui'
import validator from '../../../../../../validator'
import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

export const PlanMetaDetails = ({ update }) => {
   const params = useParams()
   const [form, setForm] = React.useState({
      selectButtonLabel: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      subscriptionTitleThumbnail: false,
      subscriptionTitleDescription: false,
      subscriptionYieldInformation: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      subscriptionItemCountTotal: false,
      subscriptionItemCountPerServing: false,
   })
   const [settingId, setSettingId] = React.useState(null)
   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'subscription-metadetails' },
         type: { _eq: 'Select-Plan' },
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
                  ...(brand.value?.selectButtonLabel && {
                     selectButtonLabel: {
                        value: brand.value.selectButtonLabel,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.subscriptionYield && {
                     ...(brand.value?.subscriptionYield?.information && {
                        subscriptionYieldInformation: {
                           value: brand.value.subscriptionYield.information,
                           meta: {
                              isValid: true,
                              isTouched: false,
                              errors: [],
                           },
                        },
                     }),
                  }),
                  ...(brand.value?.subscriptionTitle && {
                     ...(brand.value?.subscriptionTitle?.thumbnail && {
                        subscriptionTitleThumbnail:
                           brand.value.subscriptionTitle.thumbnail,
                     }),
                     ...(brand.value?.subscriptionTitle?.description && {
                        subscriptionTitleDescription:
                           brand.value.subscriptionTitle.description,
                     }),
                  }),
                  ...(brand.value?.subscriptionItemCount && {
                     ...(brand.value?.subscriptionItemCount?.total && {
                        subscriptionItemCountTotal:
                           brand.value.subscriptionItemCount.total,
                     }),
                     ...(brand.value?.subscriptionItemCount?.perServing && {
                        subscriptionItemCountPerServing:
                           brand.value.subscriptionItemCount.perServing,
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
         form.selectButtonLabel.meta.isValid &&
         form.subscriptionYieldInformation.meta.isValid
      ) {
         update({
            id: settingId,
            value: {
               selectButtonLabel: form.selectButtonLabel.value,
               subscriptionTitle: {
                  thumbnail: form.subscriptionTitleThumbnail,
                  description: form.subscriptionTitleDescription,
               },
               subscriptionYield: {
                  information: form.subscriptionYieldInformation.value,
               },
               subscriptionItemCount: {
                  total: form.subscriptionItemCountTotal,
                  perServing: form.subscriptionItemCountPerServing,
               },
            },
         })
      } else {
         toast.error('Plan Details must be provided')
      }
   }, [form, settingId, update])

   const handleChange = e => {
      const { name, value } = e.target
      if (name === 'selectButtonLabel') {
         setForm({
            ...form,
            selectButtonLabel: {
               ...form.selectButtonLabel,
               value: value,
            },
         })
      } else {
         setForm({
            ...form,
            subscriptionYieldInformation: {
               ...form.subscriptionYieldInformation,
               value: value,
            },
         })
      }
   }
   const onBlur = e => {
      const { name, value } = e.target
      if (name === 'selectButtonLabel') {
         setForm({
            ...form,
            selectButtonLabel: {
               ...form.selectButtonLabel,
               meta: {
                  ...form.selectButtonLabel.meta,
                  isTouched: true,
                  errors: validator.text(value).errors,
                  isValid: validator.text(value).isValid,
               },
            },
         })
      } else {
         setForm({
            ...form,
            subscriptionYieldInformation: {
               ...form.subscriptionYieldInformation,
               meta: {
                  ...form.subscriptionYieldInformation.meta,
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
      <div id="subscription-metadetails">
         <Flex>
            <Form.Group>
               <Form.Label htmlFor="label" title="label">
                  <Flex container alignItems="center">
                     Select Button Label
                     <Tooltip identifier="brand_selectButtonLabel_info" />
                  </Flex>
               </Form.Label>
               <Form.Text
                  id="selectButtonLabel"
                  name="selectButtonLabel"
                  value={form.selectButtonLabel.value}
                  onChange={e => handleChange(e)}
                  onBlur={onBlur}
               />
               {form.selectButtonLabel.meta.isTouched &&
                  !form.selectButtonLabel.meta.isValid &&
                  form.selectButtonLabel.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>

            <Spacer size="24px" />
            <Flex>
               <Form.Toggle
                  id="subscriptionTitleDescription"
                  name="subscriptionTitleDescription"
                  value={form.subscriptionTitleDescription}
                  onChange={() =>
                     handleChange(
                        'subscriptionTitleDescription',
                        !form.subscriptionTitleDescription
                     )
                  }
               >
                  <Flex container alignItems="center">
                     Show plan description
                     <Tooltip identifier="brand_subscription_TitleDescription_info" />
                  </Flex>
               </Form.Toggle>

               <Spacer size="16px" />
               <Form.Toggle
                  id="subscriptionTitleThumbnail"
                  name="subscriptionTitleThumbnail"
                  value={form.subscriptionTitleThumbnail}
                  onChange={() =>
                     handleChange(
                        'subscriptionTitleThumbnail',
                        !form.subscriptionTitleThumbnail
                     )
                  }
               >
                  <Flex container alignItems="center">
                     Show plan thumbnail
                     <Tooltip identifier="brand_subscription_TitleThumbnail_info" />
                  </Flex>
               </Form.Toggle>
            </Flex>
            <Spacer size="24px" />
            <Flex>
               <Flex container alignItems="center">
                  <Text as="h3">Plan Item Counts</Text>
                  <Tooltip identifier="brand_itemCount_label_info" />
               </Flex>
               <Spacer size="16px" />
               <Form.Toggle
                  id="subscriptionItemCountTotal"
                  name="subscriptionItemCountTotal"
                  value={form.subscriptionItemCountTotal}
                  onChange={() =>
                     handleChange(
                        'subscriptionItemCountTotal',
                        !form.subscriptionItemCountTotal
                     )
                  }
               >
                  <Flex container alignItems="center">
                     Show total
                     <Tooltip identifier="brand_subscription_ItemCountTotal_info" />
                  </Flex>
               </Form.Toggle>

               <Spacer size="16px" />
               <Form.Toggle
                  id="subscriptionItemCountPerServing"
                  name="subscriptionItemCountPerServing"
                  value={form.subscriptionItemCountPerServing}
                  onChange={() =>
                     handleChange(
                        'subscriptionItemCountPerServing',
                        !form.subscriptionItemCountPerServing
                     )
                  }
               >
                  <Flex container alignItems="center">
                     Show per serving
                     <Tooltip identifier="brand_subscription_itemCount_PerServing_info" />
                  </Flex>
               </Form.Toggle>
            </Flex>
            <Spacer size="24px" />
            <Form.Group>
               <Form.Label htmlFor="label" title="label">
                  <Flex container alignItems="center">
                     Yield Information
                     <Tooltip identifier="brand_subscriptionYieldInformation_info" />
                  </Flex>
               </Form.Label>
               <Form.TextArea
                  id="subscriptionYieldInformation"
                  name="subscriptionYieldInformation"
                  value={form.subscriptionYieldInformation.value}
                  onChange={e => handleChange(e)}
                  onBlur={onBlur}
               />
               {form.subscriptionYieldInformation.meta.isTouched &&
                  !form.subscriptionYieldInformation.meta.isValid &&
                  form.subscriptionYieldInformation.meta.errors.map(
                     (error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     )
                  )}
            </Form.Group>

            <Spacer size="16px" />
            <TextButton size="sm" type="outline" onClick={updateSetting}>
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
