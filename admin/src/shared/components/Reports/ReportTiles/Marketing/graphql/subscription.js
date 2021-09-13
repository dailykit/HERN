import gql from 'graphql-tag'

export const MARKETING_EARNING = gql`
   subscription MARKETING_EARNING($where: order_order_bool_exp!) {
      ordersAggregate(where: $where) {
         aggregate {
            sum {
               amountPaid
            }
         }
      }
   }
`
