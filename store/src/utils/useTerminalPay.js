import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import axios from 'axios'
import isEmpty from 'lodash/isEmpty'

import { isClient } from '../utils'
import { UPDATE_CART, UPDATE_CART_PAYMENT } from '../graphql'

const passResponseToWebhook = async data => {
   const baseUrl = isClient ? window.location.origin : ''
   const url = `${baseUrl}/server/api/payment/handle-payment-webhook`
   const response = await axios({
      url,
      method: 'POST',
      headers: {
         'payment-type': 'terminal',
      },
      data,
   })
   return response.data
}

function useTerminalPay() {
   const [updateCart] = useMutation(UPDATE_CART, {
      onError: error => {
         console.error(error)
      },
   })
   const [updateCartPayment] = useMutation(UPDATE_CART_PAYMENT, {
      onError: error => {
         console.error(error)
      },
   })

   // React.useEffect(() => {
   //    // here we listen the responses coming from terminal
   //    // and pass them to the webhook endpoint
   // },[])

   const initiateTerminalPayment = async cartPayment => {
      console.log('initiateTerminalPayment')
      const terminalResponseData = {
         cartPaymentId: cartPayment.id,
         status: 'SWIPE_OR_INSERT',
         transactionId: `TXN-${new Date().getTime()}`,
      }
      return await passResponseToWebhook(terminalResponseData)
   }

   const byPassTerminalPayment = async ({ type, cartPayment }) => {
      console.log('byPassTerminalPayment')

      const terminalResponseData = {
         cartPaymentId: cartPayment.id,
         status: type === 'success' ? 'succeeded' : 'payment_failed',
         transactionId: `TXN-${new Date().getTime()}`,
         transactionRemark: {
            id: 'NA',
            amount: 0,
            message: 'payment bypassed',
            reason: 'test mode',
         },
      }
      return await passResponseToWebhook(terminalResponseData)
   }

   const cancelTerminalPayment = async ({
      codPaymentOptionId,
      cartPayment,
   }) => {
      console.log('cancelling terminal payment')
      const terminalResponseData = {
         cartPaymentId: cartPayment.id,
         status: 'cancelled',
         transactionId: `TXN-${new Date().getTime()}`,
      }
      const { data } = await updateCartPayment({
         variables: {
            id: cartPayment.id,
            _set: {
               paymentStatus: 'CANCELLED',
               isResultShown: true,
            },
         },
      })
      if (
         !isEmpty(data) &&
         data.updateCartPayment.paymentStatus === 'CANCELLED'
      ) {
         await updateCart({
            variables: {
               id: data.updateCartPayment.cartId,
               _inc: { paymentRetryAttempt: 1 },
               _set: {
                  toUseAvailablePaymentOptionId: codPaymentOptionId,
               },
            },
         })
      }
   }

   return {
      initiateTerminalPayment,
      byPassTerminalPayment,
      cancelTerminalPayment,
   }
}

export { useTerminalPay }
