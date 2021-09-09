import { client } from '../lib/graphql'

const UPDATE_CART_PAYMENT = `
mutation UPDATE_CART_PAYMENT($id: Int!, $_inc: order_cartPayment_inc_input, $_set: order_cartPayment_set_input) {
   updateCartPayment(pk_columns: {id: $id}, _inc: $_inc, _set: $_set) {
     cartId
     id
     paymentStatus
     paymentRetryAttempt
   }
 }
`
const DATAHUB_INSERT_STRIPE_PAYMENT_HISTORY = `
mutation insertStripePaymentHistory(
   $objects: [order_stripePaymentHistory_insert_input!]!
) {
   insertStripePaymentHistory: insert_order_stripePaymentHistory(
      objects: $objects
   ) {
      affected_rows
   }
}
`

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

export const paymentLogger = async args => {
   try {
      if (args.event === 'invoice') {
         await handleInvoice(args)
      }
      if (args.event === 'payment_intent') {
         await handlePaymentIntent(args)
      }
   } catch (error) {
      console.error(error)
   }
}
