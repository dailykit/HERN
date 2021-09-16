import { PAYMENT_METHOD, SEND_SMS, CART_PAYMENT, CART } from '../../graphql'
import { logger } from '../../../../utils/logger'
import { client } from '../../../../lib/graphql'
import get_env from '../../../../../get_env'

export const sendSMS = async ({ cartPaymentId, transactionRemark }) => {
   try {
      console.log('Inside SendSMS_STRIPE', { transactionRemark })
      const ORGANIZATION_NAME = await get_env('ORGANIZATION_NAME')

      const { paymentMethod: method = {} } = await client.request(
         PAYMENT_METHOD,
         { paymentMethodId: transactionRemark.payment_method }
      )
      console.log('sendSms stripe paymentMethod info', { method })
      const customer = {
         name: '',
         phoneNo: ''
      }
      if (method.customer) {
         if (method.customer.firstName) {
            customer.name = method.customer.firstName
         }
         if (method.customer.lastName) {
            customer.name += ` ${method.customer.lastName}`
         }
         if (method.customer.phoneNumber) {
            customer.phoneNo = method.customer.phoneNumber
         }
      }

      if (!customer.phoneNo) throw Error('Phone number is required!')

      let action_url = ''
      if (
         transactionRemark &&
         Object.keys(transactionRemark).length > 0 &&
         transactionRemark.next_action
      ) {
         if (transactionRemark.next_action.type === 'use_stripe_sdk') {
            action_url = transactionRemark.next_action.use_stripe_sdk.stripe_js
         } else {
            action_url = transactionRemark.next_action.redirect_to_url.url
         }
      }

      if (!action_url) {
         return { success: true, code: 200, message: 'Action url is missing!' }
      }

      let orderId = null
      if (transactionRemark.id) {
         const { cartPayment } = await client.request(CART_PAYMENT, {
            id: Number(cartPaymentId)
         })
         if (cartPayment) {
            if ('cartId' in cartPayment && cartPayment.cartId) {
               const { cart = {} } = await client.request(CART, {
                  id: Number(cartPayment.cartId)
               })
               if ('orderId' in cart && cart.orderId) {
                  orderId = cart.orderId
               }
            }
         }
      }

      const sms = await client.request(SEND_SMS, {
         phone: `+91${customer.phoneNo}`,
         message: `Dear ${
            customer.name.trim() ? customer.name : 'customer'
         }, your payment requires additional action${
            orderId && ` for ORDER #${orderId}`
         }, please use the following link to complete your payment.
Link: ${action_url}

From,
${ORGANIZATION_NAME}
`
      })

      console.log({ sms })
      if (sms.success) {
         return { success: true, code: 200, message: 'SMS sent successfully' }
      }
      return { success: true, code: 200 }
   } catch (error) {
      return { success: false, code: 500, error }
   }
}
