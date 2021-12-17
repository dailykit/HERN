import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import isEmpty from 'lodash/isEmpty'

import { Button } from '../button'
import * as QUERIES from '../../graphql'
import { usePayment } from '../../lib'

export default function PayButton({ children, ...props }) {
   console.log(props)
   const {
      profileInfo,
      paymentInfo,
      setIsPaymentInitiated,
      setIsProcessingPayment,
      updatePaymentState,
   } = usePayment()

   // update cart mutation
   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onError: error => {
         console.log(error)
         addToast(error.message, { appearance: 'error' })
      },
   })

   const isValid = () => {
      return (
         profileInfo.firstName &&
         profileInfo.lastName &&
         profileInfo.phoneNumber &&
         paymentInfo &&
         paymentInfo.selectedAvailablePaymentOption?.id
      )
   }

   const isStripe =
      paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
         ?.supportedPaymentCompany?.label === 'stripe'

   const onPayClickHandler = () => {
      if (!isEmpty(paymentInfo) && !isEmpty(props?.cartId) && isValid()) {
         setIsProcessingPayment(true)
         setIsPaymentInitiated(true)
         updatePaymentState({
            paymentLifeCycleState: 'INCREMENT_PAYMENT_RETRY_ATTEMPT',
         })

         updateCart({
            variables: {
               id: props?.cartId,
               _inc: { paymentRetryAttempt: 1 },
               _set: {
                  ...(isStripe && {
                     paymentMethodId:
                        paymentInfo?.selectedAvailablePaymentOption
                           ?.selectedPaymentMethodId,
                  }),
                  toUseAvailablePaymentOptionId:
                     paymentInfo?.selectedAvailablePaymentOption?.id,
                  customerInfo: {
                     customerEmail: profileInfo?.email,
                     customerPhone: profileInfo?.phone,
                     customerLastName: profileInfo?.lastName,
                     customerFirstName: profileInfo?.firstName,
                  },
               },
            },
         })
      }
   }

   return (
      <Button
         onClick={onPayClickHandler}
         disabled={!Boolean(isValid())}
         {...props}
      >
         {children}
      </Button>
   )
}
