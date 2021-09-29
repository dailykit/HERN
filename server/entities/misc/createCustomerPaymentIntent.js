// import { logger } from '../../utils'
// import get_env from '../../../get_env'
// import { client } from '../../lib/graphql'

// export const createCustomerPaymentIntent = async (req, res) => {
//    try {
//       const {
//          cart,
//          customer,
//          organizationId,
//          statementDescriptor = ''
//       } = req.body

//       const CURRENCY = await get_env('CURRENCY')

//       const { organizations = [] } = await client.request(ORGANIZATIONS)

//       const [organization] = organizations

//       const { customerPaymentIntents = [] } = await client.request(
//          FETCH_CUSTOMER_PAYMENT_INTENT,
//          { where: { transferGroup: { _eq: `${cart.id}` } } }
//       )

//       if (customerPaymentIntents.length > 0) {
//          const [customerPaymentIntent] = customerPaymentIntents

//          const result = await client.request(RETRY_CUSTOMER_PAYMENT_INTENT, {
//             id: customerPaymentIntent.id,
//             _inc: { paymentRetryAttempt: 1 },
//             _set: { paymentMethod: customer.paymentMethod }
//          })
//          return res.json({
//             success: true,
//             data: result,
//             message: 'Payment request has been reattempted'
//          })
//       } else {
//          if (organization.stripeAccountId) {
//             const chargeAmount = (cart.amount * 100).toFixed(0)
//             const fixedDeduction = organization.chargeFixed * 100
//             const percentDeduction =
//                chargeAmount * (organization.chargePercentage / 100)

//             const transferAmount = (
//                chargeAmount -
//                fixedDeduction -
//                percentDeduction
//             ).toFixed(0)

//             const customerPaymentIntent = await client.request(
//                CREATE_CUSTOMER_PAYMENT_INTENT,
//                {
//                   object: {
//                      organizationId,
//                      statementDescriptor,
//                      amount: chargeAmount,
//                      transferGroup: `${cart.id}`,
//                      paymentMethod: customer.paymentMethod,
//                      onBehalfOf: organization.stripeAccountId,
//                      paymentCustomerId: customer.paymentCustomerId,
//                      currency: CURRENCY.toLowerCase(),
//                      stripeAccountType: organization.stripeAccountType
//                   }
//                }
//             )

//             return res.json({
//                success: true,
//                data: { customerPaymentIntent },
//                message: 'Payment request has been initiated!'
//             })
//          } else {
//             logger(
//                '/server/api/initiate-payment',
//                "Your account doesn't have stripe linked!"
//             )
//             return res.status(403).json({
//                success: false,
//                error: "Your account doesn't have stripe linked!"
//             })
//          }
//       }
//    } catch (error) {
//       logger('/api/initiate-payment', error.message)
//       return res.status(404).json({ success: false, error: error.message })
//    }
// }

// const ORGANIZATIONS = `
//    query organizations {
//       organizations {
//          chargeFixed
//          chargeCurrency
//          stripeAccountId
//          chargePercentage
//          stripeAccountType
//       }
//    }
// `

// const FETCH_CUSTOMER_PAYMENT_INTENT = `
//    query customerPaymentIntents(
//       $where: stripe_customerPaymentIntent__bool_exp = {}
//    ) {
//       customerPaymentIntents: customerPaymentIntents_(where: $where) {
//          id
//       }
//    }
// `

// const CREATE_CUSTOMER_PAYMENT_INTENT = `
//    mutation createCustomerPaymentIntent(
//       $object: stripe_customerPaymentIntent__insert_input!
//    ) {
//       createCustomerPaymentIntent: createCustomerPaymentIntent_(
//          object: $object
//       ) {
//          id
//       }
//    }
// `
// const RETRY_CUSTOMER_PAYMENT_INTENT = `
//    mutation updateCustomerPaymentIntent(
//       $id: uuid!
//       $_set: stripe_customerPaymentIntent__set_input!
//       $_inc: stripe_customerPaymentIntent__inc_input!
//    ) {
//       updateCustomerPaymentIntent: updateCustomerPaymentIntent_(
//          pk_columns: { id: $id }
//          _inc: $_inc
//          _set: $_set
//       ) {
//          id
//          amount
//          amount
//          status
//          currency
//          created_at
//          onBehalfOf
//          transferGroup
//          paymentMethod
//          stripeInvoiceId
//          paymentCustomerId
//          stripeAccountType
//          invoiceSendAttempt
//          paymentRetryAttempt
//          statementDescriptor
//          stripePaymentIntentId
//       }
//    }
// `
