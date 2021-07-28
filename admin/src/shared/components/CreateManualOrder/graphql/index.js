import gql from 'graphql-tag'

export const MUTATIONS = {
   BRAND: {
      CUSTOMER: {
         UPDATE: gql`
            mutation updateBrandCustomers(
               $where: crm_brand_customer_bool_exp!
               $_set: crm_brand_customer_set_input!
            ) {
               updateBrandCustomers(where: $where, _set: $_set) {
                  affected_rows
               }
            }
         `,
      },
   },
   STRIPE: {
      PAYMENT_METHOD: {
         CREATE: gql`
            mutation paymentMethod(
               $object: platform_stripePaymentMethod__insert_input!
            ) {
               paymentMethod: insert_platform_stripePaymentMethod__one(
                  object: $object
               ) {
                  keycloakId
                  stripePaymentMethodId
               }
            }
         `,
      },
   },
   CART: {
      INSERT: gql`
         mutation createCart($object: order_cart_insert_input!) {
            createCart(object: $object) {
               id
               subscriptionOccurenceId
            }
         }
      `,
   },
   SUBSCRIPTION: {
      OCCURENCE: {
         CREATE: gql`
            mutation insertSubscriptionOccurence(
               $object: subscription_subscriptionOccurence_customer_insert_input!
            ) {
               insertSubscriptionOccurence: insert_subscription_subscriptionOccurence_customer_one(
                  object: $object
               ) {
                  keycloakId
               }
            }
         `,
      },
   },
   REGISTER_AND_CREATE_BRAND_CUSTOMER: gql`
      mutation registerAndCreateBrandCustomer(
         $input: RegisterAndCreateBrandCustomerInput!
      ) {
         registerAndCreateBrandCustomer(input: $input) {
            success
            data
            error
            message
         }
      }
   `,
   UPDATE_PLATFORM_CUSTOMER: gql`
      mutation platform_updateCustomer(
         $keycloakId: String!
         $_set: platform_customer__set_input = {}
      ) {
         platform_updateCustomer: update_platform_customer__by_pk(
            pk_columns: { keycloakId: $keycloakId }
            _set: $_set
         ) {
            firstName
            lastName
            phoneNumber
         }
      }
   `,
   INSERT_PLATFORM_PROVIDER_CUSTOMER: gql`
      mutation createPlatformCustomer(
         $object: platform_provider_customer_insert_input!
      ) {
         createPlatformCustomer: insert_platform_provider_customer_one(
            object: $object
         ) {
            id
            customerId
         }
      }
   `,
   INSERT_CUSTOMER: gql`
      mutation createCustomer(
         $object: crm_customer_insert_input!
         $where: crm_brand_customer_bool_exp = {}
      ) {
         createCustomer(object: $object) {
            id
            brandCustomers(where: $where) {
               id
            }
         }
      }
   `,
}

export const QUERIES = {
   BRAND: {
      LIST: gql`
         query brands {
            brands(
               where: { isArchived: { _eq: false }, isPublished: { _eq: true } }
               order_by: { title: asc }
            ) {
               id
               title
               domain
            }
         }
      `,
   },
   CUSTOMER: {
      LIST: gql`
         query customers($where: crm_brand_customer_bool_exp = {}) {
            customers: brandCustomers(where: $where) {
               id
               isDemo
               keycloakId
               isSubscriber
               subscriptionId
               subscriptionPaymentMethodId
               customer {
                  id
                  email
                  isTest
                  platform_customer: platform_customer_ {
                     id: keycloakId
                     firstName
                     lastName
                     phoneNumber
                     fullName
                     stripeCustomerId
                  }
               }
            }
         }
      `,
      ONE: gql`
         query brandCustomer($id: Int!) {
            brandCustomer(id: $id) {
               id
               isDemo
               keycloakId
               isSubscriber
               subscriptionId
               subscriptionPaymentMethodId
               customer {
                  id
                  email
                  isTest
                  platform_customer: platform_customer_ {
                     id: keycloakId
                     firstName
                     lastName
                     phoneNumber
                     fullName
                     stripeCustomerId
                  }
               }
            }
         }
      `,
   },
   ORGANIZATION: gql`
      query organizations {
         organizations {
            id
            stripeAccountId
            stripeAccountType
            stripePublishableKey
         }
      }
   `,
   SUBSCRIPTION: {
      OCCURENCE: {
         LIST: gql`
            query occurences(
               $includeCustomers: Boolean!
               $where: subscription_subscriptionOccurence_bool_exp
               $whereCustomer: subscription_subscriptionOccurence_customer_bool_exp = {

               }
            ) {
               occurences: subscriptionOccurences(
                  where: $where
                  order_by: { fulfillmentDate: asc_nulls_last }
               ) {
                  id
                  fulfillmentDate
                  cutoffTimeStamp
                  customers(where: $whereCustomer)
                     @include(if: $includeCustomers) {
                     id: cartId
                     hasCart: validStatus(path: "hasCart")
                  }
               }
            }
         `,
      },
      PLANS: gql`
         query plans(
            $isDemo: Boolean!
            $where: subscription_subscriptionTitle_bool_exp!
         ) {
            plans: subscription_subscriptionTitle(where: $where) {
               id
               title
               servings: subscriptionServings(
                  order_by: { servingSize: asc }
                  where: { isDemo: { _eq: $isDemo }, isActive: { _eq: true } }
               ) {
                  id
                  size: servingSize
                  itemCounts: subscriptionItemCounts(
                     order_by: { count: asc, price: asc }
                     where: {
                        isDemo: { _eq: $isDemo }
                        isActive: { _eq: true }
                     }
                  ) {
                     id
                     count
                     price
                     isTaxIncluded
                  }
               }
            }
         }
      `,
      ITEM_COUNT: gql`
         query itemCount($id: Int!, $zipcode: String, $isDemo: Boolean) {
            itemCount: subscription_subscriptionItemCount_by_pk(id: $id) {
               id
               subscriptions(
                  where: {
                     isDemo: { _eq: $isDemo }
                     availableZipcodes: { zipcode: { _eq: $zipcode } }
                  }
                  order_by: { position: desc_nulls_last }
               ) {
                  id
                  rrule
                  zipcodes: availableZipcodes(
                     where: { zipcode: { _eq: $zipcode } }
                  ) {
                     deliveryPrice
                     isDeliveryActive
                     isPickupActive
                  }
               }
            }
         }
      `,
   },
}
