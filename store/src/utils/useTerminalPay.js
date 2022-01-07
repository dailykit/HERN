import { useRef, useEffect, useState } from 'react'
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
   const [socket, setSocket] = useState(null)
   useEffect(() => {
      if (typeof window !== 'undefined' && window.document && !socket) {
         setSocket(new WebSocket('ws://localhost:8080/neoleap_integration'))
      }
      return () => {
         socket.close()
      }
   }, [])
   useEffect(() => {
      if (socket) {
         socket.onopen = function (data) {
            console.log('on open', data)
            // connection opened – add action here
         }
      }
   }, [socket])
   useEffect(() => {
      if (socket) {
         socket.onmessage = async event => {
            console.log('onmessage', event)
            if (!isEmpty(event)) {
               const parsedData = JSON.parse(event.data)
               console.log('parsed data', parsedData)
               const { JsonResult = null } = parsedData
               if (!isEmpty(JsonResult)) {
                  const terminalResponseData = {
                     cartPaymentId: parseInt(JsonResult.ECRReferenceNumber),
                     status:
                        formatTerminalStatus[JsonResult?.StatusCode].status,
                     transactionId: JsonResult?.TransactionDateTime,
                     transactionRemark: JsonResult,
                  }
                  console.log(JsonResult)
                  return await passResponseToWebhook(terminalResponseData)
               }
            }
         }
      }
   }, [socket])
   const onPay = async data => {
      console.log(
         'onPay outside isclient',
         isClient,
         socket,
         socket.readyState,
         socket.OPEN
      )
      if (isClient) {
         console.log('onPay inside isclient', isClient)
         console.log('socket ready?', socket.readyState, WebSocket.OPEN)
         if (socket.readyState === WebSocket.OPEN) {
            console.log('inside onPay if condition')

            console.log(data)
            const jsonStringifiedData = JSON.stringify(data)
            console.log(jsonStringifiedData)
            socket.send(jsonStringifiedData)
            console.log(new Date().getTime())
         }
      }
   }
   const onGetLastTxn = data => {
      if (isClient) {
         if (socket.readyState === WebSocket.OPEN) {
            console.log(data)
            var getLastTxnRes = socket.send(JSON.stringify(getLastTxnData))
            console.log('getLastTxn response', getLastTxnRes)
         }
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
         console.log('inside initiateTerminalPayment if condition')
         const initiatePaymentReqData = {
            Command: 'SALE',
            PrintFlag: '1',
            Amount: parseInt(cartPayment.amount * 100),
            AdditionalData: cartPayment?.id?.toString() || '',
         }
         await onPay(initiatePaymentReqData)
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
