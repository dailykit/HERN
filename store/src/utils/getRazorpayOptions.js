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
      const selectedCustomerPaymentMethod = paymentInfo?.paymentMethods.find(
         method =>
            method.supportedPaymentOptionId ===
            paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
               ?.id
      )
      let checkout_option = {}
      if (
         paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
            ?.paymentOptionLabel === 'NETBANKING'
      ) {
         checkout_option = {
            method:
               METHOD[
                  paymentInfo?.selectedAvailablePaymentOption
                     ?.supportedPaymentOption?.paymentOptionLabel
               ],
            bank: selectedCustomerPaymentMethod?.paymentMethodId || '',
         }
      } else if (
         paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
            ?.paymentOptionLabel === 'UPI'
      ) {
         checkout_option = {
            method:
               METHOD[
                  paymentInfo?.selectedAvailablePaymentOption
                     ?.supportedPaymentOption?.paymentOptionLabel
               ],
            vpa: selectedCustomerPaymentMethod?.paymentMethodId || '',
         }
      } else if (
         paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
            ?.paymentOptionLabel === 'CREDIT_CARD/DEBIT_CARD(ONE_TIME)'
      ) {
         checkout_option = {
            method:
               METHOD[
                  paymentInfo?.selectedAvailablePaymentOption
                     ?.supportedPaymentOption?.paymentOptionLabel
               ],
            'card[name]':
               paymentInfo?.selectedAvailablePaymentOption?.cardName || '',
            'card[number]':
               paymentInfo?.selectedAvailablePaymentOption?.cardNumber || '',
            'card[expiry]':
               paymentInfo?.selectedAvailablePaymentOption?.expiry || '',
            'card[cvv]': paymentInfo?.selectedAvailablePaymentOption?.cvv || '',
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
            name: `${profileInfo?.firstName} ${profileInfo?.lastName}`,
            email: `${profileInfo?.email}`,
            contact: `${profileInfo?.phone}`,
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
