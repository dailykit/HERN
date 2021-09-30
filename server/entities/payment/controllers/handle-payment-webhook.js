import { paymentLogger } from '../../../utils'

export const handlePaymentWebhook = async (req, res) => {
   try {
      const paymentType = 'stripe' // need to figure out how to get this from the request
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
