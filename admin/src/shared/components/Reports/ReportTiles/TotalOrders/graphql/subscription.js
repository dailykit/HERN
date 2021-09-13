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
            platform_customer {
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
export const TOTAL_ORDER_RECEIVED = gql`
   subscription TOTAL_ORDER_RECEIVED($args: insights_getOrdersRecieved_args!) {
      insights_analytics {
         getOrdersRecieved(args: $args)
      }
   }
`
export const ORDER_BY_LOCATION = gql`
   subscription ORDER_BY_LOCATION($where: order_order_bool_exp!) {
      orders(where: $where) {
         cart {
            address
            customerInfo
         }
         created_at
         id
         amountPaid
      }
   }
`
