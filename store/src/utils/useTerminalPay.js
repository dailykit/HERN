import { useRef } from 'react'
import { useMutation } from '@apollo/react-hooks'
import axios from 'axios'
import isEmpty from 'lodash/isEmpty'

import { isClient, formatTerminalStatus } from '../utils'
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
   const paymentOptionRef = useRef(null)
   var socket = new WebSocket('ws://localhost:8080/neoleap_integration')

   socket.onopen = function (data) {
      console.log('on open', data)
      // connection opened – add action here
   }
   socket.onmessage = async event => {
      console.log('onmessage', event)
      if (!isEmpty(event)) {
         const { JsonResult = null } = event.data
         if (!isEmpty(JsonResult)) {
            const terminalResponseData = {
               cartPaymentId: cartPayment.id,
               status: formatTerminalStatus[JsonResult?.StatusCode].status,
               transactionId: JsonResult?.TransactionDateTime,
               transactionRemark: JsonResult,
            }
            return await passResponseToWebhook(terminalResponseData)
         }
      }
   }

   const onPay = data => {
      if (socket.readyState === WebSocket.OPEN) {
         console.log(data)
         const jsonStringifiedData = JSON.stringify(data)
         console.log(jsonStringifiedData)
         socket.send(jsonStringifiedData)
         console.log(new Date().getTime())
      }
   }
   const onGetLastTxn = data => {
      if (socket.readyState === WebSocket.OPEN) {
         console.log(data)
         var getLastTxnRes = socket.send(JSON.stringify(getLastTxnData))
         console.log('getLastTxn response', getLastTxnRes)
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
      onCompleted: ({ updateCartPayment }) => {
         updateCart({
            variables: {
               id: updateCartPayment.cartId,
               _inc: { paymentRetryAttempt: 1 },
               _set: {
                  ...(paymentOptionRef.current && {
                     toUseAvailablePaymentOptionId:
                        paymentOptionRef.current.codPaymentOptionId,
                  }),
               },
            },
         })
      },
      onError: error => {
         console.error(error)
      },
   })

   const initiateTerminalPayment = async cartPayment => {
      console.log('initiateTerminalPayment')
      if (!isEmpty(cartPayment) && cartPayment.id && cartPayment.amount) {
         const initiatePaymentReqData = {
            Command: 'SALE',
            PrintFlag: '1',
            Amount: cartPayment?.amount || 0,
            AdditionalData: cartPayment?.id?.toString() || '',
         }
         onPay(initiatePaymentReqData)
      }
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
      codPaymentOptionId = null,
      cartPayment,
   }) => {
      console.log('cancelling terminal payment')
      paymentOptionRef.current = codPaymentOptionId
         ? { codPaymentOptionId }
         : null
      updateCartPayment({
         variables: {
            id: cartPayment.id,
            _set: {
               ...(cartPayment?.paymentStatus !== 'FAILED' && {
                  paymentStatus: 'CANCELLED',
               }),
               isResultShown: true,
            },
         },
      })
   }

   return {
      initiateTerminalPayment,
      byPassTerminalPayment,
      cancelTerminalPayment,
   }
}

export { useTerminalPay }
