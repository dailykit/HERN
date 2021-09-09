import get from 'lodash/get'
import stripe from '../../../../lib/stripe'
import { client } from '../../../../lib/graphql'
import get_env from '../../../../../get_env'
import { CART_PAYMENT } from '../../graphql'

const stripeWebhookEvents = async arg => {
   try {
      const _stripe = await stripe()
      const signature = arg.headers['stripe-signature']
      let event
      console.log({ signature })
      let SECRET = await get_env('WEBHOOK_STRIPE_SECRET')
      console.log({ SECRET })
      const body = JSON.parse(arg.rawBody)
      console.log({ body })
      if ('account' in body && body.account) {
         SECRET = await get_env('WEBHOOK_STRIPE_CONNECT_SECRET')
      }
      console.log({ SECRET })

      try {
         //  console.log(_stripe, signature, SECRET)
         event = await _stripe.webhooks.constructEvent(
            arg.rawBody,
            signature,
            SECRET
         )
         console.log({ event })
      } catch (err) {
         console.log(err)
         return {
            success: false,
            code: 400,
            error: `Webhook Error: ${err.message}`
         }
      }

      const node = event.data.object
      console.log({ node })

      if (!['invoice', 'payment_intent'].includes(node.object))
         return {
            success: true,
            code: 200,
            error: `No such event has been mapped yet!`
         }

      const { cartPayment } = await client.request(CART_PAYMENT, {
         id: Number(node.metadata.cartPaymentId)
      })

      console.log({ cartPayment })

      if (get(cartPayment, 'id') && cartPayment.paymentStatus === 'SUCCEEDED') {
         return {
            success: true,
            code: 200,
            message:
               "Could not process invoice/intent webhook, since cart's payment has already succeeded"
         }
      }

      if (node.object === 'invoice') {
         const data = {
            event: node.object,
            eventType: event.type,
            invoice: event.data.object,
            cartPaymentId: node.metadata.cartPaymentId
         }
         return { success: true, data, code: 200, received: true }
      }
      if (node.object === 'payment_intent') {
         const data = {
            event: node.object,
            intent: event.data.object,
            cartPaymentId: node.metadata.cartPaymentId
         }
         return { success: true, code: 200, data, received: true }
      }
   } catch (error) {
      return { success: false, code: 500, error }
   }
}

export default stripeWebhookEvents
