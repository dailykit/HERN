import Razorpay from 'razorpay'

import { client } from '../../../lib/graphql'
import { UPDATE_PAYMENT_RECORD } from '../graphql'

export const request = async ({ data = {}, keys = {} }) => {
   try {
      const { id, amount = null, receipt = '', currency = '' } = data

      if (!amount) throw Error('Amount is required!')
      if (!currency) throw Error('Currency is required!')
      if (Object.keys(keys).length === 0) throw Error('Keys are missing!')

      const options = {
         receipt,
         currency,
         payment_capture: 0,
         amount: amount * 100
      }

      if (!keys.publishable.id) throw Error('Missing razorpay key id!')
      if (!keys.secret.id) throw Error('Missing razorpay key secret!')

      const rzp = new Razorpay({
         key_id: keys.publishable.id,
         key_secret: keys.secret.id
      })

      const order = await rzp.orders.create(options)

      await client.request(UPDATE_PAYMENT_RECORD, {
         pk_columns: { id },
         _set: {
            paymentRequestId: order.id,
            paymentStatus: 'PROCESSING'
         }
      })

      return order
   } catch (error) {
      const { id } = data
      await client.request(UPDATE_PAYMENT_RECORD, {
         pk_columns: { id },
         _set: { paymentStatus: 'DISCARDED' }
      })
      throw error
   }
}

export const transaction = async ({ data, payment }) => {
   try {
      const { success = true } = data

      const { updatePaymentTransaction } = await client.request(
         UPDATE_PAYMENT_RECORD,
         {
            pk_columns: { id: payment.id },
            _set: {
               paymentStatus: success ? 'SUCCEEDED' : 'FAILED',
               paymentTransactionInfo: data,
               ...(success && {
                  paymentTransactionId: data.razorpay_payment_id
               })
            }
         }
      )
      return updatePaymentTransaction
   } catch (error) {
      await client.request(UPDATE_PAYMENT_RECORD, {
         pk_columns: { id: payment.id },
         _set: { paymentStatus: 'DISCARDED' }
      })
      throw error
   }
}
