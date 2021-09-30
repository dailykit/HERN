import gql from 'graphql-tag'

export const MUTATIONS = {
   CART: {
      ITEM: {
         DELETE: gql`
            mutation deleteCartItem($id: Int!) {
               deleteCartItem(id: $id) {
                  id
               }
            }
         `,
         INSERT: gql`
            mutation createCartItem($object: order_cartItem_insert_input!) {
               createCartItem(object: $object) {
                  id
               }
            }
         `,
         INSERT_MANY: gql`
            mutation createCartItems(
               $objects: [order_cartItem_insert_input!]!
            ) {
               createCartItems(objects: $objects) {
                  returning {
                     id
                  }
               }
            }
         `,
      },
      UPDATE: gql`
         mutation updateCart(
            $id: Int!
            $_set: order_cart_set_input = {}
            $_inc: order_cart_inc_input = {}
         ) {
            updateCart(pk_columns: { id: $id }, _set: $_set, _inc: $_inc) {
               id
            }
         }
      `,
      REWARDS: {
         CREATE: gql`
            mutation CartRewards(
               $objects: [order_cart_rewards_insert_input!]!
            ) {
               createCartRewards(objects: $objects) {
                  returning {
                     id
                  }
               }
            }
         `,
         DELETE: gql`
            mutation DeleteCartRewards($cartId: Int!) {
               deleteCartRewards(where: { cartId: { _eq: $cartId } }) {
                  returning {
                     id
                  }
               }
            }
         `,
      },
   },
   BRAND: {
      CUSTOMER: {
         UPDATE: gql`
            mutation updateBrandCustomers(
               $where: crm_brand_customer_bool_exp!
               $_set: crm_brand_customer_set_input!
            ) {
               updateBrandCustomers(where: $where, _set: $_set) {
                  affected_rows
               }
            }
         `,
      },
   },
   STRIPE: {
      PAYMENT_METHOD: {
         CREATE: gql`
            mutation paymentMethod(
               $object: platform_customerPaymentMethod_insert_input!
            ) {
               paymentMethod: insert_platform_customerPaymentMethod_one(
                  object: $object
               ) {
                  keycloakId
                  paymentMethodId
               }
            }
         `,
      },
   },
   PRODUCT: {
      PRICE: {
         UPDATE: gql`
            mutation updateCartItem(
               $id: Int!
               $_set: order_cartItem_set_input!
            ) {
               updateCartItem(pk_columns: { id: $id }, _set: $_set) {
                  id
               }
            }
         `,
      },
   },
}
