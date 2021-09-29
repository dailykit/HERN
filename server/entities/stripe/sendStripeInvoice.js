import { logger } from '../../utils'
import stripe from '../../lib/stripe'

export const sendStripeInvoice = async (req, res) => {
   try {
      const { id } = req.body.input
      const _stripe = await stripe()

      await _stripe.invoices.sendInvoice(id)

      return res.status(200).json({
         success: true,
         message: 'Successfully to sent invoice!'
      })
   } catch (error) {
      logger('/api/webhooks/stripe/send-invoice', error)
      return res.status(400).json({
         success: false,
         message: error.message || 'Failed to send invoice!'
      })
   }
}
