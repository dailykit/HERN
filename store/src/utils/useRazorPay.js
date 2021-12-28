import React from 'react'
import { isClient } from '../utils'

function useRazorPay() {
   const scriptSrc = 'https://checkout.razorpay.com/v1/checkout.js'
   const loadScript = src => {
      return new Promise(resolve => {
         const script = document.createElement('script')
         script.src = src
         script.onload = () => {
            resolve(true)
         }
         script.onerror = () => {
            resolve(false)
         }
         document.body.appendChild(script)
      })
   }

   const displayRazorpay = async options => {
      const res = await loadScript(scriptSrc)
      if (!res) {
         addToast('Razorpay SDK failed to load. Are you online?', {
            appearance: 'error',
         })
         return
      }
      if (isClient) {
         const paymentObject = new window.Razorpay(options)
         paymentObject.open()
      }
   }

   return {
      displayRazorpay,
   }
}

export { useRazorPay }
