import gql from 'graphql-tag'

export const GET_TOTAL_EARNING_ORDER_CUSTOMER_TOP_PRODUCT = gql`
   query TotalEarningAndTotalOrder($brandId: [Int!]!, $locationId: [Int!]!) {
      ordersAggregate(
         where: {
            cart: { paymentStatus: { _eq: "SUCCEEDED" } }
            brandId: { _in: $brandId }
            locationId: { _in: $locationId }
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
