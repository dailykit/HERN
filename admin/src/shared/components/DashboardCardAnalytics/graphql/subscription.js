import gql from 'graphql-tag'

export const GET_TOTAL_EARNING_ORDER_CUSTOMER_TOP_PRODUCT = gql`
   query TotalEarningAndTotalOrder {
      ordersAggregate(
         where: { cart: { paymentStatus: { _eq: "SUCCEEDED" } } }
      ) {
         aggregate {
            sum {
               amountPaid
            }
            count
         }
      }
      customers_aggregate {
         aggregate {
            count
         }
      }
   }
`
