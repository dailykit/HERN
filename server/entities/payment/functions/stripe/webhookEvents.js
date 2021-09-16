import get from 'lodash/get'
import stripe from '../../../../lib/stripe'
import { client } from '../../../../lib/graphql'
import get_env from '../../../../../get_env'
import { CART_PAYMENT } from '../../graphql'

const stripeWebhookEvents = async arg => {
   try {
      console.log('inside stripe webhookEvent function')
      const _stripe = await stripe()
      const signature = arg.headers['stripe-signature']
      let event
      let SECRET = await get_env('WEBHOOK_STRIPE_SECRET')
      const body = JSON.parse(arg.rawBody)
      if ('account' in body && body.account) {
         SECRET = await get_env('WEBHOOK_STRIPE_CONNECT_SECRET')
      }

      try {
         console.log('contructing event in stripe webhook function')
         event = await _stripe.webhooks.constructEvent(
            arg.rawBody,
            signature,
            SECRET
         )
         console.log(
            'successfully event constructed in stripe webhook function'
         )
      } catch (err) {
         console.log(err)
         return {
            success: false,
            code: 400,
            error: `Webhook Error: ${err.message}`
         }
      }

      const node = event.data.object

      if (!['invoice', 'payment_intent'].includes(node.object))
         return {
            success: true,
            code: 200,
            error: `No such event has been mapped yet!`
         }

      console.log('fetching for cartPaymentInfo in stripe webhook function')
      const { cartPayment } = await client.request(CART_PAYMENT, {
         id: Number(node.metadata.cartPaymentId)
      })
      console.log('fetched for cartPaymentInfo in stripe webhook function')

      if (get(cartPayment, 'id') && cartPayment.paymentStatus === 'SUCCEEDED') {
         return {
            success: true,
            code: 200,
            message:
               "Could not process invoice/intent webhook, since cart's payment has already succeeded"
         }
      }

      const data = {
         eventType: event.type,
         invoice: node
      }
      return { success: true, data, code: 200, received: true }
   } catch (error) {
      return { success: false, code: 500, error }
   }
}

export default stripeWebhookEvents
