import { paymentLogger } from '../../../utils'

export const handlePaymentWebhook = async (req, res) => {
   try {
      const stripeSignature = req.headers['stripe-signature']
      const razorpaySignature =
         req.headers['x-razorpay-signature'] || req.body.razorpay_signature
      const isPaytmWebhook = [
         'https://securegw-stage.paytm.in',
         'https://securegw.paytm.in'
      ].includes(req.headers['origin'])
      const isTerminalPayment = req.headers['payment-type'] === 'terminal'
      let paymentType
      if (stripeSignature) {
         paymentType = 'stripe'
      } else if (razorpaySignature) {
         paymentType = 'razorpay'
      } else if (isPaytmWebhook) {
         paymentType = 'paytm'
      } else if (isTerminalPayment) {
         paymentType = 'terminal'
      } else {
         return
      }
      const functionFilePath = `../functions/${paymentType}`
      const method = await import(functionFilePath)
      const result = await method.default(req, 'webhook')
      if (result.success && result.data) {
         console.log('result.data', result.data)
         await paymentLogger(result.data)
      }
      if (result.success && result.company === 'paytm') {
         const paymentStatus = {
            TXN_SUCCESS: 'SUCCEEDED',
            TXN_FAILURE: 'FAILED'
         }
         return res.redirect(
            301,
            `/checkout?id=${result.data.cartId}&payment=${
               paymentStatus[result.data.paymentStatus]
            }`
         )
      }
      return res.status(result.code).json(result)
   } catch (error) {
      return res.status(500).json({ success: false, error })
   }
}
