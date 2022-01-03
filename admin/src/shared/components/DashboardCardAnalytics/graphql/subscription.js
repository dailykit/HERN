import gql from 'graphql-tag'

export const GET_TOTAL_EARNING_ORDER_CUSTOMER_TOP_PRODUCT = gql`
   query TotalEarningAndTotalOrder {
      ordersAggregate(
         where: {
            isAccepted: { _eq: true }
            cart: { paymentStatus: { _eq: "SUCCEEDED" } }
            isRejected: { _is_null: true }
         }
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
