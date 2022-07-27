import { useRef, useEffect, useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import axios from 'axios'
import isEmpty from 'lodash/isEmpty'

import { get_env } from './get_env'
import { isClient } from './isClient'
import { formatTerminalStatus } from './formatTerminalStatus'
import { UPDATE_CART, UPDATE_CART_PAYMENT } from '../graphql'

const passResponseToWebhook = async data => {
   const baseUrl = isClient ? get_env('BASE_BRAND_URL') : ''
   const url = `${baseUrl}/server/api/payment/handle-payment-webhook/terminal`
   const response = await axios({
      url,
      method: 'POST',
      data,
   })
   return response.data
}

function usePineLabsTerminalPay() {
   const paymentOptionRef = useRef(null)
   const cartPaymentIdRef = useRef(null)
   const TERMINAL_WEBSOCKET_URL =
      get_env('PINE_LABS_TERMINAL_WEBSOCKET_URL') || 'ws://127.0.0.1:8082/'

   function connect() {
      return new Promise(function (resolve, reject) {
         var server = new WebSocket(TERMINAL_WEBSOCKET_URL)
         server.onopen = function () {
            resolve(server)
         }
         server.onerror = function (err) {
            reject(err)
         }
      })
   }

   function parseSalesTxnResponse(message) {
      let data = message.split(' ,')
      data = data.map(item => item.slice(1, item.length - 1))
      let cartPaymentId = data[0]?.split('-')?.splice(-1)
      return {
         cartPaymentId: parseInt(cartPaymentId),
         status: data[2] === 'APPROVED' ? 'succeeded' : 'payment_failed',
         transactionRemark: { response: message },
      }
   }

   const onPay = async data => {
      try {
         if (isClient) {
            const ws = await connect()
            if (ws.readyState === WebSocket.OPEN) {
               ws.send(data)
               ws.onmessage = async message => {
                  console.log(
                     '==> Pine labs WebSocket onmessage: ',
                     message.data
                  )
                  if (!isEmpty(message)) {
                     const parsedData = parseSalesTxnResponse(message.data)
                     return passResponseToWebhook(parsedData)
                  }
               }
               ws.onclose = function (data) {
                  console.log('Pine labs connection closed: ', data)
                  return new Error('WebSocket connection with Pine Labs closed')
                  // connection closed – add action here
               }
            } else {
               return new Error('WebSocket is not open')
            }
         }
      } catch (err) {
         console.log('err', err)
         await updateCartPayment({
            variables: {
               id: cartPaymentIdRef.current,
               _set: {
                  paymentStatus: 'CANCELLED',
               },
            },
         })
      }
   }

   const [updateCart] = useMutation(UPDATE_CART, {
      onCompleted: () => {
         paymentOptionRef.current = null
      },
      onError: error => {
         console.error(error)
      },
   })
   const [updateCartPayment] = useMutation(UPDATE_CART_PAYMENT, {
      onCompleted: ({ updateCartPayment }) => {},
      onError: error => {
         console.error(error)
      },
   })

   const initiateTerminalPayment = async cartPayment => {
      if (!isEmpty(cartPayment) && cartPayment.id && cartPayment.amount) {
         cartPaymentIdRef.current = cartPayment.id
         console.log('Inside pine labs initiateTerminalPayment if condition')
         let orderId
         if (cartPayment?.cartId) {
            orderId = `ORD-${cartPayment?.cartId}-${cartPayment.id}`
         } else {
            orderId = `ORD-${cartPayment.id}`
         }
         // CSV Format for Sales Txn:  4001,{Transaction Number},{Amount in paisa}
         const initiatePaymentReqData = `${4001},${orderId},${cartPayment.amount
            .toFixed(2)
            .replace('.', '')}`
         await onPay(initiatePaymentReqData)

         const terminalResponseData = {
            cartPaymentId: parseInt(cartPaymentIdRef.current),
            status: 'SWIPE_CARD',
         }
         return passResponseToWebhook(terminalResponseData)
      }
   }

   const cancelTerminalPayment = async ({
      paymentOptionId = null,
      retryPaymentAttempt = true,
      cartPayment,
   }) => {
      console.log('cancelling pine labs terminal payment')
      paymentOptionRef.current = codPaymentOptionId
         ? { codPaymentOptionId }
         : null
      await updateCartPayment({
         variables: {
            id: cartPayment.id,
            _set: {
               ...(cartPayment?.paymentStatus !== 'FAILED' && {
                  paymentStatus: 'CANCELLED',
               }),
               // isResultShown: true,
            },
         },
      })
      if (retryPaymentAttempt) {
         await updateCart({
            variables: {
               id: cartPayment.cartId,
               _inc: { paymentRetryAttempt: 1 },
               _set: {
                  ...(paymentOptionId && {
                     toUseAvailablePaymentOptionId: paymentOptionId,
                  }),
               },
            },
         })
      }
   }

   return {
      initiateTerminalPayment,
      cancelTerminalPayment,
   }
}

export { usePineLabsTerminalPay }
