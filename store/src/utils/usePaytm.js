import React from 'react'
import { isClient } from '.'

export const usePaytm = () => {
   const merchantId = 'A5npkiMoy@zOrIlX'
   const scriptSrc = `https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/${merchantId}.js`
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

   const displayPaytm = async options => {
      const res = await loadScript(scriptSrc)
      if (!res) {
         addToast('Paytm failed to load. Are you online?', {
            appearance: 'error',
         })
         return
      }
      if (isClient) {
         if (window.Paytm && window.Paytm.CheckoutJS) {
            window.Paytm.CheckoutJS.onLoad(
               function excecuteAfterCompleteLoad() {
                  // initialze configuration using init method
                  window.Paytm.CheckoutJS.init(options)
                     .then(function onSuccess() {
                        // after successfully update configuration invoke checkoutjs
                        window.Paytm.CheckoutJS.invoke()
                     })
                     .catch(function onError(error) {
                        console.log('error => ', error)
                     })
               }
            )
         }
      }
   }

   return {
      displayPaytm,
   }
}
