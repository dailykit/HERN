import stripe from '../../lib/stripe'
import { isObjectValid } from '../../utils'

export const create = async (req, res) => {
   try {
      const { id } = req.body
      const _stripe = await stripe()
      const response = await _stripe.customers.createSource(
         id,
         ...(req.body.source && { source: req.body.source })
      )

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
      const { customerId, cardId } = req.query
      const _stripe = await stripe()
      const response = await _stripe.customers.retrieveSource(
         customerId,
         cardId
      )

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
      const { customerId, cardId, update } = req.body
      const _stripe = await stripe()
      const response = await _stripe.customers.updateSource(
         customerId,
         cardId,
         update
      )

      if (isObjectValid(response)) {
         return res.json({ success: true, data: response })
      } else {
         throw Error('Didnt get any response from Stripe!')
      }
   } catch (error) {
      return res.json({ success: false, error: error.message })
   }
}

export const remove = async (req, res) => {
   try {
      const { customerId, cardId } = req.query
      const _stripe = await stripe()
      const response = await _stripe.customers.deleteSource(customerId, cardId)

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
      const _stripe = await stripe()
      const { customerId, limit = 10 } = req.query
      const response = await _stripe.customers.listSources(customerId, {
         limit,
         object: 'card'
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
