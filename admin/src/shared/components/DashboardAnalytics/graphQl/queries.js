import gql from 'graphql-tag'

export const INSIGHT_ANALYTICS = gql`
   subscription INSIGHT_ANALYTICS(
      $args: getTotalEarnings_insights_analytics_args!
      $args1: getAcceptedVsRejectedOrders_insights_analytics_args!
      $args2: getOrdersByStatus_insights_analytics_args!
      $args3: getOrdersRecieved_insights_args!
      $args4: getRegisteredCustomers_insights_analytics_args!
      $args5: getSubscribedCustomers_insights_analytics_args!
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
