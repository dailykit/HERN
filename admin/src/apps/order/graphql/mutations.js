import gql from 'graphql-tag'

export const MUTATIONS = {
   CART: {
      UPDATE: {
         ONE: gql`
            mutation updateCart(
               $pk_columns: order_cart_pk_columns_input!
               $_set: order_cart_set_input!
            ) {
               updateCart(pk_columns: $pk_columns, _set: $_set) {
                  id
               }
            }
         `,
      },
   },
   ORDER: {
      UPDATE: gql`
         mutation updateOrder($id: oid!, $_set: order_order_set_input) {
            updateOrder(pk_columns: { id: $id }, _set: $_set) {
               id
            }
         }
      `,
   },
   CART_ITEM: {
      UPDATE: gql`
         mutation updateCartItem($id: Int!, $_set: order_cartItem_set_input!) {
            updateCartItem(pk_columns: { id: $id }, _set: $_set) {
               id
            }
         }
      `,
   },
   SETTING: {
      UPDATE: gql`
         mutation update_settings_appSettings(
            $app: String_comparison_exp!
            $identifier: String_comparison_exp!
            $type: String_comparison_exp!
            $_set: settings_appSettings_set_input!
         ) {
            update_settings_appSettings(
               where: { app: $app, identifier: $identifier, type: $type }
               _set: $_set
            ) {
               affected_rows
               returning {
                  value
               }
            }
         }
      `,
   },
}

export const SEND_STRIPE_INVOICE = gql`
   mutation sendStripeInvoice($id: String!) {
      sendStripeInvoice(id: $id) {
         success
         message
      }
   }
`

export const RETRY_PAYMENT = gql`
   mutation updateCart($id: Int!, $_set: order_cart_set_input!) {
      updateCart(
         _set: $_set
         pk_columns: { id: $id }
         _inc: { paymentRetryAttempt: 1 }
      ) {
         id
      }
   }
`
