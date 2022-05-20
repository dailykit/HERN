import gql from 'graphql-tag'

export const EARNING_BY_PRODUCT = gql`
   subscription EARNING_BY_PRODUCT(
      $earningByProductArgs: getEarningsByProducts_insights_analytics_args!
   ) {
      insights_analytics {
         getEarningsByProducts(args: $earningByProductArgs)
      }
   }
`
export const EARNING_BY_CUSTOMERS = gql`
   subscription TOP_CUSTOMERS(
      $earningByCustomerArg: getTopCustomers_insights_analytics_args!
   ) {
      insights_analytics {
         getTopCustomers(args: $earningByCustomerArg)
         id
      }
   }
`
export const TOTAL_EARNING = gql`
   subscription TOTAL_EARNING($where: order_order_bool_exp!) {
      ordersAggregate(where: $where) {
         aggregate {
            sum {
               amountPaid
            }
         }
      }
   }
`
export const GET_STORE_LOCATION_INSIGHTS = gql`
   subscription GET_STORE_LOCATION_INSIGHT($params: jsonb!) {
      insights_analytics {
         getLocationInsights(args: { params: $params })
      }
   }
`
