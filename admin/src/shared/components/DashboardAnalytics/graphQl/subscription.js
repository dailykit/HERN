import gql from 'graphql-tag'

const INSIGHT_ANALYTICS = gql`
   subscription insights_analytics(
      $args: getTotalEarnings_insights_analytics_args!
   ) {
      insights_analytics {
         id
         getTotalEarnings(args: $args)
      }
   }
`
export const GET_TOTAL_EARNING = gql`
   subscription GET_TOTAL_EARNING(
      $args: getTotalEarnings_insights_analytics_args!
   ) {
      insights_analytics {
         getTotalEarnings(args: $args)
      }
   }
`
export const TOTAL_ORDER_RECEIVED = gql`
   subscription TOTAL_ORDER_RECEIVED(
      $args: getOrdersRecieved_insights_analytics_args!
   ) {
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
      $args: getAcceptedVsRejectedOrders_insights_analytics_args!
   ) {
      insights_analytics {
         getAcceptedVsRejectedOrders(args: $args)
      }
   }
`
export const SUBSCRIBED_CUSTOMER = gql`
   subscription SUBSCRIBED_CUSTOMER(
      $args: getSubscribedCustomers_insights_analytics_args!
   ) {
      insights_analytics {
         getSubscribedCustomers(args: $args)
      }
   }
`
export const GET_REGISTERED_CUSTOMER = gql`
   subscription GET_REGISTERED_CUSTOMER(
      $args: getRegisteredCustomers_insights_analytics_args!
   ) {
      insights_analytics {
         getRegisteredCustomers(args: $args)
      }
   }
`
export const LOCATIONS = gql`
   subscription LOCATIONS {
      brands_location {
         locationId: id
         title: label
      }
   }
`
export const LOCATIONS_WITH_BRANDS = gql`
   subscription MySubscription($brandId: Int_comparison_exp!) {
      brands_location(where: { brand_locations: { brandId: $brandId } }) {
         id
         label
      }
   }
`
