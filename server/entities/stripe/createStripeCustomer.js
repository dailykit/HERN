import stripe from '../../lib/stripe'
import { client } from '../../lib/graphql'

export const createStripeCustomer = async (req, res) => {
   try {
      const { keycloakId } = req.body.event.data.new

      const _stripe = await stripe()
      const { customer = {} } = await client.request(CUSTOMER, { keycloakId })

      const name = `${customer.firstName || ''} ${
         customer.lastName || ''
      }`.trim()

      const response = await _stripe.customers.create({
         name,
         email: customer.email
      })

      await client.request(UPDATE_PLATFORM_CUSTOMER, {
         keycloakId,
         _set: { paymentCustomerId: response.id }
      })

      return res.status(200).json({
         success: true,
         data: response,
         message: 'Successfully created the stripe customer'
      })
   } catch (error) {
      return res.status(500).json({ success: false, error })
   }
}

const CUSTOMER = `
   query customer($keycloakId: String!) {
      customer: platform_customer_by_pk(keycloakId: $keycloakId) {
         email
         firstName
         lastName
      }
   }
`

const UPDATE_PLATFORM_CUSTOMER = `
   mutation update_platform_customer(
      $keycloakId: String!
      $_set: platform_customer_set_input = {}
   ) {
      update_platform_customer: update_platform_customer_by_pk(
         pk_columns: { keycloakId: $keycloakId }
         _set: $_set
      ) {
         id: keycloakId
      }
   }
`
