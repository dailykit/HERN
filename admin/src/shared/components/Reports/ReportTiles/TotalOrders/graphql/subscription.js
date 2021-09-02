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
