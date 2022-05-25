import razorpay from '../../../../lib/razorpay'
import {
   logger,
   isConnectedIntegration,
   paymentLogger
} from '../../../../utils'
import get_env from '../../../../../get_env'

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
         cartId,
         metaData = {}
      } = arg

      // Deleting redirectTo property from metaData as we can't store / character in notes for Razorpay Payment order
      delete metaData['redirectTo']

      const razorpayInstance = await razorpay()
      const CURRENCY = await get_env('RAZORPAY_CURRENCY')
      var options = {
         amount: (amount * 100).toFixed(0),
         currency: CURRENCY,
         receipt: cartId
            ? `order_rcptid_${cartId}_${cartPaymentId}`
            : `order_rcptid_${cartPaymentId}`,
         payment: {
            capture: 'automatic',
            capture_options: {
               refund_speed: 'optimum'
            }
         },
         ...(metaData && {
            notes: metaData
         })
      }
      console.log({ options })
      const response = await razorpayInstance.orders.create(options)
      if (response) {
         console.log('razorpayOrder', response)
         await paymentLogger({
            cartPaymentId,
            transactionRemark: response,
            requestId: response.id,
            paymentStatus: response.status,
            comment: 'Updated by payment logger by initiate payment'
         })
         return {
            success: true,
            data: response,
            message: 'Order created via razorpay'
         }
      } else {
         console.log('razorpayOrderError', err)
         return {
            success: false,
            data: error,
            message: 'Failed to create order'
         }
      }
   } catch (error) {
      console.log('error from stripe initiatePayment', error)
      logger('/api/payment-intent', error)
      return {
         success: false,
         error: error.message
      }
   }
}

export default initiatePayment
