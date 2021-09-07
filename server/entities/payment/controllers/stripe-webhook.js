import get from 'lodash/get'
import stripe from '../../../lib/stripe'
import { client } from '../../../lib/graphql'
import get_env from '../../../../get_env'
import {
   CART_PAYMENT,
   UPDATE_CART_PAYMENT,
   DATAHUB_INSERT_STRIPE_PAYMENT_HISTORY
} from '../graphql'

const STATUS = {
   created: 'CREATED',
   canceled: 'CANCELLED',
   succeeded: 'SUCCEEDED',
   processing: 'PROCESSING',
   payment_failed: 'PAYMENT_FAILED',
   requires_action: 'REQUIRES_ACTION',
   requires_payment_method: 'REQUIRES_PAYMENT_METHOD'
}

const handleInvoice = async args => {
   try {
      const _stripe = await stripe()
      const { cartPaymentId, invoice, eventType } = args
      const stripeAccountId = await get_env('STRIPE_ACCOUNT_ID')

      let payment_intent = null
      if (invoice.payment_intent) {
         payment_intent = await _stripe.paymentIntents.retrieve(
            invoice.payment_intent,
            { stripeAccount: stripeAccountId }
         )
         // SEND ACTION REQUIRED SMS
         if (eventType === 'invoice.payment_action_required') {
            console.log('SEND ACTION URL SMS')
         }
         if (
            invoice.payment_settings.payment_method_options === null &&
            eventType === 'invoice.payment_failed'
         ) {
            const wasPreviousIntentDeclined =
               payment_intent &&
               payment_intent.last_payment_error &&
               Object.keys(payment_intent.last_payment_error).length > 0 &&
               payment_intent.last_payment_error.code === 'card_declined' &&
               ['do_not_honor', 'transaction_not_allowed'].includes(
                  payment_intent.last_payment_error.decline_code
               )
            if (wasPreviousIntentDeclined) {
               console.log('INCREMENT PAYMENT ATTEMPT DUE CARD DO NOT HONOR')

               return
            }
         }
      }

      await client.request(UPDATE_CART_PAYMENT, {
         id: cartPaymentId,
         _set: {
            stripeInvoiceId: invoice.id,
            stripeInvoiceDetails: invoice,
            ...(payment_intent && {
               transactionRemark: payment_intent,
               transactionId: payment_intent.id,
               paymentStatus: STATUS[payment_intent.status]
            })
         }
      })

      let datahub_history_objects = []

      datahub_history_objects = [
         {
            cartPaymentId,
            type: 'INVOICE',
            status: invoice.status,
            stripeInvoiceId: invoice.id,
            stripeInvoiceDetails: invoice
         }
      ]
      if (payment_intent) {
         datahub_history_objects.push({
            cartPaymentId,
            type: 'PAYMENT_INTENT',
            status: payment_intent.status,
            transactionId: payment_intent.id,
            transactionRemark: payment_intent
         })
      }

      await client.request(DATAHUB_INSERT_STRIPE_PAYMENT_HISTORY, {
         objects: datahub_history_objects
      })

      return
   } catch (error) {
      console.error(error)
      throw error
   }
}

const handlePaymentIntent = async args => {
   try {
      const { cartPaymentId, intent } = args

      await client.request(UPDATE_CART_PAYMENT, {
         id: cartPaymentId,
         _set: {
            transactionId: intent.id,
            transactionRemark: intent,
            paymentStatus: STATUS[intent.status]
         }
      })

      const datahub_history_objects = [
         {
            cartPaymentId,
            status: intent.status,
            type: 'PAYMENT_INTENT',
            transactionId: intent.id,
            transactionRemark: intent
         }
      ]

      await client.request(DATAHUB_INSERT_STRIPE_PAYMENT_HISTORY, {
         objects: datahub_history_objects
      })
      return
   } catch (error) {
      console.error(error)
      throw error
   }
}

export const stripeWebhookEvents = async (req, res) => {
   //    console.log('HERE,StripeWebhookEvents', req.body)
   try {
      const _stripe = await stripe()
      const signature = req.headers['stripe-signature']
      let event
      console.log({ signature })
      let SECRET = await get_env('WEBHOOK_STRIPE_SECRET')
      console.log({ SECRET })
      const body = JSON.parse(req.rawBody)
      console.log({ body })
      if ('account' in body && body.account) {
         SECRET = await get_env('WEBHOOK_STRIPE_CONNECT_SECRET')
      }
      console.log({ SECRET })

      try {
         //  console.log(_stripe, signature, SECRET)
         event = await _stripe.webhooks.constructEvent(
            req.rawBody,
            signature,
            SECRET
         )
         console.log({ event })
      } catch (err) {
         console.log(err)
         return res.status(400).send({
            success: false,
            error: `Webhook Error: ${err.message}`
         })
      }

      const node = event.data.object
      console.log({ node })

      if (!['invoice', 'payment_intent'].includes(node.object))
         return res.status(200).send({
            success: false,
            error: `No such event has been mapped yet!`
         })

      const { cartPayment } = await client.request(CART_PAYMENT, {
         id: Number(node.metadata.cartPaymentId)
      })

      console.log({ cartPayment })

      if (get(cartPayment, 'id') && cartPayment.paymentStatus === 'SUCCEEDED') {
         return res.status(200).json({
            success: true,
            message:
               "Could not process invoice/intent webhook, since cart's payment has already succeeded"
         })
      }

      if (node.object === 'invoice') {
         await handleInvoice({
            eventType: event.type,
            invoice: event.data.object,
            cartPaymentId: node.metadata.cartPaymentId
         })
         return res.status(200).json({ received: true })
      }
      if (node.object === 'payment_intent') {
         await handlePaymentIntent({
            intent: event.data.object,
            cartPaymentId: node.metadata.cartPaymentId
         })
         return res.status(200).json({ received: true })
      }
   } catch (error) {
      return res.status(500).json({ success: false, error })
   }
}
