import axios from 'axios'
import get from 'lodash/get'
import { GraphQLClient } from 'graphql-request'
import { client } from '../lib/graphql'

import stripe from '../lib/stripe'

const dailycloak = new GraphQLClient(process.env.DAILYCLOAK_URL, {
   headers: { 'x-hasura-admin-secret': process.env.DAILYCLOAK_ADMIN_SECRET }
})

export const discardPreviousPaymentMethod = async args => {
   try {
      // let cart
      const {
         cartPaymentId,
         origin = '',
         organization = {},
         cartType = 'cart'
      } = args
      // const datahub = new GraphQLClient(organization.datahubUrl, {
      //    headers: { 'x-hasura-admin-secret': organization.adminSecret }
      // })

      console.log('args', args)
      console.log('cartype', cartType)
      // if (cartType === 'cartPayment') {
      console.log('if')
      const { cartPayment } = await client.request(CART_PAYMENT, {
         id: cartPaymentId
      })
      // cart = cartPayment
      console.log('cart', cartPayment)
      // } else {
      //    const { cart: cartData } = await datahub.request(CART, { id: cartId })
      //    cart = cartData
      // }

      let type = ''
      // console.log('cart', cart)
      if (cartPayment.paymentId) {
         type = 'razorpay'
      } else if (
         origin !== 'stripe' &&
         (cartPayment.stripeInvoiceId || cartPayment.paymentRetryAttempt > 0)
      ) {
         type = 'stripe'
      }

      if (type === 'razorpay') {
         await handleRazorpay({ ...args, datahub })
      } else if (type === 'stripe') {
         await handleStripe({ ...args, datahub })
      }
      return
   } catch (error) {
      console.log(error)
      throw error
   }
}

const handleRazorpay = async args => {
   try {
      const { cartPaymentId, organization = {}, datahub, cartType } = args

      // if (cartType === 'cartPayment') {
      await client.request(UPDATE_CART_PAYMENT, {
         id: cartPaymentId,
         _set: {
            paymentId: null,
            transactionId: null,
            paymentRequestInfo: null,
            paymentUpdatedAt: null,
            transactionRemark: null
         }
      })
      // } else {
      //    await datahub.request(UPDATE_CART, {
      //       id: cartId,
      //       _set: {
      //          paymentId: null,
      //          transactionId: null,
      //          paymentRequestInfo: null,
      //          paymentUpdatedAt: null,
      //          transactionRemark: null
      //       }
      //    })
      // }

      const { payments = [] } = await dailycloak.request(
         RAZORPAY_TRANSACTIONS,
         {
            where: {
               orderCartId: { _eq: cartPaymentId },
               paymentPartnership: { organizationId: { _eq: organization.id } }
            }
         }
      )

      if (payments.length === 0) return

      const result = await Promise.all(
         payments.map(async payment => {
            try {
               const { paymentRequestId } = payment
               if (!paymentRequestId)
                  return {
                     success: true,
                     message: 'Aborting, since no payment request id linked!'
                  }

               if (paymentRequestId.startsWith('order'))
                  return {
                     success: true,
                     message: 'Razorpay orders are not cancellable!'
                  }

               if (paymentRequestId.startsWith('plink')) {
                  let clientId = get(payment, 'partnership.clientId')
                  let secretId = get(payment, 'partnership.secretId')

                  if (clientId && secretId) {
                     const url = `https://api.razorpay.com/v1/payment_links/${paymentRequestId}/cancel`
                     const auth = { username: clientId, password: secretId }
                     const headers = { 'Content-type': 'application/json' }
                     const options = { method: 'POST', url, headers, auth }
                     const { status } = await axios(options)

                     if (status === 200) {
                        await dailycloak.request(UPDATE_RAZORPAY_PAYMENT, {
                           id: payment.id,
                           _set: {
                              isAutoCancelled: true,
                              paymentStatus: 'CANCELLED'
                           }
                        })

                        return {
                           success: true,
                           message: 'Successfully cancelled payment link.'
                        }
                     } else {
                        return {
                           success: false,
                           message: 'Failed to cancel payment link.'
                        }
                     }
                  }
               }
               return { success: true }
            } catch (error) {
               const request = {
                  error: get(error, 'response.data.error'),
                  status: get(error, 'response.status')
               }
               if (request.status === 400) {
                  return {
                     success: false,
                     message: 'Payment link is already cancelled'
                  }
               }
               return { success: false, error }
            }
         })
      )

      return result
   } catch (error) {
      console.log(error)
      throw error
   }
}

