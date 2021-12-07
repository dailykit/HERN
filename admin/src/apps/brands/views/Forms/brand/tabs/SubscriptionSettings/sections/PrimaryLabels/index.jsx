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

export const PrimaryLabels = ({ update }) => {
   const params = useParams()
   const [form, setForm] = React.useState({
      login: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      logout: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      signup: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      itemLabelPlural: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      itemLabelSingular: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      yieldLabelPlural: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      yieldLabelSingular: {
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
         identifier: { _eq: 'primary-labels' },
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
                  ...(brand.value?.login && {
                     login: {
                        value: brand.value.login,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.logout && {
                     logout: {
                        value: brand.value.logout,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.signup && {
                     signup: {
                        value: brand.value.signup,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.itemLabel?.plural && {
                     itemLabelPlural: {
                        value: brand.value.itemLabel.plural,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.itemLabel?.singular && {
                     itemLabelSingular: {
                        value: brand.value.itemLabel.singular,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.yieldLabel?.plural && {
                     yieldLabelPlural: {
                        value: brand.value.yieldLabel.plural,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.yieldLabel?.singular && {
                     yieldLabelSingular: {
                        value: brand.value.yieldLabel.singular,
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
         form.login.meta.isValid &&
         form.logout.meta.isValid &&
         form.signup.meta.isValid &&
         form.itemLabelPlural.meta.isValid &&
         form.itemLabelSingular.meta.isValid &&
         form.yieldLabelPlural.meta.isValid &&
         form.yieldLabelSingular.meta.isValid
      ) {
         update({
            id: settingId,
            value: {
               login: form.login.value,
               logout: form.logout.value,
               signup: form.signup.value,
               itemLabel: {
                  plural: form.itemLabelPlural.value,
                  singular: form.itemLabelSingular.value,
               },
               yieldLabel: {
                  plural: form.yieldLabelPlural.value,
                  singular: form.yieldLabelSingular.value,
               },
            },
         })
      } else {
         toast.error('Primary Labels must be provided')
      }
   }, [form, settingId, update])

   const handleChange = e => {
      const { name, value } = e.target
      switch (name) {
         case 'login':
            return setForm({
               ...form,
               login: {
                  ...form.login,
                  value: value,
               },
            })
         case 'logout':
            return setForm({
               ...form,
               logout: {
                  ...form.logout,
                  value: value,
               },
            })
         case 'signup':
            return setForm({
               ...form,
               signup: {
                  ...form.signup,
                  value: value,
               },
            })
         case 'itemLabelPlural':
            return setForm({
               ...form,
               itemLabelPlural: {
                  ...form.itemLabelPlural,
                  value: value,
               },
            })
         case 'itemLabelSingular':
            return setForm({
               ...form,
               itemLabelSingular: {
                  ...form.itemLabelSingular,
                  value: value,
               },
            })
         case 'yieldLabelPlural':
            return setForm({
               ...form,
               yieldLabelPlural: {
                  ...form.yieldLabelPlural,
                  value: value,
               },
            })
         case 'yieldLabelSingular':
            return setForm({
               ...form,
               yieldLabelSingular: {
                  ...form.yieldLabelSingular,
                  value: value,
               },
            })
      }
   }

   const onBlur = e => {
      const { name, value } = e.target
      switch (name) {
         case 'login':
            return setForm({
               ...form,
               login: {
                  ...form.login,
                  meta: {
                     ...form.login.meta,
                     isTouched: true,
                     errors: validator.text(value).errors,
                     isValid: validator.text(value).isValid,
                  },
               },
            })
         case 'logout':
            return setForm({
               ...form,
               logout: {
                  ...form.logout,
                  meta: {
                     ...form.logout.meta,
                     isTouched: true,
                     errors: validator.text(value).errors,
                     isValid: validator.text(value).isValid,
                  },
               },
            })
         case 'signup':
            return setForm({
               ...form,
               signup: {
                  ...form.signup,
                  meta: {
                     ...form.signup.meta,
                     isTouched: true,
                     errors: validator.text(value).errors,
                     isValid: validator.text(value).isValid,
                  },
               },
            })
         case 'itemLabelPlural':
            return setForm({
               ...form,
               itemLabelPlural: {
                  ...form.itemLabelPlural,
                  meta: {
                     ...form.itemLabelPlural.meta,
                     isTouched: true,
                     errors: validator.text(value).errors,
                     isValid: validator.text(value).isValid,
                  },
               },
            })
         case 'itemLabelSingular':
            return setForm({
               ...form,
               itemLabelSingular: {
                  ...form.itemLabelSingular,
                  meta: {
                     ...form.itemLabelSingular.meta,
                     isTouched: true,
                     errors: validator.text(value).errors,
                     isValid: validator.text(value).isValid,
                  },
               },
            })
         case 'yieldLabelPlural':
            return setForm({
               ...form,
               yieldLabelPlural: {
                  ...form.yieldLabelPlural,
                  meta: {
                     ...form.yieldLabelPlural.meta,
                     isTouched: true,
                     errors: validator.text(value).errors,
                     isValid: validator.text(value).isValid,
                  },
               },
            })
         case 'yieldLabelSingular':
            return setForm({
               ...form,
               yieldLabelSingular: {
                  ...form.yieldLabelSingular,
                  meta: {
                     ...form.yieldLabelSingular.meta,
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
      <div id="primary-labels">
         <Flex>
            <Flex container alignItems="center">
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Login Label
                        <Tooltip identifier="brand_login_label_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="login"
                     name="login"
                     value={form.login.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.login.meta.isTouched &&
                     !form.login.meta.isValid &&
                     form.login.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>

               <Spacer size="16px" xAxis />
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Logout Label
                        <Tooltip identifier="brand_logout_label_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="logout"
                     name="logout"
                     value={form.logout.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.logout.meta.isTouched &&
                     !form.logout.meta.isValid &&
                     form.logout.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            </Flex>
            <Spacer size="24px" />
            <Form.Group>
               <Form.Label htmlFor="label" title="label">
                  <Flex container alignItems="center">
                     Sign Up Label
                     <Tooltip identifier="brand_signup_label_info" />
                  </Flex>
               </Form.Label>
               <Form.Text
                  id="signup"
                  name="signup"
                  value={form.signup.value}
                  onChange={e => handleChange(e)}
                  onBlur={onBlur}
               />
               {form.signup.meta.isTouched &&
                  !form.signup.meta.isValid &&
                  form.signup.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>

            <Spacer size="24px" />
            <Flex container alignItems="center">
               <Text as="h3">Item Label</Text>
               <Tooltip identifier="brand_item_label_info" />
            </Flex>
            <Spacer size="16px" />
            <Flex container alignItems="center">
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Plural Label
                        <Tooltip identifier="brand_itemLabelPlural_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="itemLabelPlural"
                     name="itemLabelPlural"
                     value={form.itemLabelPlural.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.itemLabelPlural.meta.isTouched &&
                     !form.itemLabelPlural.meta.isValid &&
                     form.itemLabelPlural.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>

               <Spacer size="16px" xAxis />
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Singular Label
                        <Tooltip identifier="brand_itemLabelSingular_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="itemLabelSingular"
                     name="itemLabelSingular"
                     value={form.itemLabelSingular.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.itemLabelSingular.meta.isTouched &&
                     !form.itemLabelSingular.meta.isValid &&
                     form.itemLabelSingular.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            </Flex>
            <Spacer size="24px" />
            <Flex container alignItems="center">
               <Text as="h3">Yield Label</Text>
               <Tooltip identifier="brand_yield_label_info" />
            </Flex>
            <Spacer size="16px" />
            <Flex container alignItems="center">
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Plural Label
                        <Tooltip identifier="brand_yieldLabelPlural_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="yieldLabelPlural"
                     name="yieldLabelPlural"
                     value={form.yieldLabelPlural.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.yieldLabelPlural.meta.isTouched &&
                     !form.yieldLabelPlural.meta.isValid &&
                     form.yieldLabelPlural.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
               <Spacer size="16px" xAxis />
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     <Flex container alignItems="center">
                        Singular Label
                        <Tooltip identifier="brand_yieldLabelSingular_info" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="yieldLabelSingular"
                     name="yieldLabelSingular"
                     value={form.yieldLabelSingular.value}
                     onChange={e => handleChange(e)}
                     onBlur={onBlur}
                  />
                  {form.yieldLabelSingular.meta.isTouched &&
                     !form.yieldLabelSingular.meta.isValid &&
                     form.yieldLabelSingular.meta.errors.map((error, index) => (
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
