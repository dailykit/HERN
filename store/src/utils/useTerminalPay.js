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
   const terminalStatusRef = useRef(null)
   const cartIdRef = useRef(null)
   const TERMINAL_WEBSOCKET_URL =
      get_env('TERMINAL_WEBSOCKET_URL') ||
      'ws://localhost:7000/neoleap_integration'

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

   const onPay = async data => {
      try {
         if (isClient) {
            const ws = await connect()
            if (ws.readyState === WebSocket.OPEN) {
               const jsonStringifiedData = JSON.stringify(data)
               ws.send(jsonStringifiedData)
               ws.onmessage = async message => {
                  console.log('onmessage', message.data)
                  if (!isEmpty(message)) {
                     const parsedData = JSON.parse(message.data)
                     console.log('parsed data', parsedData)
                     const {
                        JsonResult = null,
                        EventName = null,
                        TerminalStatus = null,
                        OptionalMessage = null,
                     } = parsedData
                     if (
                        EventName === 'TERMINAL_RESPONSE' &&
                        !isEmpty(JsonResult)
                     ) {
                        const terminalResponseData = {
                           cartPaymentId: parseInt(
                              JsonResult.ECRReferenceNumber
                           ),
                           StatusCode: JsonResult?.StatusCode,
                           status:
                              formatTerminalStatus[JsonResult?.StatusCode]
                                 .status,
                           transactionId: JsonResult?.TransactionDateTime,
                           transactionRemark: JsonResult,
                        }
                        console.log(JsonResult)
                        return passResponseToWebhook(terminalResponseData)
                     } else if (
                        EventName === 'TERMINAL_STATUS' &&
                        TerminalStatus
                     ) {
                        terminalStatusRef.current = TerminalStatus
                     } else if (
                        EventName === 'TERMINAL_ACTION' &&
                        OptionalMessage
                     ) {
                        const terminalResponseData = {
                           cartPaymentId: parseInt(cartIdRef.current),
                           status: OptionalMessage,
                           transactionRemark: parsedData,
                        }
                        return passResponseToWebhook(terminalResponseData)
                     }
                  }
               }
               ws.onclose = function (data) {
                  console.log('on close', data)
                  return new Error('WebSocket connection closed')
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
               id: cartIdRef.current,
               _set: {
                  paymentStatus: 'CANCELLED',
               },
            },
         })
      }
   }
   // const onCheckStatus = async data => {
   //    if (isClient) {
   //       if (socket.readyState === WebSocket.OPEN) {
   //          const jsonStringifiedData = JSON.stringify(data)
   //          socket.send(jsonStringifiedData)
   //       }
   //    }
   // }
   // const onGetLastTxn = data => {
   //    if (isClient) {
   //       if (socket.readyState === WebSocket.OPEN) {
   //          var getLastTxnRes = socket.send(JSON.stringify(getLastTxnData))
   //       }
   //    }
   // }

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
         // updateCart({
         //    variables: {
         //       id: updateCartPayment.cartId,
         //       _inc: { paymentRetryAttempt: 1 },
         //       _set: {
         //          ...(paymentOptionRef.current && {
         //             toUseAvailablePaymentOptionId:
         //                paymentOptionRef.current.codPaymentOptionId,
         //          }),
         //       },
         //    },
         // })
      },
      onError: error => {
         console.error(error)
      },
   })

   const initiateTerminalPayment = async cartPayment => {
      // console.log('initiateTerminalPayment')
      if (!isEmpty(cartPayment) && cartPayment.id && cartPayment.amount) {
         cartIdRef.current = cartPayment.id
         // console.log('inside initiateTerminalPayment if condition')
         const initiatePaymentReqData = {
            Command: 'SALE',
            PrintFlag: '1',
            Amount: cartPayment.amount.toFixed(2),
            AdditionalData: cartPayment?.id?.toString() || '',
         }
         await onPay(initiatePaymentReqData)
      }
   }

   const checkTerminalStatus = async () => {
      const checkTerminalStatusReqData = {
         Command: 'CHECK_STATUS',
      }
      // await onCheckStatus(checkTerminalStatusReqData)
      // console.log('terminalStatus', terminalStatusRef.current)
      // return terminalStatusRef.current
   }

   const byPassTerminalPayment = async ({ type, cartPayment }) => {
      // console.log('byPassTerminalPayment')

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
      retryPaymentAttempt = true,
      cartPayment,
   }) => {
      console.log('cancelling terminal payment')
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
                  ...(codPaymentOptionId && {
                     toUseAvailablePaymentOptionId: codPaymentOptionId,
                  }),
               },
            },
         })
      }
   }

   return {
      initiateTerminalPayment,
      byPassTerminalPayment,
      cancelTerminalPayment,
      checkTerminalStatus,
   }
}

export { useTerminalPay }
