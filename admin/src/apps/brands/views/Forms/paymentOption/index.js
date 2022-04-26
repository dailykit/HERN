import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Flex, Form } from '@dailykit/ui'
import React from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { InlineLoader, Tooltip } from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils'
import { PAYMENT_OPTIONS } from '../../../graphql'
import {
   PageHeader,
   ResponsiveFlex,
   StyledCompany,
   StyledPublish,
} from './styled'

export const PaymentOption = () => {
   const params = useParams()

   //subscription
   const {
      loading,
      error,
      data: { brands_availablePaymentOption_by_pk: paymentOption = {} } = {},
   } = useSubscription(PAYMENT_OPTIONS.VIEW, {
      variables: {
         id: params.id,
      },
   })

   //mutation
   const [updatePaymentOption] = useMutation(PAYMENT_OPTIONS.UPDATE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log('error', error)
         logger(error)
      },
   })

   //handler
   const togglePublish = () => {
      const val = !paymentOption.isActive
      updatePaymentOption({
         variables: {
            id: params.id,
            _set: {
               isActive: val,
            },
         },
      })
   }

   console.log(paymentOption)
   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }
   if (loading) return <InlineLoader />
   return (
      <ResponsiveFlex
         container
         justifyContent="space-between"
         alignItems="center"
         padding="16px 0"
         maxWidth="1280px"
         width="calc(100vw - 64px)"
         margin="0 auto"
      >
         <PageHeader>
            <StyledCompany>
               <img
                  src={
                     paymentOption.supportedPaymentOption
                        .supportedPaymentCompany.logo
                  }
                  alt="Company image"
               />
               <div>
                  {paymentOption.supportedPaymentOption.supportedPaymentCompany.label
                     .charAt(0)
                     .toUpperCase() +
                     paymentOption.supportedPaymentOption.supportedPaymentCompany.label.slice(
                        1
                     )}
               </div>
            </StyledCompany>
            <Form.Group>
               <Form.Toggle
                  name="publish"
                  value={paymentOption.isActive}
                  onChange={togglePublish}
               >
                  <StyledPublish>
                     Published
                     <Tooltip identifier="payment_option_active" />
                  </StyledPublish>
               </Form.Toggle>
            </Form.Group>
         </PageHeader>
      </ResponsiveFlex>
   )
}
