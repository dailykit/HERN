import gql from 'graphql-tag'

const INSIGHT_ANALYTICS = gql`
   subscription insights_analytics($args: insights_getTotalEarnings_args!) {
      insights_analytics {
         id
         getTotalEarnings(args: $args)
      }
   }
`
export const GET_TOTAL_EARNING = gql`
   subscription GET_TOTAL_EARNING($args: insights_getTotalEarnings_args!) {
      insights_analytics {
         getTotalEarnings(args: $args)
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
export const BRANDS = gql`
   subscription BRANDS {
      brands(where: { isArchived: { _eq: false } }, order_by: { title: asc }) {
         title
         isDefault
         brandId: id
      }
   }
`
export const ACCEPTED_AND_REJECTED_ORDERS = gql`
   subscription ACCEPTED_AND_REJECTED_ORDERS(
      $args: insights_getAcceptedVsRejectedOrders_args!
   ) {
      insights_analytics {
         getAcceptedVsRejectedOrders(args: $args)
      }
   }
`
export const SUBSCRIBED_CUSTOMER = gql`
   subscription SUBSCRIBED_CUSTOMER(
      $args: insights_getSubscribedCustomers_args!
   ) {
      insights_analytics {
         getSubscribedCustomers(args: $args)
      }
   }
`
export const GET_REGISTERED_CUSTOMER = gql`
   subscription GET_REGISTERED_CUSTOMER(
      $args: insights_getRegisteredCustomers_args!
   ) {
      insights_analytics {
         getRegisteredCustomers(args: $args)
      }
   }
`
