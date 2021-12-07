import gql from 'graphql-tag'

export const INSIGHT_ANALYTICS = gql`
   subscription INSIGHT_ANALYTICS(
      $args: insights_getTotalEarnings_args!
      $args1: insights_getAcceptedVsRejectedOrders_args!
      $args2: insights_getOrdersByStatus_args!
      $args3: insights_getOrdersRecieved_args!
      $args4: insights_getRegisteredCustomers_args!
      $args5: insights_getSubscribedCustomers_args!
   ) {
      insights_analytics {
         id
         getTotalEarnings(args: $args)
         getAcceptedVsRejectedOrders(args: $args1)
         getOrdersByStatus(args: $args2)
         getOrdersRecieved(args: $args3)
         getRegisteredCustomers(args: $args4)
         getSubscribedCustomers(args: $args5)
      }
   }
`
