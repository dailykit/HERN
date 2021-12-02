import { client } from '../../../lib/graphql'
import { logger } from '../../../utils'
import { UPDATE_CART_PAYMENT, AVAILABLE_PAYMENT_OPTION } from '../graphql'

export const initiatePaymentHandler = async (req, res) => {
   // this handler is called on update of paymentRetryAttempt in cartPayment table
   try {
      const payload = req.body.event.data.new

      if (payload.id && payload.paymentStatus === 'SUCCEEDED') {
         // check for if payment is already succeeded
         return res.status(200).json({
            success: true,
            message:
               'Payment attempt cancelled since cart has already been paid!'
         })
      }

      if (payload.isTest || payload.amount === 0) {
         // check to bypass the payment if payment is made on test mode or amount is 0
         await client.request(UPDATE_CART_PAYMENT, {
            id: payload.id,
            _set: {
               paymentStatus: 'SUCCEEDED',
               isTest: true,
               transactionId: 'NA',
               transactionRemark: {
                  id: 'NA',
                  amount: payload.amount,
                  message: 'payment bypassed',
                  reason: payload.isTest ? 'test mode' : 'amount 0 - free'
               }
            }
         })
         return res.status(200).json({
            success: true,
            message: 'Payment succeeded!'
         })
      }
      if (payload.amount > 0) {
         // only if amount is greater than 0 and not on test mode then only
         // further payment process will be done
         console.log('1', payload)
         const { availablePaymentOption = {} } = await client.request(
            AVAILABLE_PAYMENT_OPTION,
            {
               id: payload.usedAvailablePaymentOptionId
            }
         )
         console.log('2', availablePaymentOption)

         const company =
            availablePaymentOption.supportedPaymentOption
               .supportedPaymentCompany.label

         console.log('3', company)
         const functionFilePath = `../functions/${company}`
         console.log(functionFilePath)
         const method = await import(functionFilePath)
         console.log(method)
         const data = {
            ...payload,
            oldAmount: req.body.event.data.old
               ? req.body.event.data.old.amount
               : 0
         }
         console.log('about to run default function')
         const result = await method.default(data, 'initialize')
         if (result.success) {
            res.status(200).json(result)
         } else {
            res.status(500).json(result)
         }
      }
   } catch (error) {
      console.error(error)
      logger('/api/payment/initiate-payment', error)
      return res.status(500).json({ success: false, error })
   }
}
