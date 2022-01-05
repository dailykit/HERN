import crypto from 'crypto'

import get_env from '../../../../../get_env'

const razorpayWebhookEvents = async arg => {
   try {
      const { razorpay_signature, razorpay_order_id, razorpay_payment_id } =
         arg.body

      const RAZORPAY_SECRET_KEY = await get_env('RAZORPAY_SECRET_KEY')

      const body = `${razorpay_order_id}|${razorpay_payment_id}`

      let expectedSignature = crypto
         .createHmac('sha256', RAZORPAY_SECRET_KEY)
         .update(body)
         .digest('hex')

      if (expectedSignature !== razorpay_signature) {
         return {
            success: false,
            signatureIsValid: false,
            code: 500,
            error: 'Signature is not valid'
         }
      }
      return {
         success: false,
         signatureIsValid: true,
         code: 200,
         received: true
      }
   } catch (error) {
      return { success: false, code: 500, error }
   }
}

export default razorpayWebhookEvents
