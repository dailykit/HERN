import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import isEmpty from 'lodash/isEmpty'

import { Button } from '../button'
import * as QUERIES from '../../graphql'
import { usePayment } from '../../lib'
import { useCart } from '../../context'
import { isKiosk } from '../../utils'

export default function PayButton({ children, cartId = null, ...props }) {
   const isKioskMode = isKiosk()
   const { cartState } = useCart()
   const { kioskPaymentOption } = cartState
   console.log('cartState', cartState)
   const {
      profileInfo,
      paymentInfo,
      setIsPaymentInitiated,
      setIsProcessingPayment,
      updatePaymentState,
      initializePayment,
   } = usePayment()

   // update cart mutation
   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onError: error => {
         console.log(error)
         addToast(error.message, { appearance: 'error' })
      },
   })

   const isValid = () => {
      if (isKioskMode) {
         return true
      }
      return Boolean(
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
      console.log('PayButton: onPayClickHandler')
      if (isKioskMode) {
         console.log('inside kiosk condition')
         if (cartId) {
            setIsProcessingPayment(true)
            initializePayment(cartId)
            updatePaymentState({
               paymentLifeCycleState: 'INCREMENT_PAYMENT_RETRY_ATTEMPT',
            })

            updateCart({
               variables: {
                  id: cartId,
                  _inc: { paymentRetryAttempt: 1 },
                  _set: {
                     toUseAvailablePaymentOptionId: isKioskMode
                        ? kioskPaymentOption?.terminal
                        : paymentInfo?.selectedAvailablePaymentOption?.id,
                     ...(!isEmpty(profileInfo) && {
                        customerInfo: {
                           customerEmail: profileInfo?.email,
                           customerPhone: profileInfo?.phone,
                           customerLastName: profileInfo?.lastName,
                           customerFirstName: profileInfo?.firstName,
                        },
                     }),
                  },
               },
            })
         }
      } else {
         if (!isEmpty(paymentInfo) && cartId && isValid()) {
            setIsProcessingPayment(true)
            setIsPaymentInitiated(true)
            updatePaymentState({
               paymentLifeCycleState: 'INCREMENT_PAYMENT_RETRY_ATTEMPT',
            })

            updateCart({
               variables: {
                  id: cartId,
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
