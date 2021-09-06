import gql from 'graphql-tag'

export const ORDERS_COUNT = gql`
   subscription ORDERS_COUNT($where: order_order_bool_exp!) {
      ordersAggregate(where: $where) {
         aggregate {
            count
         }
      }
   }
`
export const ORDER_SUMMARY = gql`
   subscription ORDER_SUMMARY($where: order_order_bool_exp!) {
      orders(where: $where) {
         id
         fulfillmentTimestamp
         customer {
            platform_customer_ {
               fullName
            }
         }
         created_at
         cart {
            status
         }
         amountPaid
      }
   }
`
