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
      let SECRET =
         'whsec_ivLV3pCHRGf8igUIT4DTdzISsLjCkayq' ||
         (await get_env('WEBHOOK_STRIPE_SECRET'))
      const body = JSON.parse(arg.rawBody)
      if ('account' in body && body.account) {
         SECRET =
            'whsec_ivLV3pCHRGf8igUIT4DTdzISsLjCkayq' ||
            (await get_env('WEBHOOK_STRIPE_CONNECT_SECRET'))
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

      const { cartPayment } = await client.request(CART_PAYMENT, {
         id: Number(node.metadata.cartPaymentId)
      })

      if (get(cartPayment, 'id') && cartPayment.paymentStatus === 'SUCCEEDED') {
         return {
            success: true,
            code: 200,
            message:
               "Could not process invoice/intent webhook, since cart's payment has already succeeded"
         }
      }
      let payment_intent = null
      let actionUrl = null
      let actionRequired = false
      if (node.payment_intent) {
         payment_intent = await _stripe.paymentIntents.retrieve(
            node.payment_intent
         )
         // SEND ACTION REQUIRED SMS
         if (event.type === 'invoice.payment_action_required') {
            // sendSMS({ cartPaymentId, transactionRemark: payment_intent })
            if (
               payment_intent &&
               Object.keys(payment_intent).length > 0 &&
               payment_intent.next_action
            ) {
               actionRequired = true
               if (payment_intent.next_action.type === 'use_stripe_sdk') {
                  actionUrl =
                     payment_intent.next_action.use_stripe_sdk.stripe_js
               } else {
                  actionUrl = payment_intent.next_action.redirect_to_url.url
               }
            }
         }
      }

      // const data = {
      //    eventType: event.type,
      //    invoice: node
      // }
      const requiredData = {
         cartPaymentId: node.metadata.cartPaymentId,
         requestId: node.id,
         stripeInvoiceDetails: node,
         actionUrl,
         actionRequired,
         ...(payment_intent && {
            transactionRemark: payment_intent,
            transactionId: payment_intent.id,
            paymentStatus: payment_intent.status
         })
      }
      return { success: true, data: requiredData, code: 200, received: true }
   } catch (error) {
      return { success: false, code: 500, error }
   }
}

export default stripeWebhookEvents
