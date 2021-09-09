import axios from 'axios'
import { evalTime } from '../evalTime'
import { client } from '../../lib/graphql'
import {
   CREATE_CART,
   UPDATE_SUB_OCCURENCE
} from '../../entities/occurence/graphql'
import { statusLogger } from './statusLogger'
import get_env from '../../../get_env'

const BRAND_CUSTOMER = `
   query subscriptionOccurences(
      $brandCustomerId: Int!
      $subscriptionOccurenceId: Int!
   ) {
      brandCustomers(where: { id: { _eq: $brandCustomerId } }) {
         brandId
         keycloakId
         subscriptionAddressId
         subscriptionPaymentMethodId
         customer {
            id
            email
            keycloakId
            platform_customer: platform_customer {
               firstName
               lastName
               customerAddresses: customerAddresses {
                  id
                  line1
                  line2
                  city
                  state
                  zipcode
                  country
                  label
                  landmark
                  notes
                  additionalInfo
                  lat
                  lng
               }
            }
         }
         subscriptionOccurences(
            where: {
               subscriptionOccurenceId: { _eq: $subscriptionOccurenceId }
            }
         ) {
            isAuto
            cartId
            isSkipped
            keycloakId
            validStatus
            subscriptionId
            brand_customerId
         }
      }
   }
`

// const ORGANIZATION = `
//    query organization($id: Int!) {
//       organization(id: $id) {
//          id
//          stripeAccountType
//       }
//    }
// `

const GET_CUSTOMER_ORDER_DETAILS = `
   query customerOrder($subscriptionOccurenceId: Int!, $brandCustomerId: Int!) {
      subscriptionOccurences(where: { id: { _eq: $subscriptionOccurenceId } }) {
         id
         subscriptionAutoSelectOption
         fulfillmentDate
         subscription {
            subscriptionId: id
            availableZipcodes {
               zipcode
               deliveryTime
               deliveryPrice
               isActive
               isDeliveryActive
               isPickupActive
               subscriptionPickupOptionId
               subscriptionPickupOption {
                  id
                  time
               }
            }
            subscriptionItemCount {
               count
            }
            brand_customers(where: { id: { _eq: $brandCustomerId } }) {
               brandCustomerId: id
               subscriptionAddressId
               subscriptionPaymentMethodId
               brandId
               subscriptionOccurences(
                  where: {
                     subscriptionOccurenceId: { _eq: $subscriptionOccurenceId }
                  }
               ) {
                  validStatus
                  isAuto
                  cartId
                  isSkipped
               }
               customer {
                  id
                  keycloakId
                  email
                  platform_customer: platform_customer {
                     firstName
                     lastName
                     phoneNumber
                     paymentCustomerId
                     customerAddresses: customerAddresses {
                        city
                        country
                        created_at
                        landmark
                        lat
                        line1
                        line2
                        lng
                        zipcode
                        state
                        id
                     }
                  }
               }
            }
         }
      }
   }
`

const INSERT_SUBS_OCCURENCE = `
mutation insertSubscriptionOccurenceCustomer(
      $object: subscription_subscriptionOccurence_customer_insert_input!
   ) {
      insertSubscriptionOccurenceCustomer: insert_subscription_subscriptionOccurence_customer_one(
         object: $object
      ) {
         keycloakId
         subscriptionOccurenceId
      }
}`

