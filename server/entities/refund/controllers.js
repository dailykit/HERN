import stripe from '../../lib/stripe'
import { isObjectValid } from '../../utils'

export const create = async (req, res) => {
   try {
      const { payment_intent } = req.body
      const _stripe = await stripe()
      const response = await _stripe.refunds.create({
         payment_intent
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

export const get = async (req, res) => {
   try {
      const { id } = req.params
      const _stripe = await stripe()
      const response = await _stripe.refunds.retrieve(id)

      if (isObjectValid(response)) {
         return res.json({ success: true, data: response })
      } else {
         throw Error('Didnt get any response from Stripe!')
      }
   } catch (error) {
      return res.json({ success: false, error: error.message })
   }
}

export const update = async (req, res) => {
   try {
      const { id, metadata } = req.body
      const _stripe = await stripe()
      const response = await _stripe.refunds.update(id, { metadata })

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
      const { limit } = req.query
      const _stripe = await stripe()

      const response = await _stripe.refunds.list({ limit })

      if (isObjectValid(response)) {
         return res.json({ success: true, data: response })
      } else {
         throw Error('Didnt get any response from Stripe!')
      }
   } catch (error) {
      return res.json({ success: false, error: error.message })
   }
}
