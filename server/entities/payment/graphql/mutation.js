export const UPDATE_CART = `
   mutation updateCart($id: Int!, $set: order_cart_set_input) {
      updateCart(pk_columns: { id: $id }, _set: $set) {
         id
      }
   }
`

export const CREATE_CART_PAYMENT = `
mutation CREATE_CART_PAYMENT($object: order_cartPayment_insert_input!) {
   createCartPayment(object: $object) {
     id
     cartId
     paymentStatus
   }
 }

`
export const UPDATE_CART_PAYMENT = `
mutation UPDATE_CART_PAYMENT($id: Int!, $_inc: order_cartPayment_inc_input={}, $_set: order_cartPayment_set_input={}) {
   updateCartPayment(pk_columns: {id: $id}, _inc: $_inc, _set: $_set) {
     cartId
     id
     paymentStatus
     paymentRetryAttempt
   }
 }
`
export const DATAHUB_INSERT_STRIPE_PAYMENT_HISTORY = `
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
export const SEND_SMS = `
   mutation sendSMS($message: String!, $phone: String!) {
      sendSMS(message: $message, phone: $phone) {
         success
         message
      }
   }
`