const createCart = async data => {
   try {
      const {
         fulfillmentDate,
         subscriptionOccurenceId = '',
         brand_customers,
         availableZipcodes
      } = data
      if (brand_customers.length > 0 && availableZipcodes.length > 0) {
         const {
            subscriptionAddressId = '',
            subscriptionPaymentMethodId = ' ',
            brandId,
            customer = {}
         } = brand_customers[0]
         const {
            id = '',
            email = '',
            keycloakId = '',
            platform_customer = {}
         } = customer

         const customerInfo = {
            customerEmail: '',
            customerPhone: '',
            customerLastName: '',
            customerFirstName: ''
         }

         if (email) {
            customerInfo.customerEmail = customer.email
         }
         if (
            'phoneNumber' in platform_customer &&
            platform_customer.phoneNumber
         ) {
            customerInfo.customerPhone = platform_customer.phoneNumber
         }
         if ('firstName' in platform_customer && platform_customer.firstName) {
            customerInfo.customerFirstName = platform_customer.firstName
         }
         if ('lastName' in platform_customer && platform_customer.lastName) {
            customerInfo.customerLastName = platform_customer.lastName
         }

         let defaultAddress = null

         if (
            platform_customer &&
            platform_customer.customerAddresses.length > 0
         ) {
            const index = platform_customer.customerAddresses.findIndex(
               address => address.id === subscriptionAddressId
            )
            defaultAddress = platform_customer.customerAddresses[index]
         }

         let fulfillment = null
         if (defaultAddress && Object.keys(defaultAddress || {}).length > 0) {
            availableZipcodes.forEach(node => {
               if (
                  'zipcode' in defaultAddress &&
                  node.zipcode === defaultAddress.zipcode
               ) {
                  fulfillment = node
               }
            })
         }

         const fulfillmentInfo = {
            type: 'PREORDER_DELIVERY',
            slot: {
               from: '',
               to: ''
            }
         }

         if (
            fulfillmentDate &&
            fulfillment &&
            Object.keys(fulfillment || {}).length > 0
         ) {
            const {
               deliveryTime,
               isActive,
               isDeliveryActive,
               isPickupActive,
               subscriptionPickupOptionId,
               subscriptionPickupOption
            } = fulfillment

            if (isActive) {
               if (isDeliveryActive) {
                  if (deliveryTime.from) {
                     fulfillmentInfo.slot.from = evalTime(
                        fulfillmentDate,
                        deliveryTime.from
                     )
                  }
                  if (deliveryTime.to) {
                     fulfillmentInfo.slot.to = evalTime(
                        fulfillmentDate,
                        deliveryTime.to
                     )
                  }
               } else if (isPickupActive && subscriptionPickupOptionId) {
                  const { time } = subscriptionPickupOption
                  fulfillmentInfo.type = 'PREORDER_PICKUP'
                  if (time.from) {
                     fulfillmentInfo.slot.from = evalTime(
                        fulfillmentDate,
                        time.from
                     )
                  }
                  if (time.to) {
                     fulfillmentInfo.slot.to = evalTime(
                        fulfillmentDate,
                        time.to
                     )
                  }
                  if (time.address && Object.keys(time.address).length > 0) {
                     fulfillmentInfo.address = time.address
                  }
               }
            }
         }

         // const ORGANIZATION_ID = await get_env('ORGANIZATION_ID')
         // const { organization } = await client.request(ORGANIZATION, {
         //    id: ORGANIZATION_ID
         // })

         const { paymentCustomerId } = platform_customer
         const { createCart } = await client.request(CREATE_CART, {
            object: {
               brandId,
               status: 'CART_PENDING',
               customerId: parseInt(id),
               paymentStatus: 'PENDING',
               customerInfo,
               fulfillmentInfo,
               source: 'subscription',
               address: defaultAddress,
               customerKeycloakId: keycloakId,
               subscriptionOccurenceId,
               ...(paymentCustomerId && { paymentCustomerId }),
               ...(subscriptionPaymentMethodId && {
                  paymentMethodId: subscriptionPaymentMethodId
               })
            }
         })
         return createCart.cartId
      }
   } catch (error) {
      console.error(error)
      throw error
   }
}

export const autoGenerateCart = async ({
   keycloakId,
   brand_customerId,
   subscriptionOccurenceId
}) => {
   await statusLogger({
      keycloakId,
      brand_customerId,
      type: 'Reminder Email',
      subscriptionOccurenceId,
      message: `Attempting autoGenerate ${brand_customerId}`
   })
   try {
      const { brandCustomers = [] } = await client.request(BRAND_CUSTOMER, {
         brandCustomerId: brand_customerId,
         subscriptionOccurenceId
      })

      if (
         brandCustomers.length > 0 &&
         brandCustomers[0].subscriptionOccurences.length === 0
      ) {
         await client.request(INSERT_SUBS_OCCURENCE, {
            object: {
               isAuto: true,
               isSkipped: false,
               keycloakId,
               brand_customerId,
               subscriptionOccurenceId
            }
         })
         await statusLogger({
            keycloakId,
            brand_customerId,
            type: 'Reminder Email',
            subscriptionOccurenceId,
            message: `Subscription Occurence Customer created.`
         })
      }

      const { subscriptionOccurences = [] } = await client.request(
         GET_CUSTOMER_ORDER_DETAILS,
         {
            subscriptionOccurenceId,
            brandCustomerId: brand_customerId
         }
      )

      if (subscriptionOccurences.length === 0) return
      const { fulfillmentDate, subscription = {} } = subscriptionOccurences[0]

      let cartId
      if (subscription.brand_customers.length > 0) {
         const { subscriptionOccurences = [] } = subscription.brand_customers[0]
         if (
            subscriptionOccurences.length > 0 &&
            subscriptionOccurences[0].cartId
         ) {
            cartId = subscriptionOccurences[0].cartId
         }
      }

      const DATA_HUB = await get_env('DATA_HUB')

      const url = `${new URL(DATA_HUB).origin}/webhook/occurence/auto-select`
      if (cartId) {
         await axios.post(url, {
            keycloakId,
            brand_customerId,
            subscriptionOccurenceId
         })
      } else {
         const _cartId = await createCart({
            ...subscription,
            subscriptionOccurenceId,
            isAuto: true,
            fulfillmentDate
         })

         await client.request(UPDATE_SUB_OCCURENCE, {
            subscriptionOccurenceId,
            brandCustomerId: brand_customerId,
            isAuto: true,
            cartId: _cartId
         })

         await statusLogger({
            keycloakId,
            cartId: _cartId,
            brand_customerId,
            type: 'Reminder Email',
            subscriptionOccurenceId,
            message: 'Cart has been created for auto product selection.'
         })

         if (_cartId) {
            await axios.post(url, {
               keycloakId,
               brand_customerId,
               subscriptionOccurenceId
            })
         }
      }
      return
   } catch (error) {
      console.error(error)
      throw error
   }
}
