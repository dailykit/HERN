import _isEmtpy from 'lodash/isEmpty'

import { initiateTransaction } from './functions'
import { client } from '../../../../lib/graphql'
import { logger, paymentLogger } from '../../../../utils'
import get_env from '../../../../../get_env'
import { AVAILABLE_PAYMENT_OPTION, CART } from '../../graphql'

const initiatePayment = async arg => {
   try {
      const {
         id: cartPaymentId,
         statementDescriptor,
         stripeInvoiceId,
         paymentMethodId: paymentMethod,
         paymentCustomerId,
         requires3dSecure,
         amount,
         oldAmount,
         host,
         cartId,
         metaData
      } = arg

      let orderId
      if (cartId) {
         orderId = `ORD-${cartId}-${cartPaymentId}`
         var { cart = {} } = await client.request(CART, {
            id: cartId
         })
      } else {
         return {
            success: false,
            message: 'Failed to create order'
         }
      }

      const { availablePaymentOption = {} } = await client.request(
         AVAILABLE_PAYMENT_OPTION,
         {
            id: arg.usedAvailablePaymentOptionId
         }
      )

      let AllowedPaymentMode
      if (!_isEmtpy(availablePaymentOption)) {
         AllowedPaymentMode = getPaymentMode(availablePaymentOption.label)
      }

      const { locationKioskId, orderTab } = cart
      const { availableOrderInterfaceLabel: orderInterface } = orderTab
      const response = await initiateTransaction({
         ...arg,
         AllowedPaymentMode,
         orderId,
         orderInterface,
         locationKioskId
      })

      if (_isEmtpy(response) || response.ResponseCode !== 0) {
         await paymentLogger({
            cartPaymentId,
            paymentStatus: 'FAILED'
         })
         return {
            success: false,
            message: 'Failed to create order'
         }
      }
      await paymentLogger({
         cartPaymentId,
         transactionRemark: response,
         requestId: orderId,
         paymentStatus: 'SWIPE_CARD',
         transactionId: `${response.PlutusTransactionReferenceID}`
      })
      return {
         success: true,
         data: response,
         message: 'Order created via pine labs'
      }
   } catch (error) {
      console.error('error from pine labs initiatePayment', error)
      logger('/api/payment/initiate-payment', error)
      return {
         success: false,
         error: error.message
      }
   }
}

export default initiatePayment

const getPaymentMode = label => {
   let paymentMode = 1
   if ('Pine Labs POS' === label) {
      paymentMode = 1
   }
   return paymentMode
}
