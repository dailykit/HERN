import stripe from '../../../lib/stripe'
import { isObjectValid, logger } from '../../../utils'

export const createSetupIntent = async (req, res) => {
   try {
      const { customer } = req.body
      const _stripe = await stripe()
      const response = await _stripe.setupIntents.create({ customer })

      if (isObjectValid(response)) {
         return res.json({ success: true, data: response })
      } else {
         throw Error('Didnt get any response from Stripe!')
      }
   } catch (error) {
      logger('/api/setup-intent', error.message)
      return res.json({ success: false, error: error.message })
   }
}

export const updateSetupIntent = async (req, res) => {
   try {
      const { id } = req.params
      const _stripe = await stripe()
      const response = await _stripe.setupIntents.update(id, {
         ...req.body
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

export const cancelSetupIntent = async (req, res) => {
   try {
      const { id } = req.params
      const _stripe = await stripe()
      const response = await _stripe.setupIntents.cancel(id)

      if (isObjectValid(response)) {
         return res.json({ success: true, data: response })
      } else {
         throw Error('Didnt get any response from Stripe!')
      }
   } catch (error) {
      return res.json({ success: false, error: error.message })
   }
}

export const getSetupIntent = async (req, res) => {
   try {
      const { id } = req.body
      const _stripe = await stripe()
      const response = await _stripe.setupIntents.retrieve({
         id
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

export const listSetupIntent = async (req, res) => {
   try {
      const _stripe = await stripe()
      const response = await _stripe.setupIntents.list(req.query)

      if (isObjectValid(response)) {
         return res.json({ success: true, data: response })
      } else {
         throw Error('Didnt get any response from Stripe!')
      }
   } catch (error) {
      return res.json({ success: false, error: error.message })
   }
}
