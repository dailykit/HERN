import gql from 'graphql-tag'

export const GET_TOTAL_EARNING_ORDER_CUSTOMER_TOP_PRODUCT = gql`
   query TotalEarningAndTotalOrder($brandId: [Int!]!, $locationId: [Int!]!) {
      ordersAggregate(
         where: {
            cart: {
               paymentStatus: { _eq: "SUCCEEDED" }
               brandId: { _in: $brandId }
               locationId: { _in: $locationId }
            }
            _or: [
               { isRejected: { _eq: false } }
               { isRejected: { _is_null: true } }
            ]
            isAccepted: { _eq: true }
         }
      ) {
         aggregate {
            sum {
               amountPaid
            }
            count
         }
      }
      customers_aggregate(
         where: {
            carts: {
               paymentStatus: { _eq: "SUCCEEDED" }
               brandId: { _in: $brandId }
               locationId: { _in: $locationId }
            }
            orders: {
               _or: [
                  { isRejected: { _eq: false } }
                  { isRejected: { _is_null: true } }
               ]
               isAccepted: { _eq: true }
            }
         }
      ) {
         aggregate {
            count
         }
      }
   }
`
