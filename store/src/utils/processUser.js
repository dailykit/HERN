import { isEmpty } from 'lodash'

export const processUser = (customer, stripeAccountType = '') => {
   const sub = {}
   const { brandCustomers = [], ...rest } = customer

   if (!isEmpty(brandCustomers)) {
      const [brand_customer] = brandCustomers

      const {
         id,
         isDemo = false,
         subscription = null,
         subscriptionId = null,
         subscriptionAddressId = null,
         subscriptionPaymentMethodId = null,
         isSubscriptionCancelled = null,
         pausePeriod = null,
      } = brand_customer

      rest.isDemo = isDemo
      rest.brandCustomerId = id
      rest.pausePeriod = pausePeriod
      rest.subscription = subscription
      rest.subscriptionId = subscriptionId
      rest.subscriptionAddressId = subscriptionAddressId
      rest.isSubscriptionCancelled = isSubscriptionCancelled
      rest.subscriptionPaymentMethodId = subscriptionPaymentMethodId

      sub.defaultAddress = rest?.platform_customer?.addresses.find(
         address => address.id === subscriptionAddressId
      )

      sub.defaultPaymentMethod = rest?.platform_customer?.paymentMethods.find(
         method => method.paymentMethodId === subscriptionPaymentMethodId
      )
   }
   return { ...rest, ...sub }
}
