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
            bank: 'SBIN',
         }
      } else if (
         paymentInfo?.supportedPaymentOption?.paymentOptionLabel === 'UPI'
      ) {
         checkout_option = {
            method:
               METHOD[paymentInfo?.supportedPaymentOption?.paymentOptionLabel],
            vpa: '.ax@ybl',
         }
      } else if (
         paymentInfo?.supportedPaymentOption?.paymentOptionLabel ===
         'CREDIT_CARD/DEBIT_CARD(ONE_TIME)'
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
         amount: amount.toString(),
         currency,
         name: 'Test Hern',
         order_id: razorpay_order_id,
         notes,
         prefill: {
            name: `${profileInfo?.customerFirstName} ${profileInfo?.customerLastName}`,
            email: `${profileInfo?.customerEmail}`,
            contact: `${profileInfo?.customerPhone}`,
            ...checkout_option,
         },
         theme: {
            hide_topbar: true,
         },
         readonly: {
            email: '1',
            contact: '1',
            name: '1',
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
         },
         handler: eventHandler,
      }
      return options
   }
   return null
}
