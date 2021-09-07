import gql from 'graphql-tag'

export const CUSTOMERS_COUNT = gql`
   subscription CUSTOMERS_COUNT($where: crm_customer_bool_exp!) {
      customers_aggregate(where: $where) {
         aggregate {
            count
         }
      }
   }
`