const handleStripe = async args => {
   try {
      const { cartPaymentId, organization = {}, datahub, cartType } = args
      // if (cartType === 'cartPayment') {
      await datahub.request(UPDATE_CART_PAYMENT, {
         id: cartPaymentId,
         _set: {
            paymentId: null,
            transactionId: null,
            paymentRequestInfo: null,
            paymentUpdatedAt: null,
            transactionRemark: null
         }
      })
      // } else {
      //    await datahub.request(UPDATE_CART, {
      //       id: cartId,
      //       _set: {
      //          paymentId: null,
      //          transactionId: null,
      //          paymentRequestInfo: null,
      //          paymentUpdatedAt: null,
      //          transactionRemark: null
      //       }
      //    })
      // }
      const { payments = [] } = await dailycloak.request(STRIPE_TRANSACTIONS, {
         where: {
            transferGroup: { _eq: '' + cartPaymentId },
            organizationId: { _eq: organization.id }
         }
      })

      if (payments.length === 0) return

      const { organization: org } = await dailycloak.request(ORGANIZATION, {
         id: organization.id
      })

      const { stripeAccountId, stripeAccountType } = org

      const result = await Promise.all(
         payments.map(async payment => {
            try {
               const { id, stripeInvoiceId, stripePaymentIntentId } = payment
               if (stripeInvoiceId) {
                  const { status = '' } = await stripe.invoices.voidInvoice(
                     stripeInvoiceId,
                     {
                        ...(stripeAccountType === 'standard' &&
                           stripeAccountId && {
                              stripeAccount: stripeAccountId
                           })
                     }
                  )
                  if (status === 'void') {
                     const { updatePayment } = await dailycloak.request(
                        UPDATE_STRIPE_PAYMENT,
                        {
                           id: id,
                           _set: {
                              isAutoCancelled: true,
                              status: 'CANCELLED'
                           }
                        }
                     )
                     return {
                        success: true,
                        data: updatePayment,
                        message: 'Stripe invoice has been voided!'
                     }
                  } else {
                     return {
                        success: false,
                        message: 'Failed to void stripe invoice!'
                     }
                  }
               } else if (stripePaymentIntentId && !stripeInvoiceId) {
                  const { status } = await stripe.paymentIntents.cancel(
                     stripePaymentIntentId,
                     {
                        ...(stripeAccountType === 'standard' &&
                           stripeAccountId && {
                              stripeAccount: stripeAccountId
                           })
                     }
                  )
                  if (status === 'cancelled') {
                     const { updatePayment } = await dailycloak.request(
                        UPDATE_STRIPE_PAYMENT,
                        {
                           id: id,
                           _set: {
                              isAutoCancelled: true,
                              paymentStatus: 'CANCELLED'
                           }
                        }
                     )
                     return {
                        success: true,
                        data: updatePayment,
                        message: 'Stripe payment intent has been voided!'
                     }
                  } else {
                     return {
                        success: false,
                        message: 'Failed to cancel stripe payment intent!'
                     }
                  }
               }
            } catch (error) {
               return { success: false, error }
            }
         })
      )
      return result
   } catch (error) {
      throw error
   }
}

const RAZORPAY_TRANSACTIONS = `
   query payments($where: paymentHub_payment_bool_exp = {}) {
      payments: paymentHub_payment(where: $where) {
         id
         paymentRequestId
         partnership: paymentPartnership {
            id
            secretId: secretConfig(path: "id")
            clientId: publishableConfig(path: "id")
            company: paymentCompany {
               type
               identifier
            }
         }
      }
   }
`

const STRIPE_TRANSACTIONS = `
   query payments($where: stripe_customerPaymentIntent_bool_exp = {}) {
      payments: customerPaymentIntents(where: $where) {
         id
         stripeInvoiceId
         stripePaymentIntentId
      }
   }
`

const UPDATE_RAZORPAY_PAYMENT = `
   mutation updatePayment(
      $id: uuid!
      $_set: paymentHub_payment_set_input = {}
   ) {
      updatePayment: update_paymentHub_payment_by_pk(
         pk_columns: { id: $id }
         _set: $_set
      ) {
         id
      }
   }
`

const CART = `
   query cart($id: Int!) {
      cart(id: $id) {
         id
         paymentId
         paymentStatus
         stripeInvoiceId
         paymentRetryAttempt
      }
   }
`

const ORGANIZATION = `
   query organization($id: Int!) {
      organization(id: $id) {
         id
         stripeAccountId
         stripeAccountType
      }
   }
`

const UPDATE_STRIPE_PAYMENT = `
   mutation updatePayment(
      $id: uuid!
      $_set: stripe_customerPaymentIntent_set_input = {}
   ) {
      updatePayment: updateCustomerPaymentIntent(
         pk_columns: { id: $id }
         _set: $_set
      ) {
         id
      }
   }
`

const UPDATE_CART = `
   mutation updateCart($id: Int!, $_set: order_cart_set_input!) {
      updateCart(pk_columns: { id: $id }, _set: $_set) {
         id
      }
   }
`
const CART_PAYMENT = `
   query CART_PAYMENT($id: Int!) {
      cartPayment(id: $id) {
      id
      cartId
      paymentStatus
      paymentId
      stripeInvoiceId
      paymentRetryAttempt
    }
   }

`
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
