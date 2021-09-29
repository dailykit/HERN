export const FULL_OCCURENCE_REPORT = `
query FullOccurenceReport {
    brandCustomers(where: {isSubscriber: {_eq: true},isSubscriptionCancelled: {_eq: false}}) {
      id
      pastOccurences: subscriptionOccurences(where: {_or: {_and: {subscriptionOccurence: {cutoffTimeStamp: {_lte: "now()"}}, isArchived: {_eq: false}}, cart: {paymentStatus: {_neq: "PENDING"}}}}, order_by: {subscriptionOccurence: {fulfillmentDate: asc}}) {
        subscriptionOccurence {
          id
          fulfillmentDate
          cutoffTimeStamp
          startTimeStamp
          view_subscription {
        rrule
        subscriptionItemCount
        subscriptionServingSize
        title
      }
        }
        betweenPause
        cart {
          id
        paymentRetryAttempt
        paymentStatus
        status
        totalPrice
        discount
        }
        validStatus
        isPaused
        isSkipped
      }
      customer {
        email
      }
      subscription {
        subscriptionOccurences(where: {cutoffTimeStamp: {_gte: "now()"}, startTimeStamp: {_lte: "now()"}}) {
          fulfillmentDate
          id
        }
      }

      upcomingOccurences: activeSubscriptionOccurenceCustomers(where: {subscriptionOccurence: {cutoffTimeStamp: {_gte: "now()"}, startTimeStamp: {_lte: "now()"}}}) {
        subscriptionOccurence {
          id
          fulfillmentDate
          cutoffTimeStamp
          startTimeStamp
          view_subscription {
            rrule
            subscriptionItemCount
            subscriptionServingSize
            title
          }
        }
        betweenPause
        cart {
          id
        paymentRetryAttempt
        paymentStatus
        status
        totalPrice
        discount
        }
        validStatus
        isPaused
        isSkipped
      }
    }
  }`

export const HASURA_OPERATION_EXTRACT_TO_BE_OCCURECES = `
  query FullOccurenceReport($brandCustomerFilter: crm_brand_customer_bool_exp!) {
    brandCustomers(where: $brandCustomerFilter) {
      id
      keycloakId
      subscription {
        subscriptionOccurences(where: {cutoffTimeStamp: {_gte: "now()"}, startTimeStamp: {_lte: "now()"}}) {
          fulfillmentDate
          id
        }
      }
      upcomingOccurences: activeSubscriptionOccurenceCustomers(where: {subscriptionOccurence: {cutoffTimeStamp: {_gte: "now()"}, startTimeStamp: {_lte: "now()"}}}) {
        subscriptionOccurence {
          id
        }
      }
    }
  }
  `
export const HASURA_OPERATION = `
  query FullOccurenceReport($brandCustomerFilter: crm_brand_customer_bool_exp!) {
    brandCustomers(where: $brandCustomerFilter) {
      id
      pastOccurences: subscriptionOccurences(where: {_or: {_and: {subscriptionOccurence: {cutoffTimeStamp: {_lte: "now()"}}, isArchived: {_eq: false}}, cart: {paymentStatus: {_neq: "PENDING"}}}}, order_by: {subscriptionOccurence: {fulfillmentDate: asc}}) {
        subscriptionOccurence {
          id
          fulfillmentDate
          cutoffTimeStamp
          startTimeStamp
          view_subscription {
            rrule
            subscriptionItemCount
            subscriptionServingSize
            title
          }
        }
        betweenPause
        cart {
          id
          paymentRetryAttempt
          paymentStatus
          status
          totalPrice
          discount
          orderId
        }
        validStatus
        isPaused
        isSkipped
      }
      customer {
        email
        platform_customer {
          fullName
        }
      }
      subscription {
        subscriptionOccurences(where: {cutoffTimeStamp: {_gte: "now()"}, startTimeStamp: {_lte: "now()"}}) {
          fulfillmentDate
          id
        }
      }
      upcomingOccurences: activeSubscriptionOccurenceCustomers(where: {subscriptionOccurence: {cutoffTimeStamp: {_gte: "now()"}, startTimeStamp: {_lte: "now()"}}}) {
        subscriptionOccurence {
          id
          fulfillmentDate
          cutoffTimeStamp
          startTimeStamp
          view_subscription {
            rrule
            subscriptionItemCount
            subscriptionServingSize
            title
          }
        }
        betweenPause
        cart {
          id
          paymentRetryAttempt
          paymentStatus
          status
          totalPrice
          discount
        }
        customer {
          email
          platform_customer {
            fullName
          }
        }
        validStatus
        isPaused
        isSkipped
      }
    }
  }
  `
