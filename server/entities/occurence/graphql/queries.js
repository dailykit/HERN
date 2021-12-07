export const GET_REMINDER_SETTINGS = `
    query getReminderSettings($id: Int!){
        subscriptionOccurences(where: {id: {_eq: $id}}) {
            subscription {
                reminderSettings
            }
        }
    }
`

export const GET_TEMPLATE_SETTINGS = `
   query getTemplateSettings($identifier: String! ) {
      brands_brand_brandSetting(where: {brandSetting: {identifier: {_eq: $identifier} }}) {
       value
   }
}   
`

export const GET_CUSTOMERS_DETAILS = `
   query customerDetails($id: Int!) {
      subscriptionOccurences(where: { id: { _eq: $id } }) {
         id
         settings
         subscriptionId
         subscription {
            id
            settings
            brand_customers(
               where: {
                  isSubscriber: { _eq: true }
                  isSubscriptionCancelled: { _eq: false }
               }
            ) {
               id
               keycloakId
               isAutoSelectOptOut
               customerEmail: customer {
                  email
               }
               subscriptionOccurences(
                  where: { subscriptionOccurenceId: { _eq: $id } }
               ) {
                  validStatus
                  isSkipped
                  isAuto
                  cartId
               }
            }
         }
      }
   }
`

export const CUSTOMERS = `
   query customerDetails($id: Int!) {
      subscriptionOccurences(where: { id: { _eq: $id } }) {
         id
         subscriptionId
         subscription {
            id
            brand_customers(
               where: {
                  isSubscriptionCancelled: { _eq: false }
                  isSubscriber: { _eq: true }
               }
            ) {
               id
               keycloakId
               isAutoSelectOptOut
               customerEmail: customer {
                  email
               }
               subscriptionOccurences(
                  where: { subscriptionOccurenceId: { _eq: $id } }
               ) {
                  validStatus
                  isSkipped
                  isAuto
                  cartId
                  betweenPause
               }
            }
         }
      }
   }
`

export const SUBSCRIPTION_OCCURENCES = `
   query subscriptionOccurences(
      $where: subscription_subscriptionOccurence_bool_exp = {}
   ) {
      subscriptionOccurences(where: $where) {
         id
         settings
         cutoffTimeStamp
         fulfillmentDate
         subscriptionId
         subscription {
            id
            settings
         }
      }
   }
`

export const SUBSCRIPTION_CUSTOMER_FULL_REPORT = `
   query subscription_view_full_occurence_report(
      $where: subscription_view_full_occurence_report_bool_exp = {}
   ) {
      subscription_view_full_occurence_report(where: $where) {
         cartId
         isPaused
         isSkipped
         keycloakId
         betweenPause
         paymentStatus
         subscriptionId
         brand_customerId
         isItemCountValid
         subscriptionOccurenceId
         brandCustomer {
            id
            keycloakId
            subscriptionId
            isSubscriber
            isSubscriptionCancelled
         }
      }
   }
`

export const GET_PRODUCTS = `
   query getProducts($subscriptionOccurenceId: Int!, $subscriptionId: Int!) {
      products: subscription_subscriptionOccurence_product(
         where: {
            _or: [
               { subscriptionId: { _eq: $subscriptionId } }
               { subscriptionOccurenceId: { _eq: $subscriptionOccurenceId } }
            ]
         }
      ) {
         cartItem
      }
   }
`

export const SUBSCRIPTION_OCCURENCE_CUSTOMERS = `
   query subscriptionOccurence_customers(
      $where: subscription_subscriptionOccurence_customer_bool_exp = {}
   ) {
      subscriptionOccurence_customers: subscription_subscriptionOccurence_customer(
         where: $where
      ) {
         validStatus
         cartId
         isSkipped
         subscriptionOccurence {
            subscriptionAutoSelectOption
         }
         brand_customer {
            id
            customer {
               id
               email
            }
         }
      }
   }
`
