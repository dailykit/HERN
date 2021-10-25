import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { TextButton, Text, Spacer, Toggle, Input, Form } from '@dailykit/ui'
import validator from '../../../../../../validator'
import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

export const Store = ({ update }) => {
   const params = useParams()
   const [settingId, setSettingId] = React.useState(null)
   const [isOpen, setIsOpen] = React.useState(false)
   const [from, setFrom] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [to, setTo] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [message, setMessage] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Store Availability' },
         type: { _eq: 'availability' },
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
            if ('isOpen' in brand.value) {
               setIsOpen(brand.value.isOpen)
            }
            if ('shutMessage' in brand.value) {
               setMessage({
                  value: brand.value.shutMessage,
                  meta: {
                     isValid: true,
                     isTouched: false,
                     errors: [],
                  },
               })
            }
            if ('from' in brand.value) {
               setFrom({
                  value: brand.value.from,
                  meta: {
                     isValid: true,
                     isTouched: false,
                     errors: [],
                  },
               })
            }
            if ('to' in brand.value) {
               setTo({
                  value: brand.value.to,
                  meta: {
                     isValid: true,
                     isTouched: false,
                     errors: [],
                  },
               })
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      if (message.meta.isValid) {
         update({
            id: settingId,
            value: {
               to: to.value,
               from: from.value,
               isOpen: isOpen.value,
               shutMessage: message.value,
            },
         })
      } else {
         toast.error('Store Availability Options must be provided')
      }
   }, [isOpen, from, to, message, settingId])

   const onBlur = e => {
      const { name, value } = e.target
      switch (name) {
         case 'from':
            return setFrom({
               ...from,
               meta: {
                  ...from.meta,
                  isTouched: true,
                  errors: validator.time(value).errors,
                  isValid: validator.time(value).isValid,
               },
            })
         case 'to':
            return setTo({
               ...to,
               meta: {
                  ...to.meta,
                  isTouched: true,
                  errors: validator.time(value).errors,
                  isValid: validator.time(value).isValid,
               },
            })
         case 'shut-message':
            return setMessage({
               ...message,
               meta: {
                  ...message.meta,
                  isTouched: true,
                  errors: validator.text(value).errors,
                  isValid: validator.text(value).isValid,
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
      <div id="Store Availability">
         <Flex container alignItems="flex-start">
            <Text as="h3">Store Availability</Text>
            <Tooltip identifier="brand_store_availability_info" />
         </Flex>
         <Spacer size="8px" />
         <Flex container alignItems="start" justifyContent="space-between">
            <Flex>
               <Form.Toggle
                  name="open"
                  value={isOpen}
                  onChange={() => setIsOpen(!isOpen)}
               >
                  <Flex container alignItems="center">
                     Open
                     <Tooltip identifier="brand_store_open_info" />
                  </Flex>
               </Form.Toggle>
               <Spacer size="16px" />
               <Flex container alignItems="center">
                  <Flex>
                     <Form.Group>
                        <Form.Label htmlFor="time" title="time">
                           <Flex container alignItems="center">
                              From
                              <Tooltip identifier="brand_store_open_from_info" />
                           </Flex>
                        </Form.Label>
                        <Form.Time
                           id="fromTime"
                           name="fromTime"
                           onChange={e =>
                              setFrom({ ...from, value: e.target.value })
                           }
                           value={from.value}
                           onBlur={onBlur}
                        />
                        {from.meta.isTouched &&
                           !from.meta.isValid &&
                           from.meta.errors.map((error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           ))}
                     </Form.Group>
                  </Flex>
                  <Spacer size="24px" xAxis />
                  <Flex>
                     <Form.Group>
                        <Form.Label htmlFor="time" title="time">
                           <Flex container alignItems="center">
                              To
                              <Tooltip identifier="brand_store_open_to_info" />
                           </Flex>
                        </Form.Label>
                        <Form.Time
                           id="toTime"
                           name="toTime"
                           value={to.value}
                           onChange={e =>
                              setTo({ ...to, value: e.target.value })
                           }
                           onBlur={onBlur}
                        />
                        {to.meta.isTouched &&
                           !to.meta.isValid &&
                           to.meta.errors.map((error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           ))}
                     </Form.Group>
                  </Flex>
               </Flex>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="time" title="time">
                     Text to show when store's closed
                  </Form.Label>
                  <Form.Text
                     value={message.value}
                     name="shut-message"
                     onChange={e =>
                        setMessage({ ...message, value: e.target.value })
                     }
                     placeholder="Enter the closed store message"
                     onBlur={onBlur}
                  />
                  {message.meta.isTouched &&
                     !message.meta.isValid &&
                     message.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            </Flex>
            <TextButton size="sm" type="outline" onClick={updateSetting}>
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
