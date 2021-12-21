import React from 'react'
import { isClient } from '../utils'
import axios from 'axios'

function useTerminalPay() {
   const initiateTerminalPayment = async cartPayment => {
      console.log('initiateTerminalPayment')
      const terminalResponseData = {
         cartPaymentId: cartPayment.id,
         status: 'PROCESSING',
         transactionId: `TXN-${new Date().getTime()}`,
      }
      const baseUrl = isClient ? window.location.origin : ''
      const url = `${baseUrl}/server/api/payment/handle-payment-webhook`
      const response = await axios({
         url,
         method: 'POST',
         headers: {
            'payment-type': 'terminal',
         },
         data: terminalResponseData,
      })
      return response.data
   }

   const byPassTerminalPayment = async ({ type, cartPayment }) => {
      console.log('byPassTerminalPayment')

      const terminalResponseData = {
         cartPaymentId: cartPayment.id,
         status: type === 'success' ? 'SUCCEEDED' : 'FAILED',
         transactionId: `TXN-${new Date().getTime()}`,
         transactionRemark: {
            id: 'NA',
            amount: 0,
            message: 'payment bypassed',
            reason: 'test mode',
         },
      }
      const baseUrl = isClient ? window.location.origin : ''
      const url = `${baseUrl}/server/api/payment/handle-payment-webhook`
      const response = await axios({
         url,
         method: 'POST',
         data: terminalResponseData,
      })
      return response.data
   }

   return {
      initiateTerminalPayment,
      byPassTerminalPayment,
   }
}

export { useTerminalPay }
