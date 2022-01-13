import gql from 'graphql-tag'

export const CUSTOMERS_LISTING = gql`
   query CUSTOMER_LISTING($brandId: Int!) {
      customers(
         where: {
            isArchived: { _eq: false }
            brandCustomers: { brand: { id: { _eq: $brandId } } }
         }
      ) {
         keycloakId
         source
         brandCustomers(where: { brandId: { _eq: $brandId } }) {
            created_at
            updated_at
            isSubscriberTimeStamp
            subscriber: isSubscriber
            isSubscriptionCancelled
            pausePeriod
            subscription {
               rrule
               subscriptionItemCount {
                  count
                  plan: subscriptionServing {
                     servingSize
                     subscriptionTitle {
                        title
                     }
                  }
               }
            }
         }
         platform_customer: platform_customer {
            firstName
            lastName
            email
            phoneNumber
         }
         orders_aggregate {
            aggregate {
               count
               sum {
                  amountPaid
                  discount
               }
            }
         }
      }
   }
`
export const CUSTOMER_DATA = gql`
   query CUSTOMER_DATA($keycloakId: String!, $brandId: Int!) {
      brand(id: $brandId) {
         brand_customers(where: { keycloakId: { _eq: $keycloakId } }) {
            id
            customer {
               source
               isTest
               email
               keycloakId
               platform_customer: platform_customer {
                  firstName
                  lastName
                  email
                  phoneNumber
               }
               orders_aggregate {
                  aggregate {
                     count
                     sum {
                        amountPaid
                     }
                  }
               }
            }
         }
      }
   }
`

export const ORDERS_LISTING = gql`
   query ORDERS_LISTING($keycloakId: String!, $brandId: Int!) {
      brand(id: $brandId) {
         brand_customers(where: { keycloakId: { _eq: $keycloakId } }) {
            customer {
               orders {
                  id
                  itemTotal
                  discount
                  discount
                  amountPaid
                  created_at
                  cart {
                     source
                     walletAmountUsed
                     loyaltyPointsUsed
                     cartItems(where: { levelType: { _eq: "orderItem" } }) {
                        displayName
                     }
                  }
               }
               orders_aggregate {
                  aggregate {
                     count
                  }
               }
            }
         }
      }
   }
`

export const REFERRAL_LISTING = gql`
   query REFERRAL_LISTING($keycloakId: String!, $brandId: Int!) {
      customerReferrals(
         where: {
            customerReferrer: { keycloakId: { _eq: $keycloakId } }
            brandId: { _eq: $brandId }
         }
      ) {
         customer {
            platform_customer: platform_customer {
               firstName
               lastName
               phoneNumber
               email
            }
         }
         referralStatus
      }
   }
`

export const WALLET_LISTING = gql`
   subscription WALLET_LISTING($keycloakId: String!, $brandId: Int!) {
      walletTransactions(
         where: {
            wallet: {
               keycloakId: { _eq: $keycloakId }
               brandId: { _eq: $brandId }
            }
         }
         order_by: { created_at: desc }
      ) {
         created_at
         id
         orderCart {
            orderId
         }
         type
         amount
         wallet {
            amount
         }
      }
   }
`

export const LOYALTYPOINTS_LISTING = gql`
   subscription LOYALTYPOINTS_LISTING($keycloakId: String!, $brandId: Int!) {
      loyaltyPointsTransactions(
         where: {
            loyaltyPoint: {
               keycloakId: { _eq: $keycloakId }
               brandId: { _eq: $brandId }
            }
         }
         order_by: { created_at: desc }
      ) {
         created_at
         id
         type
         points
         cart {
            orderId
         }
         loyaltyPoint {
            balanceAmount: points
         }
      }
   }
`

export const ORDER = gql`
   query ORDER($orderId: oid!, $brandId: Int!) {
      brand(id: $brandId) {
         brand_Orders(where: { id: { _eq: $orderId } }) {
            id
            itemTotal
            discount
            amountPaid
            created_at
            cart {
               source
               itemTotal
               deliveryPrice
               billingDetails
               walletAmountUsed
               loyaltyPointsUsed
               cartItems(where: { level: { _eq: 1 } }) {
                  id
                  displayName
                  displayImage
                  unitPrice
                  childs {
                     displayName
                     displayImage
                     unitPrice
                  }
               }
               paymentMethodId
               paymentCart {
                  brand
                  last4
                  expMonth
                  expYear
               }
            }
            deliveryService {
               logo
               companyName
            }
            driverInfo: deliveryInfo(path: "assigned.driverInfo")
            deliveryFee: deliveryInfo(path: "deliveryFee")
         }
      }
   }
`

export const ALL_DATA = gql`
   query ALLCUSTOMER_DATA($keycloakId: String!, $brandId: Int!) {
      brand(id: $brandId) {
         brand_customers(where: { keycloakId: { _eq: $keycloakId } }) {
            customer {
               platform_customer: platform_customer {
                  customerAddresses: customerAddresses {
                     id
                     line1
                     line2
                     city
                     state
                     country
                     zipcode
                     notes
                     label
                     searched
                     landmark
                     keycloakId
                  }
                  stripePaymentMethods: customerPaymentMethods {
                     paymentMethodId
                     brand
                     last4
                     expMonth
                     expYear
                  }
               }
            }
         }
      }
   }
`
export const STATUS = gql`
   query STATUS($oid: oid!, $brandId: Int!) {
      brand(id: $brandId) {
         brand_Orders(where: { id: { _eq: $oid } }) {
            id
            cart {
               status
               transactionId
               paymentStatus
               transactionRemark
            }
         }
      }
   }
`

