import { client } from '../lib/graphql'
import get_env from '../../get_env'
import stripe from '../lib/stripe'
import { sendSMS } from '../entities/payment/functions/stripe/sendSms'

const UPDATE_CART_PAYMENT = `
mutation UPDATE_CART_PAYMENT($id: Int!, $_set: order_cartPayment_set_input!) {
   updateCartPayment(pk_columns: {id: $id}, _set: $_set) {
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
   cancelled: 'CANCELLED',
   succeeded: 'SUCCEEDED',
   paid: 'SUCCEEDED',
   processing: 'PROCESSING',
   payment_failed: 'FAILED',
   requires_action: 'REQUIRES_ACTION',
   requires_payment_method: 'REQUIRES_PAYMENT_METHOD',
   TXN_SUCCESS: 'SUCCEEDED',
   TXN_FAILURE: 'FAILED',
   PENDING: 'PENDING',
   PROCESSING: 'PROCESSING',
   FAILED: 'FAILED',
   SWIPE_CARD: 'SWIPE_CARD',
   ENTER_PIN: 'ENTER_PIN',
   declined: 'FAILED',
   rejected: 'FAILED',
   void: 'FAILED',
   card_not_supported: 'FAILED',
   txn_not_allowed: 'FAILED',
   card_expired: 'FAILED',
   no_dial_tone: 'FAILED',
   card_not_accepted: 'FAILED',
   incorrect_refund_card: 'FAILED',
   pin_locked: 'FAILED',
   pin_timeout: 'FAILED',
   service_not_accepted: 'FAILED',
   card_removed_after_pin_entry: 'FAILED',
   card_removed_before_pin_entry: 'FAILED',
   card_removed_after_arqc: 'FAILED',
   card_timeout: 'FAILED',
   invalid_pin: 'FAILED',
   invalid_amount: 'FAILED',
   invalid_card: 'FAILED',
   emv_blocked: 'FAILED',
   transaction_declined_by_card: 'FAILED',
   emv_card_not_detected: 'FAILED'
}
// const handleInvoice = async args => {
//    try {
//       const _stripe = await stripe()
//       const { invoice, eventType = '' } = args
//       console.log('inside paymentLogger of type', eventType)
//       const cartPaymentId = invoice.metadata.cartPaymentId

//       let payment_intent = null
//       if (invoice.payment_intent) {
//          payment_intent = await _stripe.paymentIntents.retrieve(
//             invoice.payment_intent
//          )
//          console.log('retrieved invoice in paymentLogger', {
//             invoice: payment_intent
//          })
//          // SEND ACTION REQUIRED SMS
//          if (eventType === 'invoice.payment_action_required') {
//             console.log('Initiate SEND ACTION URL SMS')
//             sendSMS({ cartPaymentId, transactionRemark: payment_intent })
//          }
//          if (
//             invoice.payment_settings.payment_method_options === null &&
//             eventType === 'invoice.payment_failed'
//          ) {
//             const wasPreviousIntentDeclined =
//                payment_intent &&
//                payment_intent.last_payment_error &&
//                Object.keys(payment_intent.last_payment_error).length > 0 &&
//                payment_intent.last_payment_error.code === 'card_declined' &&
//                ['do_not_honor', 'transaction_not_allowed'].includes(
//                   payment_intent.last_payment_error.decline_code
//                )
//             if (wasPreviousIntentDeclined) {
//                console.log('INCREMENT PAYMENT ATTEMPT DUE CARD DO NOT HONOR')

//                return
//             }
//          }
//       }

//       await client.request(UPDATE_CART_PAYMENT, {
//          id: cartPaymentId,
//          _set: {
//             stripeInvoiceId: invoice.id,
//             stripeInvoiceDetails: invoice,
//             ...(payment_intent && {
//                transactionRemark: payment_intent,
//                transactionId: payment_intent.id,
//                paymentStatus: STATUS[payment_intent.status]
//             })
//          }
//       })

//       let datahub_history_objects = []

//       datahub_history_objects = [
//          {
//             cartPaymentId,
//             type: 'INVOICE',
//             status: invoice.status,
//             stripeInvoiceId: invoice.id,
//             stripeInvoiceDetails: invoice
//          }
//       ]
//       if (payment_intent) {
//          datahub_history_objects.push({
//             cartPaymentId,
//             type: 'PAYMENT_INTENT',
//             status: payment_intent.status,
//             transactionId: payment_intent.id,
//             transactionRemark: payment_intent
//          })
//       }

//       await client.request(DATAHUB_INSERT_STRIPE_PAYMENT_HISTORY, {
//          objects: datahub_history_objects
//       })

//       return
//    } catch (error) {
//       console.error(error)
//       throw error
//    }
// }
// const handleRazorPayResponse = async args => {
//    try {
//       const { response, cartPaymentId } = args
//       await client.request(UPDATE_CART_PAYMENT, {
//          id: cartPaymentId,
//          _set: {
//             paymentStatus: STATUS[response.status],
//             transactionRemark: response
//          }
//       })
//       let datahub_history_objects = []
//       datahub_history_objects.push({
//          cartPaymentId,
//          type: 'RAZORPAY_ORDER',
//          status: STATUS[response.status],
//          transactionId: response.id,
//          transactionRemark: response
//       })

//       await client.request(DATAHUB_INSERT_STRIPE_PAYMENT_HISTORY, {
//          objects: datahub_history_objects
//       })
//       return
//    } catch (error) {
//       console.error(error)
//       throw error
//    }
// }

// export const paymentLogger = async args => {
//    try {
//       console.log('inside paymentLogger', args)
//       const { paymentType = '' } = args
//       if (paymentType === 'razorpay') {
//          console.log('razor', args)
//          await handleRazorPayResponse(args)
//       } else {
//          await handleInvoice(args)
//       }
//    } catch (error) {
//       console.error(error)
//    }
// }

export const paymentLogger = async args => {
   try {
      console.log('inside paymentLogger', args)
      const {
         cartPaymentId,
         transactionRemark = null,
         transactionId = null,
         requestId = null,
         paymentStatus = 'PENDING',
         actionUrl = null,
         actionRequired = false,
         stripeInvoiceDetails = null,
         comment = 'Updated by payment logger'
      } = args
      await client.request(UPDATE_CART_PAYMENT, {
         id: cartPaymentId,
         _set: {
            paymentStatus: STATUS[paymentStatus],
            transactionRemark,
            transactionId,
            stripeInvoiceId: requestId,
            stripeInvoiceDetails,
            comment,
            ...(actionUrl && { actionUrl }),
            ...(actionRequired && { actionRequired })
         }
      })
      let datahub_history_objects = []
      datahub_history_objects.push({
         cartPaymentId,
         status: STATUS[paymentStatus],
         transactionRemark,
         transactionId
      })

      await client.request(DATAHUB_INSERT_STRIPE_PAYMENT_HISTORY, {
         objects: datahub_history_objects
      })
      return
   } catch (error) {
      console.error(error)
   }
}
