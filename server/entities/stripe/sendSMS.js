import get from 'lodash/get'

import { logger } from '../../utils'
import { client } from '../../lib/graphql'
import get_env from '../../../get_env'

export const sendSMS = async (req, res) => {
   try {
      const { paymentMethod = '', transactionRemark = {} } =
         req.body.event.data.new

      const { paymentMethod: method = {} } = await client.request(
         PAYMENT_METHOD,
         { customerPaymentMethodId: paymentMethod }
      )

      const customer = {
         name: '',
         phoneNo: ''
      }
      if (method.customer) {
         if (method.customer.firstName) {
            customer.name = method.customer.firstName
         }
         if (method.customer.lastName) {
            customer.name += ' ' + method.customer.lastName
         }
         if (method.customer.phoneNumber) {
            customer.phoneNo = method.customer.phoneNumber
         }
      }

      if (!customer.phoneNo) throw Error('Phone number is required!')

      const organization = {
         name: ''
      }

      const ORGANIZATION_ID = await get_env('ORGANIZATION_ID')

      if (ORGANIZATION_ID) {
         const { organization: orgs = [] } = await client.request(ORGANIZATIONS)
         if (get(orgs, '[0].name')) {
            organization.name = get(orgs, '[0].name')
         }
      }

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
         return res
            .status(200)
            .json({ success: true, message: 'Action url is missing!' })
      }

      let orderId = null
      if (transactionRemark.id) {
         const { customerPaymentIntents = [] } = await client.request(
            CUSTOMER_PAYMENT_INTENTS,
            {
               where: {
                  stripePaymentHistories: {
                     stripePaymentIntentId: {
                        _eq: transactionRemark.id
                     }
                  }
               }
            }
         )
         if (customerPaymentIntents.length > 0) {
            const [intent] = customerPaymentIntents
            if ('cartId' in intent && intent.cartId) {
               const { cart = {} } = await client.request(CART, {
                  id: intent.cartId
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
${organization.name}
`
      })
      if (sms.success) {
         return res
            .status(200)
            .json({ success: true, message: 'SMS sent successfully' })
      }
      return res.status(200).json({ success: true })
   } catch (error) {
      logger('/api/webhooks/stripe/send-sms', error)
      return res.status(500).json({ success: false, error })
   }
}

const SEND_SMS = `
   mutation sendSMS($message: String!, $phone: String!) {
      sendSMS(message: $message, phone: $phone) {
         success
         message
      }
   }
`

const PAYMENT_METHOD = `
   query paymentMethod($customerPaymentMethodId: String!) {
      paymentMethod: platform_customerPaymentMethod_by_pk(
         customerPaymentMethodId: $customerPaymentMethodId
      ) {
         customerPaymentMethodId
         customer: customer {
            phoneNumber
            firstName
            lastName
         }
      }
   }
`

const CUSTOMER_PAYMENT_INTENTS = `
   query customerPaymentIntents(
      $where: stripe_customerPaymentIntent__bool_exp = {}
   ) {
      customerPaymentIntents: customerPaymentIntents_(where: $where) {
         id
         cartId: transferGroup
      }
   }
`

const CART = `
   query cart($id: Int!) {
      cart(id: $id) {
         id
         source
         orderId
      }
   }
`
