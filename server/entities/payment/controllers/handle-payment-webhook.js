import { paymentLogger } from '../../../utils'

export const handlePaymentWebhook = async (req, res) => {
   try {
      console.log('request body from webhook', req.body, req.headers['origin'])
      const stripeSignature = req.headers['stripe-signature']
      const razorpaySignature =
         req.headers['x-razorpay-signature'] || req.body.razorpay_signature
      const isPaytmWebhook = [
         'https://securegw-stage.paytm.in',
         'https://securegw.paytm.in'
      ].includes(req.headers['origin'])
      console.log('isPaytmWebhook', isPaytmWebhook)
      let paymentType
      if (stripeSignature) {
         paymentType = 'stripe'
      } else if (razorpaySignature) {
         paymentType = 'razorpay'
      } else if (isPaytmWebhook) {
         paymentType = 'paytm'
      } else {
         return
      }
      console.log('paymentType', paymentType)
      const functionFilePath = `../functions/${paymentType}`
      const method = await import(functionFilePath)
      const result = await method.default(req, 'webhook')
      if (result.success && result.data) {
         await paymentLogger(result.data)
      }
      return res.status(result.code).json(result)
   } catch (error) {
      return res.status(500).json({ success: false, error })
   }
}
