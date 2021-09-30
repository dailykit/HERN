import stripe from '../../../../lib/stripe'
import {
   logger,
   isConnectedIntegration,
   paymentLogger
} from '../../../../utils'
import get_env from '../../../../../get_env'

// * isConnectedIntegration is a helper function that checks if the integration is "connected"
// and return a boolean value so that we can add the stripeAccountId to the stripe Invoice conditionally.

const initiatePayment = async arg => {
   try {
      const {
         id: transferGroup,
         statementDescriptor,
         stripeInvoiceId,
         paymentMethodId: paymentMethod,
         paymentCustomerId,
         requires3dSecure,
         amount,
         oldAmount
      } = arg
      const organizationId = await get_env('ORGANIZATION_ID')
      const stripeAccountId = await get_env('STRIPE_ACCOUNT_ID')
      const stripeAccountType = await get_env('STRIPE_ACCOUNT_TYPE')
      const organizationName = await get_env('ORGANIZATION_NAME')

      if (stripeAccountId) {
         const chargeAmount = (amount * 100).toFixed(0)
         const CURRENCY = await get_env('CURRENCY')
         const _stripe = await stripe()

         if (stripeAccountType === 'standard') {
            // RE ATTEMPT
            // if the invoice is already created, and its been rejected for some reason, and the amount is same
            // and if the user again hit the pay button
            // we try to use the previous invoice and
            // attempt that one for payment instead of creating a new one
            let previousInvoice = null
            if (stripeInvoiceId) {
               previousInvoice = await _stripe.invoices.retrieve(
                  // stripeParams(stripeInvoiceId)
                  stripeInvoiceId
                  // (await isConnectedIntegration())
                  //    ? {
                  //         stripeAccount: stripeAccountId
                  //      }
                  //    : null
               )
               console.log({ previousInvoice })
               const isValidForReattempt = [
                  previousInvoice,
                  previousInvoice && previousInvoice.status !== 'void',
                  amount === oldAmount
               ].every(node => node)

               // if previous invoice is valid for reattempt,
               // and it doesn't require3dSecure (byDefault its set to false) then we use that one
               if (!requires3dSecure && isValidForReattempt) {
                  const invoice = await _stripe.invoices.pay(
                     stripeInvoiceId,
                     { payment_method: paymentMethod }
                     // (await isConnectedIntegration())
                     //    ? {
                     //         stripeAccount: stripeAccountId
                     //      }
                     //    : null
                  )
                  console.log('invoice', invoice.id)

                  // handleInvoice just updates the cartPayment and stripePaymentHistory table
                  await paymentLogger({ invoice })

                  // this is for express type stripe account
                  if (invoice.payment_intent) {
                     const intent = await _stripe.paymentIntents.retrieve(
                        invoice.payment_intent
                        // (await isConnectedIntegration())
                        //    ? {
                        //         stripeAccount: stripeAccountId
                        //      }
                        //    : null
                     )
                     console.log('intent', intent.id)
                     await paymentLogger({
                        invoice
                     })
                  }
                  return {
                     success: true,
                     data: invoice,
                     message: 'Payment has been reattempted'
                  }
               }
            }

            // if we have previous invoid, and its not valid for reattempt
            // or it requires 3d secure, then we make this invoice void and create new one.
            if (previousInvoice && stripeInvoiceId) {
               await _stripe.invoices.voidInvoice(
                  stripeInvoiceId
                  // (await isConnectedIntegration())
                  //    ? {
                  //         stripeAccount: stripeAccountId
                  //      }
                  //    : null
               )
            }

            // Create a new invoice item,
            // object(item) return by this create invoice item is not used anywhere else in the code,
            // but doesn't mean this create invoice item step is useless
            // since the stripe detect automatically the invoice items (draft invoices) at the time of
            // creating a new invoice.
            console.log('invoice item creating')
            const item = await _stripe.invoiceItems.create(
               {
                  amount: chargeAmount,
                  currency: CURRENCY.toLowerCase(),
                  customer: paymentCustomerId,
                  description: 'Weekly Subscription'
               }

               // (await isConnectedIntegration())
               //    ? {
               //         stripeAccount: stripeAccountId
               //      }
               //    : null
            )
            console.log('invoice item created', item.id)

            // create a new invoice (detects the invoice items (draft invoices) and makes a new invoice using these invoice items)
            console.log('invoice creating')
            const invoice = await _stripe.invoices.create(
               {
                  customer: paymentCustomerId,
                  default_payment_method: paymentMethod,
                  statement_descriptor: statementDescriptor || organizationName,
                  // days_until_due: 1,
                  // collection_method: 'send_invoice',
                  ...(requires3dSecure && {
                     payment_settings: {
                        payment_method_options: {
                           card: {
                              request_three_d_secure: 'any'
                           }
                        }
                     }
                  }),
                  metadata: {
                     organizationId,
                     cartPaymentId: transferGroup,
                     // customerPaymentIntentId: id,
                     stripeAccountId
                  }
               }
               // (await isConnectedIntegration())
               //    ? {
               //         stripeAccount: stripeAccountId
               //      }
               //    : null
            )
            console.log('invoice created', invoice.id)

            // handleInvoice just updates the cartPayment and stripePaymentHistory table
            console.log('executing paymentLogger for invoice created')
            await paymentLogger({ invoice })
            console.log('after executing paymentLogger for invoice created')

            // finalize the Invoice drafts before paying
            console.log('finalizing Invoice')
            const finalizedInvoice = await _stripe.invoices.finalizeInvoice(
               invoice.id
               // (await isConnectedIntegration())
               //    ? {
               //         stripeAccount: stripeAccountId
               //      }
               //    : null
            )
            console.log('finalizedInvoice', finalizedInvoice.id)

            // again here handleInvoice just updates the cartPayment and stripePaymentHistory table
            console.log('executing paymentLogger for invoice finalized')
            await paymentLogger({ invoice: finalizedInvoice })
            console.log('executing paymentLogger for after invoice finalized')

            // here we pay for the invoice that is been finalized
            console.log('paying invoice')
            const result = await _stripe.invoices.pay(
               finalizedInvoice.id
               // (await isConnectedIntegration())
               //    ? {
               //         stripeAccount: stripeAccountId
               //      }
               //    : null
            )
            console.log('paid invoice', result.id)

            // again here handleInvoice just updates the cartPayment and stripePaymentHistory table
            console.log('executing paymentLogger for  invoice pay')
            await paymentLogger({ invoice: result })
            console.log('executing paymentLogger for after invoice pay')

            return {
               data: result,
               success: true,
               message: 'New invoice payment has been made'
            }
         }
      }
   } catch (error) {
      console.log('error from stripe initiatePayment', error)
      logger('/api/payment-intent', error)
      return {
         success: false,
         error: error.message
      }
   }
}

export default initiatePayment
