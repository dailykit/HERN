import { get_env } from './get_env'
import _isEmpty from 'lodash/isEmpty'

const METHOD = {
   NETBANKING: 'netbanking',
   CARD: 'card',
   UPI: 'upi',
   EMI: 'emi',
}
export const getPaytmOptions = ({
   orderDetails = null,
   paymentInfo = null,
   profileInfo = null,
   ondismissHandler = () => null,
   eventHandler = () => null,
}) => {
   if (!_isEmpty(orderDetails) && !_isEmpty(paymentInfo)) {
      // const RAZORPAY_KEY_ID = get_env('RAZORPAY_KEY_ID')
      // const {
      //    id: razorpay_order_id,
      //    notes,
      //    amount,
      //    status,
      //    receipt,
      //    currency,
      // } = orderDetails
      // const selectedCustomerPaymentMethod = paymentInfo?.paymentMethods.find(
      //    method =>
      //       method.supportedPaymentOptionId ===
      //       paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
      //          ?.id
      // )
      let checkout_option = {}
      // if (
      //    paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
      //       ?.paymentOptionLabel === 'NETBANKING'
      // ) {
      //    checkout_option = {
      //       method:
      //          METHOD[
      //             paymentInfo?.selectedAvailablePaymentOption
      //                ?.supportedPaymentOption?.paymentOptionLabel
      //          ],
      //       bank: selectedCustomerPaymentMethod?.paymentMethodId || '',
      //    }
      // } else if (
      //    paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
      //       ?.paymentOptionLabel === 'UPI'
      // ) {
      //    checkout_option = {
      //       method:
      //          METHOD[
      //             paymentInfo?.selectedAvailablePaymentOption
      //                ?.supportedPaymentOption?.paymentOptionLabel
      //          ],
      //       vpa: selectedCustomerPaymentMethod?.paymentMethodId || '',
      //    }
      // } else if (
      //    paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
      //       ?.paymentOptionLabel === 'CREDIT_CARD/DEBIT_CARD(ONE_TIME)'
      // ) {
      //    checkout_option = {
      //       method:
      //          METHOD[
      //             paymentInfo?.selectedAvailablePaymentOption
      //                ?.supportedPaymentOption?.paymentOptionLabel
      //          ],
      //       'card[name]':
      //          paymentInfo?.selectedAvailablePaymentOption?.cardName || '',
      //       'card[number]':
      //          paymentInfo?.selectedAvailablePaymentOption?.cardNumber || '',
      //       'card[expiry]':
      //          paymentInfo?.selectedAvailablePaymentOption?.expiry || '',
      //       'card[cvv]': paymentInfo?.selectedAvailablePaymentOption?.cvv || '',
      //    }
      // }

      const options = {
         root: '',
         flow: 'DEFAULT',
         data: {
            orderId: '' /* update order id */,
            token: '' /* update token value */,
            tokenType: 'TXN_TOKEN',
            amount: '100' /* update amount */,
         },
         handler: {
            notifyMerchant(eventName, data) {
               console.log('notifyMerchant handler function called')
               console.log('eventName => ', eventName)
               console.log('data => ', data)
            },
         },
      }
      return options
   }
   return null
}