export const SUBSCRIPTION = gql`
   query SUBSCRIPTION($keycloakId: String!, $brandId: Int!) {
      brand(id: $brandId) {
         brand_customers(where: { keycloakId: { _eq: $keycloakId } }) {
            subscriptionId
            customer {
               ordered: subscriptionOccurences_aggregate(
                  where: { cart: { orderId: { _is_null: false } } }
               ) {
                  aggregate {
                     count
                  }
               }
               skipped: subscriptionOccurences_aggregate(
                  where: { isSkipped: { _eq: true } }
               ) {
                  aggregate {
                     count
                  }
               }
            }
         }
      }
   }
`
export const SUBSCRIPTION_PLAN = gql`
   query SUBSCRIPTION_PLAN($keycloakId: String!, $brandId: Int!) {
      brand(id: $brandId) {
         brand_customers(where: { keycloakId: { _eq: $keycloakId } }) {
            isSubscriber
            pausePeriod
            isSubscriptionCancelled
            subscriptionCancellationReason
            subscription {
               rrule
               subscriptionItemCount {
                  count
                  plan: subscriptionServing {
                     servingSize
                     subscriptionTitle {
                        title
                     }
                  }
               }
            }
         }
      }
   }
`
export const OCCURENCES = gql`
   query OCCURENCES($sid: Int!, $keycloakId: String!, $brandId: Int!) {
      subscriptionOccurencesAggregate(
         where: {
            subscriptionId: { _eq: $sid }
            brand_subscriptionOccurences: { id: { _eq: $brandId } }
         }
      ) {
         occurenceCount: aggregate {
            count
         }
         nodes {
            fulfillmentDate
            startTimeStamp
            cutoffTimeStamp
            customers(where: { keycloakId: { _eq: $keycloakId } }) {
               isSkipped
               cart {
                  orderId
                  id
                  amount
               }
            }
         }
      }
   }
`

export const OCCURENCES_REPORT = gql`
   query MyQuery($brand_customerId: Int_comparison_exp!) {
      report: subscription_view_full_occurence_report_aggregate(
         where: { brand_customerId: $brand_customerId }
         order_by: { fulfillmentDate: desc }
      ) {
         aggregate {
            count
         }
         nodes {
            subscriptionOccurenceId
            totalProductsToBeAdded
            fulfillmentDate
            cutoffTimeStamp
            cartId
            betweenPause
            allTimeRank
            addedProductsCount
            paymentStatus
            percentageSkipped
            skippedAtThisStage
            isSkipped
            isPaused
            isItemCountValid
            isAuto
            cart {
               paymentStatus
               status
               amount
            }
         }
      }
   }
`

export const REWARD_DATA = gql`
   query REWARD_DATA($id: Int!) {
      crm_reward_by_pk(id: $id) {
         campaignId
         conditionId
         couponId
         id
         rewardValue
         type
         position
      }
   }
`
export const CUSTOMERS_LISTING_2 = gql`
   query CUSTOMERS_LISTING_2(
      $brandId: Int!
      $order_by: [crm_brand_customer_order_by!]!
   ) {
      brandCustomers(
         where: {
            brandId: { _eq: $brandId }
            customer: { isArchived: { _eq: false } }
         }
         order_by: $order_by
      ) {
         id
         keycloakId
         customer {
            email
            source
            platform_customer: platform_customer {
               fullName
               phoneNumber
            }
         }
         isSubscriber
         subscriptionTitle {
            title
         }
         subscriptionServing {
            servingSize
         }
         subscriptionItemCount {
            count
         }
         subscription {
            rrule
         }
         pausePeriod
         isSubscriberTimeStamp
         isSubscriptionCancelled
         created_at
         updated_at
         orders_aggregate {
            aggregate {
               count
               sum {
                  amountPaid
                  discount
               }
            }
         }
      }
      uniqueDeliveryDays: subscription_subscription(distinct_on: rrule) {
         rrule
      }
      uniqueItemCounts: subscription_subscriptionItemCount(distinct_on: count) {
         count
      }
      uniqueServings: subscription_subscriptionServing(
         distinct_on: servingSize
      ) {
         servingSize
      }
      uniqueTitles: subscription_subscriptionTitle(distinct_on: title) {
         title
      }
   }
`
export const UNIQUE_SUBSCRIPTION_FILTER_VALUES = gql`
   query UNIQUE_SUBSCRIPTION_FILTER_VALUES {
      subscription_subscription(distinct_on: rrule) {
         rrule
      }
      subscription_subscriptionItemCount(distinct_on: count) {
         count
      }
      subscription_subscriptionServing(distinct_on: servingSize) {
         servingSize
      }
      subscription_subscriptionTitle(distinct_on: title) {
         title
      }
   }
`
