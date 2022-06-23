import { paymentLogger } from '../../../utils'

export const handlePaytmQRWebhook = async (req, res) => {
   try {
      const method = await import(`../functions/paytm`)
      const result = await method.default(req, 'webhook')
      if (result.success && result.data) {
         console.log('result.data', result.data)
         await paymentLogger({
            ...result.data,
            comment: 'Updated by payment logger by handle payment webhook'
         })
      }
      return res.status(result.code).json(result)
   } catch (error) {
      return res.status(500).json({ success: false, error })
   }
}
