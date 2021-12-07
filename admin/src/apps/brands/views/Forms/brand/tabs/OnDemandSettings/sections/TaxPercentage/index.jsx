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

export const TaxPercentage = ({ update }) => {
   const params = useParams()

   const [tax, setTax] = React.useState({
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
         identifier: { _eq: 'Tax Percentage' },
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
            if ('value' in brand.value) {
               setTax({
                  ...tax,
                  value: brand.value.value,
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
            value: +tax.value,
         },
      })
   }, [tax, settingId])

   const onBlur = target => {
      const { value } = target
      const { isValid, errors } = validator.percentage(value)
      setTax({
         ...tax,
         meta: {
            isTouched: true,
            isValid,
            errors,
         },
      })
   }

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id="Tax Percentage">
         <Flex container alignItems="flex-start">
            <Text as="h3">Tax Percentage</Text>
            <Tooltip identifier="sales_tax_percentage" />
         </Flex>
         <Spacer size="4px" />
         <Flex container alignItems="flex-start" justifyContent="space-between">
            <Form.Group>
               <Form.Label htmlFor="tax" title="tax">
                  How much % of order value should be charged as tax?
               </Form.Label>
               <Form.Text
                  id="tax"
                  name="tax"
                  value={tax.value}
                  placeholder="Enter tax"
                  onChange={e => setTax({ ...tax, value: e.target.value })}
                  onBlur={e => onBlur(e.target)}
               />
               {tax.meta.isTouched &&
                  !tax.meta.isValid &&
                  tax.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="8px" xAxis />
            <TextButton
               size="sm"
               type="outline"
               onClick={() => tax.meta.isValid && updateSetting()}
            >
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
