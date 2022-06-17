import React, { useEffect, useState, memo } from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import isEmpty from 'lodash/isEmpty'
import { Skeleton } from 'antd'
import { useToasts } from 'react-toast-notifications'
import KioskButton from '../kiosk/component/button'
import { Button } from '../button'
import * as QUERIES from '../../graphql'
import { isKiosk, useTerminalPay } from '../../utils'
import { usePayment, useConfig } from '../../lib'
import { useUser } from '../../context'

function PayButton({
   children,
   selectedAvailablePaymentOptionId = null,
   cartId = null,
   fullWidthSkeleton = true,
   balanceToPay = 0,
   metaData = {},
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
   const { user } = useUser()
   const { addToast } = useToasts()
   const { brand } = useConfig()
   const [cartValidity, setCartValidity] = useState(null)

   // query for fetching available payment options
   if (cartId) {
      var {
         loading,
         error,
         data: { cart = {} } = {},
      } = useSubscription(QUERIES.GET_PAYMENT_OPTIONS, {
         skip: !cartId,
         variables: {
            id: cartId,
         },
      })
   }

   // update cart mutation
   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onError: error => {
         console.log(error)
         addToast(error.message, { appearance: 'error' })
      },
   })

   // create cartPayment mutation
   const [createCartPayment] = useMutation(QUERIES.CREATE_CART_PAYMENT, {
      onError: error => {
         console.log(error)
         addToast(error.message, { appearance: 'error' })
      },
      onCompleted: data => {
         initializePayment(null, data.createCartPayment.id)
      },
   })

   const isStripe =
      paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
         ?.supportedPaymentCompany?.label === 'stripe'

   const onPayClickHandler = async () => {
      setPaymentTunnelOpen && setPaymentTunnelOpen(false)
      if (cartId) {
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
      } else {
         createCartPayment({
            variables: {
               object: {
                  paymentRetryAttempt: 1,
                  amount: balanceToPay,
                  isTest: user.isTest,
                  paymentCustomerId: user.platform_customer.paymentCustomerId,
                  paymentMethodId:
                     paymentInfo?.selectedAvailablePaymentOption
                        ?.selectedPaymentMethodId,
                  usedAvailablePaymentOptionId:
                     paymentInfo.selectedAvailablePaymentOption.id,
                  metaData: { ...metaData, brandId: brand.id },
               },
            },
         })
      }
   }

   if (cartId) {
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
   }

   return (
      <>
         {loading ? (
            <Skeleton.Button
               active
               style={{
                  ...(isKiosk && {
                     height: '145px',
                  }),
               }}
               size="large"
               block={fullWidthSkeleton}
            />
         ) : (
            <>
               {!isKioskMode ? (
                  <Button
                     onClick={onPayClickHandler}
                     disabled={cartId && !cartValidity?.status}
                     {...props}
                  >
                     {children}
                  </Button>
               ) : (
                  <KioskButton
                     customClass="hern-kiosk__pay-button"
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
