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
export const SALES_BY_COUPONS = gql`
   subscription SALES_BY_COUPONS($args: insights_getEarningByCoupons_args!) {
      insights_analytics {
         getEarningByCoupons(args: $args)
      }
   }
`
