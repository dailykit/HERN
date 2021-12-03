import paytmchecksum from 'paytmchecksum'
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
         oldAmount
      } = arg
      console.log('initiating razorpay instance')
      var options = {
         MID: '', // merchant id
         WEBSITE: 'WEBSTAGING', // website
         CHANNEL_ID: 'WEB', // channel id
         INDUSTRY_TYPE_ID: 'Retail', // industry type id
         ORDER_ID: 'TEST_' + new Date().getTime(), // order id
         CUST_ID: 'DEEPAK_' + new Date().getTime(), // customer id
         TXN_AMOUNT: (amount * 100).toFixed(0), // transaction amount
         CALLBACK_URL: 'http://localhost:4000/callback', // callback url
         EMAIL: 'zackRyan18@gmail.com', // customer email id
         MOBILE_NO: '8767677672' // customer mobile number
      }
      console.log({ options })
      const generatedChecksumHash = await paytmchecksum.generateSignature(
         options,
         '' // merchant key
      )

      if (generatedChecksumHash) {
         console.log('generateSignature Returns: ', generatedChecksumHash)
         const response = { ...options, CHECKSUMHASH: generatedChecksumHash }
         await paymentLogger({
            cartPaymentId,
            transactionRemark: response,
            requestId: response.ORDER_ID,
            paymentStatus: 'PENDING'
         })
         return {
            success: true,
            data: response,
            message: 'Order created via paytm'
         }
      } else {
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
