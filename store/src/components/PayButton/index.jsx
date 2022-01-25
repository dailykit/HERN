import React, { useEffect } from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import isEmpty from 'lodash/isEmpty'
import { Skeleton } from 'antd'
import { useToasts } from 'react-toast-notifications'

import { Button } from '../button'
import * as QUERIES from '../../graphql'
import { usePayment } from '../../lib'
import { useCart } from '../../context'
import { isKiosk, useTerminalPay } from '../../utils'

function PayButton({
   children,
   selectedAvailablePaymentOptionId = null,
   cartId = null,
   ...props
}) {
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
      setPaymentInfo,
   } = usePayment()
   const { checkTerminalStatus } = useTerminalPay()
   const { addToast } = useToasts()

   // query for fetching available payment options
   const {
      loading,
      error,
      data: { cart = {} } = {},
   } = useSubscription(QUERIES.GET_PAYMENT_OPTIONS, {
      skip: !cartId,
      variables: {
         id: cartId,
      },
   })

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

   const onPayClickHandler = async () => {
      console.log('PayButton: onPayClickHandler')
      if (isKioskMode) {
         console.log('inside kiosk condition')
         const response = await checkTerminalStatus()
         if (response && response === 'BUSY')
            return addToast('Terminal is busy', { appearance: 'error' })
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
                     toUseAvailablePaymentOptionId:
                        selectedAvailablePaymentOptionId,
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

   useEffect(() => {
      if (!loading && !isEmpty(cart)) {
         if (isEmpty(paymentInfo.selectedAvailablePaymentOption)) {
            setPaymentInfo({
               selectedAvailablePaymentOption: {
                  ...paymentInfo.selectedAvailablePaymentOption,
                  ...cart.availablePaymentOptionToCart[0],
               },
            })
         }
      }
   }, [cart])

   return (
      <>
         {loading ? (
            <Skeleton.Button active size="large" block={true} />
         ) : (
            <Button
               onClick={onPayClickHandler}
               disabled={!Boolean(isValid())}
               {...props}
            >
               {children}
            </Button>
         )}
      </>
   )
}
export default PayButton
