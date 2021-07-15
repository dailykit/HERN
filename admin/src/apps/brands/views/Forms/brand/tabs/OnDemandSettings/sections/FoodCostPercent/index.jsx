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

export const FoodCostPercent = ({ update }) => {
   const params = useParams()
   const [lowerLimit, setLowerLimit] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [upperLimit, setUpperLimit] = React.useState({
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
         identifier: { _eq: 'Food Cost Percent' },
         type: { _eq: 'sales' },
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
            if ('lowerLimit' in brand.value || 'upperLimit' in brand.value) {
               setLowerLimit({
                  ...lowerLimit,
                  value: brand.value.lowerLimit,
               })
               setUpperLimit({
                  ...upperLimit,
                  value: brand.value.upperLimit,
               })
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      if (!settingId) return
      update({
         id: settingId,
         value: {
            lowerLimit: +lowerLimit.value,
            upperLimit: +upperLimit.value,
         },
      })
   }, [lowerLimit, upperLimit, settingId])

   const onBlur = target => {
      const { name, value } = target
      const { isValid, errors } = validator.percentage(value)
      if (name === 'lowerLimit') {
         setLowerLimit({
            ...lowerLimit,
            meta: {
               isTouched: true,
               isValid,
               errors,
            },
         })
      }
      if (name === 'upperLimit') {
         setUpperLimit({
            ...upperLimit,
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
      <div id="Food Cost Percent">
         <Flex container alignItems="flex-start">
            <Text as="h3">Food Cost Percentage</Text>
            <Tooltip identifier="sales_food_cost_percentage" />
         </Flex>
         <Spacer size="4px" />
         <Flex container alignItems="flex-start">
            <Form.Group>
               <Form.Label htmlFor="lowerLimit" title="lowerLimit">
                  Lower Limit(%)
               </Form.Label>
               <Form.Text
                  id="lowerLimit"
                  name="lowerLimit"
                  value={lowerLimit.value}
                  placeholder="Enter lower limit"
                  onChange={e =>
                     setLowerLimit({ ...lowerLimit, value: e.target.value })
                  }
                  onBlur={e => onBlur(e.target)}
               />
               {lowerLimit.meta.isTouched &&
                  !lowerLimit.meta.isValid &&
                  lowerLimit.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="4px" xAxis />
            <Form.Group>
               <Form.Label htmlFor="upperLimit" title="upperLimit">
                  Upper Limit(%)
               </Form.Label>
               <Form.Text
                  id="upperLimit"
                  name="upperLimit"
                  value={upperLimit.value}
                  placeholder="Enter upper limit"
                  onChange={e =>
                     setUpperLimit({ ...upperLimit, value: e.target.value })
                  }
                  onBlur={e => onBlur(e.target)}
               />
               {upperLimit.meta.isTouched &&
                  !upperLimit.meta.isValid &&
                  upperLimit.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="8px" xAxis />
            <TextButton
               size="sm"
               type="outline"
               onClick={() =>
                  lowerLimit.meta.isValid &&
                  upperLimit.meta.isValid &&
                  updateSetting()
               }
            >
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
