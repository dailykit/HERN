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
mutation UPDATE_CART_PAYMENT($id: Int!, $_inc: order_cartPayment_inc_input, $_set: order_cartPayment_set_input) {
   updateCartPayment(pk_columns: {id: $id}, _inc: $_inc, _set: $_set) {
     cartId
     id
     paymentStatus
     paymentRetryAttempt
   }
 }
`
