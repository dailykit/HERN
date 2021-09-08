import stripe from '../../../../lib/stripe'
import { client } from '../../../../lib/graphql'
import { isConnectedIntegration } from '../../../../utils'
import {
   UPDATE_CART_PAYMENT,
   DATAHUB_INSERT_STRIPE_PAYMENT_HISTORY
} from '../../graphql'

const STATUS = {
   requires_payment_method: 'REQUIRES_PAYMENT_METHOD',
   requires_action: 'REQUIRES_ACTION',
   processing: 'PROCESSING',
   canceled: 'CANCELLED',
   succeeded: 'SUCCEEDED'
}

const handlePaymentIntent = async ({ intent, stripeAccountId }) => {
   try {
      const _stripe = await stripe()
      const invoice = await _stripe.invoices.retrieve(
         intent.invoice
         // (await isConnectedIntegration())
         //    ? {
         //         stripeAccount: stripeAccountId
         //      }
         //    : null
      )

      await client.request(UPDATE_CART_PAYMENT, {
         id: +invoice.metadata.cartPaymentId,
         _set: {
            stripeInvoiceId: invoice.id,
            stripeInvoiceDetails: invoice,
            transactionId: intent.id,
            transactionRemark: intent,
            paymentStatus: STATUS[intent.status]
         }
      })
      const datahub_history_objects = [
         {
            cartPaymentId: +invoice.metadata.cartPaymentId,
            stripeInvoiceDetails: invoice,
            stripeInvoiceId: invoice.id,
            type: 'INVOICE',
            status: invoice.status
         }
      ]
      if (intent) {
         datahub_history_objects.push({
            status: intent.status,
            type: 'PAYMENT_INTENT',
            transactionId: intent.id,
            transactionRemark: intent,
            cartPaymentId: +invoice.metadata.cartPaymentId
         })
      }
      await client.request(DATAHUB_INSERT_STRIPE_PAYMENT_HISTORY, {
         objects: datahub_history_objects
      })
   } catch (error) {
      console.log(error)
      throw error
   }
}

export default handlePaymentIntent
