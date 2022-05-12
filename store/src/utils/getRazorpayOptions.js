import { get_env } from './get_env'
import _isEmpty from 'lodash/isEmpty'

const METHOD = {
   NETBANKING: 'netbanking',
   CARD: 'card',
   UPI: 'upi',
   EMI: 'emi',
}
export const getRazorpayOptions = ({
   orderDetails = null,
   brand = null,
   theme = null,
   paymentInfo = null,
   profileInfo = null,
   ondismissHandler = () => null,
   eventHandler = () => null,
}) => {
   if (!_isEmpty(orderDetails) && !_isEmpty(paymentInfo)) {
      const RAZORPAY_KEY_ID = get_env('RAZORPAY_KEY_ID')
      const {
         id: razorpay_order_id,
         notes,
         amount,
         status,
         receipt,
         currency,
      } = orderDetails

      let checkout_option = {}
      if (
         paymentInfo?.supportedPaymentOption?.paymentOptionLabel ===
         'NETBANKING'
      ) {
         checkout_option = {
            method:
               METHOD[paymentInfo?.supportedPaymentOption?.paymentOptionLabel],
            bank: '',
         }
      } else if (
         paymentInfo?.supportedPaymentOption?.paymentOptionLabel === 'UPI'
      ) {
         checkout_option = {
            method:
               METHOD[paymentInfo?.supportedPaymentOption?.paymentOptionLabel],
            vpa: '',
         }
      } else if (
         paymentInfo?.supportedPaymentOption?.paymentOptionLabel === 'CARD'
      ) {
         checkout_option = {
            method:
               METHOD[paymentInfo?.supportedPaymentOption?.paymentOptionLabel],
            'card[name]': '',
            'card[number]': '',
            'card[expiry]': '',
            'card[cvv]': '',
         }
      }

      const options = {
         key: RAZORPAY_KEY_ID,
         theme: {
            hide_topbar: true,
            backdrop_color: '#231F20',
            ...(theme?.accent?.value && { color: theme?.accent?.value }),
         },
         ...(brand?.brandLogo?.value && { image: brand?.brandLogo?.value }),
         ...(brand?.brandName?.value && { name: brand?.brandName?.value }),
         amount: amount.toString(),
         currency,
         order_id: razorpay_order_id,
         notes,
         prefill: {
            name: `${profileInfo?.customerFirstName || ''} ${
               profileInfo?.customerLastName || ''
            }`,
            email: `${profileInfo?.customerEmail || ''}`,
            contact: `${profileInfo?.customerPhone || ''}`,
            ...checkout_option,
         },

         // config: {
         //    display: {
         //       blocks: {
         //          banks: {
         //             name: 'Google Pay',
         //             instruments: [
         //                {
         //                   method: 'upi',
         //                   flows: ['collect'],
         //                   apps: ['google_pay'],
         //                },
         //             ],
         //          },
         //       },
         //       sequence: ['block.banks'],
         //       preferences: {
         //          show_default_blocks: false,
         //       },
         //    },
         // },
         modal: {
            ondismiss: ondismissHandler,
            confirm_close: true,
         },
         handler: eventHandler,
         retry: {
            enabled: false,
         },
      }
      return options
   }
   return null
}
