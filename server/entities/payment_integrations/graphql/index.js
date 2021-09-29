export const PAYMENT_PARTNERSHIP = `
   query partnership($id: Int!) {
      partnership: paymentHub_paymentPartnership__by_pk(id: $id) {
         id
         isActive
         pricing
         currency
         publishableConfig
         secretConfig
         isPayoutRequired
         company: paymentCompany_ {
            id
            name
            identifier
         }
      }
   }
`

export const INSERT_PAYMENT_RECORD = `
   mutation insertPaymentRecord($object: paymentHub_payment__insert_input!) {
      insertPaymentRecord: insert_paymentHub_payment__one(object: $object) {
         id
      }
   }
`

export const UPDATE_PAYMENT_RECORD = `
   mutation updatePaymentTransaction(
      $pk_columns: paymentHub_payment__pk_columns_input!
      $_set: paymentHub_payment__set_input!
   ) {
      updatePaymentTransaction: update_paymentHub_payment__by_pk(
         pk_columns: $pk_columns
         _set: $_set
      ) {
         id
      }
   }
`

export const UPDATE_CART = `
   mutation updateCart($id: Int!, $_set: order_cart_set_input!) {
      updateCart(pk_columns: { id: $id }, _set: $_set) {
         id
      }
   }
`

export const PAYMENT = `
   query payment($id: uuid!) {
      payment: paymentHub_payment__by_pk(id: $id) {
         id
         orderCartId
         partnership: paymentPartnership_ {
            company: paymentCompany_ {
               identifier
            }
         }
      }
   }
`
