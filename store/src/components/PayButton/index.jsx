import React, { useEffect, useState, memo } from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import isEmpty from 'lodash/isEmpty'
import { Skeleton } from 'antd'
import { useToasts } from 'react-toast-notifications'
import KioskButton from '../kiosk/component/button'
import { Button } from '../button'
import * as QUERIES from '../../graphql'
import { isKiosk, useTerminalPay } from '../../utils'
import { usePayment } from '../../lib'

function PayButton({
   children,
   selectedAvailablePaymentOptionId = null,
   cartId = null,
   fullWidthSkeleton = true,
   setPaymentTunnelOpen,
   config,
   ...props
}) {
   const isKioskMode = isKiosk()
   const {
      profileInfo,
      paymentInfo,
      setIsPaymentInitiated,
      setIsProcessingPayment,
      updatePaymentState,
      initializePayment,
      setPaymentInfo,
   } = usePayment()
   const { addToast } = useToasts()
   const [cartValidity, setCartValidity] = useState(null)

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

   const isStripe =
      paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
         ?.supportedPaymentCompany?.label === 'stripe'

   const onPayClickHandler = async () => {
      setPaymentTunnelOpen && setPaymentTunnelOpen(false)
      console.log('PayButton: onPayClickHandler')
      if (isKioskMode) {
         console.log('inside kiosk condition')
         if (cartId) {
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
                  },
               },
            })
         }
      } else {
         if (
            !isEmpty(paymentInfo) &&
            cartId &&
            !isEmpty(cartValidity) &&
            cartValidity.status
         ) {
            // setIsProcessingPayment(true)
            // setIsPaymentInitiated(true)
            // updatePaymentState({
            //    paymentLifeCycleState: 'INCREMENT_PAYMENT_RETRY_ATTEMPT',
            // })
            initializePayment(cartId)

            await updateCart({
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
                  },
               },
            })
         }
      }
   }

   useEffect(() => {
      if (!loading && !isEmpty(cart)) {
         setCartValidity(cart?.isCartValid)
         if (isEmpty(paymentInfo.selectedAvailablePaymentOption)) {
            setPaymentInfo({
               selectedAvailablePaymentOption: {
                  ...paymentInfo.selectedAvailablePaymentOption,
                  ...cart.availablePaymentOptionToCart[0],
               },
            })
         }
      }
   }, [cart, loading])

   return (
      <>
         {loading ? (
            <Skeleton.Button active size="large" block={fullWidthSkeleton} />
         ) : (
            <>
               {!isKioskMode ? (
                  <Button
                     onClick={onPayClickHandler}
                     disabled={!cartValidity?.status}
                     {...props}
                  >
                     {children}
                  </Button>
               ) : (
                  <KioskButton
                     style={{
                        paddingTop: '10px',
                        paddingBottom: '10px',
                     }}
                     onClick={onPayClickHandler}
                     disabled={!cartValidity?.status}
                     buttonConfig={config.kioskSettings.buttonSettings}
                     {...props}
                  >
                     {children}
                  </KioskButton>
               )}
            </>
         )}
      </>
   )
}
export default memo(PayButton)
