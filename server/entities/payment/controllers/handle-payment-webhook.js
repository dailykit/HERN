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
         await paymentLogger({
            ...result.data,
            comment: 'Updated by payment logger by handle payment webhook'
         })
      }
      if (result.success && result.company === 'paytm' && result.doRedirect) {
         const paymentStatus = {
            TXN_SUCCESS: 'SUCCEEDED',
            TXN_FAILURE: 'FAILED'
         }
         let url
         if (process.env.NODE_ENV === 'development') {
            if (result.data.cartId) {
               url = `http://localhost:3000/checkout?id=${
                  result.data.cartId
               }&payment=${paymentStatus[result.data.paymentStatus]}`
            } else {
               let redirectPath = new URL(
                  `http://localhost:3000/${result.data.metaData.redirectTo}`
               )
               redirectPath.searchParams.append(
                  'paymentId',
                  result.data.cartPaymentId
               )
               redirectPath.searchParams.append(
                  'payment',
                  paymentStatus[result.data.paymentStatus]
               )
               url = redirectPath.href
            }
         } else {
            if (result.data.cartId) {
               url = `https://${result.data.domain}/checkout?id=${
                  result.data.cartId
               }&payment=${paymentStatus[result.data.paymentStatus]}`
            } else {
               let redirectPath = new URL(
                  `https://${result.data.domain}/${result.data.metaData.redirectTo}`
               )
               redirectPath.searchParams.append(
                  'paymentId',
                  result.data.cartPaymentId
               )
               redirectPath.searchParams.append(
                  'payment',
                  paymentStatus[result.data.paymentStatus]
               )
               url = redirectPath.href
            }
         }
         return res.redirect(url)
      }
      return res.status(result.code).json(result)
   } catch (error) {
      return res.status(500).json({ success: false, error })
   }
}
