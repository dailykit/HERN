import gql from 'graphql-tag'

export const SUBSCRIPTION_VIEW_FULL_OCCURENCE_REPORT = gql`
   query subscription_view_full_occurence_report {
      subscription_view_full_occurence_report {
         cartId
         cutoffTimeStamp
         fulfillmentDate
         isAuto
         isItemCountValid
         isPaused
         isSkipped
         keycloakId
         paymentRetryAttempt
         paymentStatus
         percentageSkipped
         skippedAtThisStage
         subscriptionId
         subscriptionOccurenceId
         totalProductsToBeAdded
         addedProductsCount
         allTimeRank
         betweenPause
         brand_customerId
      }
   }
`
export const FULL_OCCURENCE_REPORT = gql`
   query MyQuery(
      $brandCustomerFilter: FullOccurenceReportCrmBrandCustomerBoolExp!
   ) {
      FullOccurenceReport(brandCustomerFilter: $brandCustomerFilter) {
         cartId
         fulfillmentDate
         title
         addedProductsCount
         allTimeRank
         betweenPause
         brand_customerId
         cartStatus
         cartTotalPrice
         cutoffTimeStamp
         discount
         email
         hasCart
         isItemCountValid
         isPaused
         isSkipped
         itemCountValidComment
         paymentRetryAttempt
         paymentStatus
         pendingProductCount
         percentageSkipped
         rrule
         skippedAtThisStage
         startTimeStamp
         subscriptionItemCount
         subscriptionOccurenceId
         subscriptionServingSize
      }
   }
`
