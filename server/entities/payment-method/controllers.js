import stripe from '../../lib/stripe'
import { isObjectValid } from '../../utils'

export const get = async (req, res) => {
   try {
      const { id } = req.params
      const { accountId } = req.query
      const _stripe = await stripe()
      let response = null
      if (accountId) {
         response = await _stripe.paymentMethods.retrieve(id, {
            stripeAccount: accountId
         })
      } else {
         response = await _stripe.paymentMethods.retrieve(id)
      }

      if (isObjectValid(response)) {
         return res.json({ success: true, data: response })
      } else {
         throw Error('Didnt get any response from Stripe!')
      }
   } catch (error) {
      return res.json({ success: false, error: error.message })
   }
}

export const list = async (req, res) => {
   try {
      const { customer } = req.query
      const _stripe = await stripe()
      const response = await _stripe.paymentMethods.list({
         customer,
         type: 'card'
      })

      if (isObjectValid(response)) {
         return res.json({ success: true, data: response })
      } else {
         throw Error('Didnt get any response from Stripe!')
      }
   } catch (error) {
      return res.json({ success: false, error: error.message })
   }
}
