import { useSubscription } from '@apollo/react-hooks'
import React from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { InlineLoader } from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils'
import { PAYMENT_OPTIONS } from '../../../graphql'
import { PageHeader, ResponsiveFlex, StyledCompany } from './styled'

export const PaymentOption = () => {
   const params = useParams()

   const {
      loading,
      error,
      data: { brands_availablePaymentOption_by_pk: paymentOption = {} } = {},
   } = useSubscription(PAYMENT_OPTIONS.VIEW, {
      variables: {
         id: params.id,
      },
   })

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
         </PageHeader>
      </ResponsiveFlex>
   )
}
