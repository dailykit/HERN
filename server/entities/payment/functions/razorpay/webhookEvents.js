import crypto from 'crypto'
import razorpay from '../../../../lib/razorpay'
import get_env from '../../../../../get_env'
import has from 'lodash/has'

const razorpayWebhookEvents = async arg => {
   try {
      const razorpay_signature = arg.headers['x-razorpay-signature']
      const RAZORPAY_WEBHOOK_SECRET = await get_env('RAZORPAY_WEBHOOK_SECRET')
      const razorpayInstance = await razorpay()
      let expectedSignature = crypto
         .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
         .update(JSON.stringify(arg.body))
         .digest('hex')

      if (expectedSignature !== razorpay_signature) {
         console.log('signature mismatch')
         return {
            success: false,
            signatureIsValid: false,
            code: 500,
            error: 'Signature is not valid'
         }
      }
      console.log('signature matched')
      let requiredData
      if (
         has(arg.body, 'payload.payment.entity') &&
         arg.body.payload.payment.entity.status === 'captured'
      ) {
         console.log('payment captured')
         const { entity } = arg.body.payload.payment
         console.log('fetching order details', entity)
         const { id, receipt, status } = await razorpayInstance.orders.fetch(
            entity.order_id
         )
         requiredData = {
            cartPaymentId: parseInt(receipt.split('_').pop()),
            transactionRemark: entity,
            requestId: id,
            paymentStatus: status,
            transactionId: entity.id
         }
      } else if (
         has(arg.body, 'payload.payment.entity') &&
         arg.body.payload.payment.entity.status === 'failed'
      ) {
         console.log('payment failed')
         const { entity } = arg.body.payload.payment
         const { id, receipt } = await razorpayInstance.orders.fetch(
            entity.order_id
         )
         requiredData = {
            cartPaymentId: parseInt(receipt.split('_').pop()),
            transactionRemark: entity,
            requestId: id,
            paymentStatus: entity.status,
            transactionId: entity.id
         }
      }
      return {
         success: true,
         signatureIsValid: true,
         code: 200,
         data: requiredData,
         received: true
      }
   } catch (error) {
      return { success: false, code: 500, error }
   }
}

export default razorpayWebhookEvents
