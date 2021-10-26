import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { TextButton, Text, Spacer, Form } from '@dailykit/ui'
import validator from '../../../../../../../validator'
import { BRANDS } from '../../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../../shared/utils'

const LoyaltyPointsUsage = ({ update }) => {
   const params = useParams()
   const [settingId, setSettingId] = React.useState(null)
   const [conversionRate, setConversionRate] = React.useState({
      value: 1,
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [percentage, setPercentage] = React.useState({
      value: 1,
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [max, setMax] = React.useState({
      value: 1,
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Loyalty Points Usage' },
         type: { _eq: 'rewards' },
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
            if ('conversionRate' in brand.value) {
               setConversionRate({
                  value: brand.value.conversionRate,
                  meta: {
                     isValid: true,
                     isTouched: false,
                     errors: [],
                  },
               })
            }
            if ('percentage' in brand.value) {
               setPercentage({
                  value: brand.value.percentage,
                  meta: {
                     isValid: true,
                     isTouched: false,
                     errors: [],
                  },
               })
            }
            if ('max' in brand.value) {
               setMax({
                  value: brand.value.max,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               })
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      if (
         conversionRate.meta.isValid &&
         percentage.meta.isValid &&
         max.meta.isValid
      ) {
         update({
            id: settingId,
            value: {
               conversionRate: conversionRate.value,
               percentage: percentage.value,
               max: max.value,
            },
         })
      } else {
         toast.error('Must provide all loyalty points usage options!!')
      }
   }, [conversionRate, percentage, max, settingId])

   const onBlur = e => {
      const { name, value } = e.target
      switch (name) {
         case 'conversionRate':
            return setConversionRate({
               ...conversionRate,
               meta: {
                  ...conversionRate.meta,
                  isTouched: true,
                  errors: validator.amount(value).errors,
                  isValid: validator.amount(value).isValid,
               },
            })
         case 'percentage':
            return setPercentage({
               ...percentage,
               meta: {
                  ...percentage.meta,
                  isTouched: true,
                  errors: validator.amount(value).errors,
                  isValid: validator.amount(value).isValid,
               },
            })
         case 'maxAmount':
            return setMax({
               ...max,
               meta: {
                  ...max.meta,
                  isTouched: true,
                  errors: validator.amount(value).errors,
                  isValid: validator.amount(value).isValid,
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
      <div id="Loyalty Points Availability">
         <Flex container alignItems="center">
            <Text as="h3">Loyalty Points Usage</Text>
            <Tooltip identifier="brand_loyaltyPnts_usage_info" />
         </Flex>
         <Spacer size="8px" />
         <Flex container alignItems="center" justifyContent="space-between">
            <Flex container alignItems="center">
               <Form.Group>
                  <Form.Label htmlFor="rate" title="rate">
                     <Flex container alignItems="center">
                        Conversion Rate
                        <Tooltip identifier="brand_loyaltyPnts_conversionRate_info" />
                     </Flex>
                  </Form.Label>

                  <Flex container alignItems="center" flexDirection="column">
                     <Form.Group>
                        <Flex container alignItems="center">
                           <p
                              style={{
                                 marginBottom: '0px',
                                 marginRight: '6px',
                              }}
                           >
                              $
                           </p>
                           <Form.Number
                              id="conversionRate"
                              name="conversionRate"
                              value={conversionRate.value}
                              onChange={e =>
                                 setConversionRate({
                                    ...conversionRate,
                                    value: +e.target.value,
                                 })
                              }
                              onBlur={onBlur}
                           />
                        </Flex>
                     </Form.Group>
                     {conversionRate.meta.isTouched &&
                        !conversionRate.meta.isValid &&
                        conversionRate.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Flex>
               </Form.Group>
            </Flex>
            <TextButton size="sm" type="outline" onClick={updateSetting}>
               Update
            </TextButton>
         </Flex>
         <Spacer size="8px" />
         <Flex container alignItems="center" justifyContent="space-between">
            <Flex container alignItems="center">
               <Form.Group>
                  <Form.Label htmlFor="percentage" title="percentage">
                     <Flex container alignItems="center">
                        Percent of Total Cart Amount
                        <Tooltip identifier="brand_loyaltyPnts_cartPercentage_info" />
                     </Flex>
                  </Form.Label>
                  <Flex container alignItems="center" flexDirection="column">
                     <Form.Group>
                        <Flex container alignItems="center">
                           <Form.Number
                              id="percentage"
                              name="percentage"
                              value={percentage.value}
                              onChange={e =>
                                 setPercentage({
                                    ...percentage,
                                    value: +e.target.value,
                                 })
                              }
                              onBlur={onBlur}
                           />
                           <p
                              style={{ marginBottom: '0px', marginLeft: '6px' }}
                           >
                              %
                           </p>
                        </Flex>
                     </Form.Group>
                     {percentage.meta.isTouched &&
                        !percentage.meta.isValid &&
                        percentage.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Flex>
               </Form.Group>
            </Flex>
            <Spacer size="12px" xAxis />
            <Flex container alignItems="center">
               <Form.Group>
                  <Form.Label htmlFor="maxAmount" title="maxAmount">
                     <Flex container alignItems="center">
                        Max Amount
                        <Tooltip identifier="brand_loyaltyPnts_maxAmount_info" />
                     </Flex>
                  </Form.Label>
                  <Flex container alignItems="center" flexDirection="column">
                     <Form.Group>
                        <Flex container alignItems="center">
                           <p
                              style={{
                                 marginBottom: '0px',
                                 marginRight: '6px',
                              }}
                           >
                              $
                           </p>
                           <Form.Number
                              id="maxAmount"
                              name="maxAmount"
                              value={max.value}
                              onChange={e =>
                                 setMax({ ...max, value: +e.target.value })
                              }
                              onBlur={onBlur}
                           />
                        </Flex>
                     </Form.Group>
                     {max.meta.isTouched &&
                        !max.meta.isValid &&
                        max.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Flex>
               </Form.Group>
            </Flex>
         </Flex>
      </div>
   )
}

export default LoyaltyPointsUsage
