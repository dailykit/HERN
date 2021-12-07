import gql from 'graphql-tag'

export const QUERIES = {
   CART: {
      ONE: gql`
         subscription cart($id: Int!) {
            cart(id: $id) {
               id
               tax
               orderId
               discount
               itemTotal
               totalPrice
               customerId
               customerInfo
               paymentStatus
               deliveryPrice
               fulfillmentInfo
               paymentMethodId
               walletAmountUsed
               loyaltyPointsUsed
               loyaltyPointsUsable
               customerKeycloakId
               billing: billingDetails
               subscriptionOccurenceId
               subscriptionOccurence {
                  id
                  fulfillmentDate
               }
               occurenceCustomer: subscriptionOccurenceCustomer {
                  itemCountValid: validStatus(path: "itemCountValid")
                  addedProductsCount: validStatus(path: "addedProductsCount")
                  pendingProductsCount: validStatus(
                     path: "pendingProductsCount"
                  )
               }
               brand {
                  id
                  title
                  domain
                  onDemandSettings(
                     where: {
                        onDemandSetting: {
                           identifier: {
                              _in: [
                                 "Location"
                                 "Pickup Availability"
                                 "Delivery Availability"
                              ]
                           }
                        }
                     }
                  ) {
                     value
                     onDemandSetting {
                        identifier
                     }
                  }
               }
               address
               fulfillmentInfo
               products: cartItems_aggregate(where: { level: { _eq: 1 } }) {
                  aggregate {
                     count
                  }
                  nodes {
                     id
                     addOnLabel
                     addOnPrice
                     price: unitPrice
                     name: displayName
                     image: displayImage
                     childs {
                        id
                        price: unitPrice
                        name: displayName
                        productOption {
                           id
                           label
                        }
                        childs {
                           id
                           displayName
                           price: unitPrice
                           modifierOption {
                              id
                              name
                           }
                        }
                        customizableProductComponent {
                           id
                           fullName
                           linkedProduct {
                              id
                              name
                           }
                        }
                        comboProductComponent {
                           id
                           label
                           linkedProduct {
                              id
                              name
                           }
                        }
                     }
                  }
               }
            }
         }
      `,
      LIST: gql`
         subscription carts($where: order_cart_bool_exp = {}) {
            carts: cartsAggregate(where: $where) {
               aggregate {
                  count
               }
               nodes {
                  id
                  source
                  customerInfo
                  brand {
                     id
                     title
                  }
                  fulfillmentInfo
               }
            }
         }
      `,
      REWARDS: gql`
         subscription CartRewards($cartId: Int!, $params: jsonb) {
            cartRewards(where: { cartId: { _eq: $cartId } }) {
               reward {
                  id
                  coupon {
                     id
                     code
                  }
                  condition {
                     isValid(args: { params: $params })
                  }
               }
            }
         }
      `,
   },
   COUPONS: {
      LIST: gql`
         subscription Coupons($params: jsonb, $brandId: Int!) {
            coupons(
               where: {
                  isActive: { _eq: true }
                  isArchived: { _eq: false }
                  brands: {
                     brandId: { _eq: $brandId }
                     isActive: { _eq: true }
                  }
               }
            ) {
               id
               code
               isRewardMulti
               rewards(order_by: { position: desc_nulls_last }) {
                  id
                  condition {
                     isValid(args: { params: $params })
                  }
               }
               metaDetails
               visibilityCondition {
                  isValid(args: { params: $params })
               }
            }
         }
      `,
   },
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
      SETTINGS: gql`
         query settings(
            $where: brands_brand_subscriptionStoreSetting_bool_exp = {}
         ) {
            settings: brands_brand_subscriptionStoreSetting(where: $where) {
               value
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
   CUSTOMER: {
      LIST: gql`
         query customers($where: crm_brand_customer_bool_exp = {}) {
            customers: brandCustomers(where: $where) {
               id
               keycloakId
               subscriptionId
               subscriptionAddressId
               subscriptionOnboardStatus
               subscriptionPaymentMethodId
               customer {
                  id
                  email
                  isTest
                  platform_customer: platform_customer {
                     id: keycloakId
                     firstName
                     lastName
                     phoneNumber
                     fullName
                     paymentCustomerId
                  }
               }
            }
         }
      `,
      ADDRESS: {
         LIST: gql`
            query addresses($where: platform_customerAddress_bool_exp = {}) {
               addresses: platform_customerAddress(where: $where) {
                  id
                  lat
                  lng
                  line1
                  line2
                  city
                  state
                  country
                  zipcode
                  label
                  notes
                  landmark
               }
            }
         `,
      },
      PAYMENT_METHODS: {
         ONE: gql`
            query paymentMethod($id: String!) {
               paymentMethod: platform_customerPaymentMethod_by_pk(
                  paymentMethodId: $id
               ) {
                  id: paymentMethodId
                  last4
                  expMonth
                  expYear
                  name: cardHolderName
               }
            }
         `,
         LIST: gql`
            query paymentMethods(
               $where: platform_customerPaymentMethod_bool_exp = {}
            ) {
               paymentMethods: platform_customerPaymentMethod(where: $where) {
                  id: paymentMethodId
                  last4
                  expMonth
                  expYear
                  name: cardHolderName
               }
            }
         `,
      },
   },
   MENU: gql`
      query menu($params: jsonb!) {
         menu: onDemand_getMenuV2(args: { params: $params }) {
            data
         }
      }
   `,
   PRODUCTS: {
      LIST: gql`
         query products($where: products_product_bool_exp = {}) {
            products(where: $where) {
               id
               name
               type
               assets
               tags
               additionalText
               description
               price
               discount
               isPopupAllowed
               isPublished
               defaultProductOptionId
               defaultCartItem
            }
         }
      `,
      ONE: gql`
         query product($id: Int!) {
            product(id: $id) {
               id
               name
               type
               price
               discount
               defaultProductOptionId
               defaultCartItem
               productOptions {
                  id
                  label
                  price
                  discount
                  cartItem
                  modifier {
                     id
                     categories(where: { isVisible: { _eq: true } }) {
                        id
                        isRequired
                        name
                        limits
                        type
                        options(where: { isVisible: { _eq: true } }) {
                           id
                           name
                           price
                           discount
                           image
                           isActive
                           cartItem
                        }
                     }
                  }
               }
               customizableProductComponents(
                  where: { isArchived: { _eq: false } }
                  order_by: { position: desc_nulls_last }
               ) {
                  id
                  selectedOptions {
                     productOption {
                        id
                        label
                        quantity
                        modifier {
                           id
                           name
                           categories(where: { isVisible: { _eq: true } }) {
                              name
                              isRequired
                              type
                              limits
                              options(where: { isVisible: { _eq: true } }) {
                                 id
                                 name
                                 price
                                 discount
                                 quantity
                                 image
                                 isActive
                                 simpleRecipeYieldId
                                 sachetItemId
                                 ingredientSachetId
                                 cartItem
                              }
                           }
                        }
                     }
                     price
                     discount
                     cartItem
                  }
                  linkedProduct {
                     id
                     name
                     type
                     assets
                  }
               }
               comboProductComponents(
                  where: { isArchived: { _eq: false } }
                  order_by: { position: desc_nulls_last }
               ) {
                  id
                  label
                  options
                  selectedOptions {
                     productOption {
                        id
                        label
                        quantity
                        modifier {
                           id
                           name
                           categories(where: { isVisible: { _eq: true } }) {
                              name
                              isRequired
                              type
                              limits
                              options(where: { isVisible: { _eq: true } }) {
                                 id
                                 name
                                 price
                                 discount
                                 quantity
                                 image
                                 isActive
                                 simpleRecipeYieldId
                                 sachetItemId
                                 ingredientSachetId
                                 cartItem
                              }
                           }
                        }
                     }
                     price
                     discount
                     cartItem
                  }
                  linkedProduct {
                     id
                     name
                     type
                     assets
                     customizableProductComponents(
                        where: { isArchived: { _eq: false } }
                        order_by: { position: desc_nulls_last }
                     ) {
                        id
                        options
                        selectedOptions {
                           productOption {
                              id
                              label
                              quantity
                              modifier {
                                 id
                                 name
                                 categories(
                                    where: { isVisible: { _eq: true } }
                                 ) {
                                    name
                                    isRequired
                                    type
                                    limits
                                    options(
                                       where: { isVisible: { _eq: true } }
                                    ) {
                                       id
                                       name
                                       price
                                       discount
                                       quantity
                                       image
                                       isActive
                                       simpleRecipeYieldId
                                       sachetItemId
                                       ingredientSachetId
                                       cartItem
                                    }
                                 }
                              }
                           }
                           price
                           discount
                           comboCartItem
                        }
                        linkedProduct {
                           id
                           name
                           type
                           assets
                        }
                     }
                  }
               }
            }
         }
      `,
   },
   CATEGORIES: {
      LIST: gql`
         query categories(
            $subscriptionId: Int_comparison_exp
            $subscriptionOccurenceId: Int_comparison_exp
         ) {
            categories: productCategories(
               where: {
                  subscriptionOccurenceProducts: {
                     _or: [
                        { subscriptionId: $subscriptionId }
                        { subscriptionOccurenceId: $subscriptionOccurenceId }
                     ]
                     isVisible: { _eq: true }
                  }
               }
            ) {
               name
               productsAggregate: subscriptionOccurenceProducts_aggregate(
                  where: {
                     _or: [
                        { subscriptionId: $subscriptionId }
                        { subscriptionOccurenceId: $subscriptionOccurenceId }
                     ]
                  }
               ) {
                  aggregate {
                     count
                  }
                  nodes {
                     id
                     cartItem
                     addOnLabel
                     addOnPrice
                     isAvailable
                     isSingleSelect
                     productOption {
                        id
                        label
                        simpleRecipeYield {
                           yield
                           simpleRecipe {
                              id
                              type
                           }
                        }
                        product {
                           name
                           assets
                           additionalText
                        }
                     }
                  }
               }
            }
         }
      `,
   },
   SUBSCRIPTION: {
      ZIPCODE: {
         LIST: gql`
            query zipcodes(
               $where: subscription_subscription_zipcode_bool_exp = {}
            ) {
               zipcodes: subscription_subscription_zipcode(where: $where) {
                  zipcode
                  deliveryTime
                  deliveryPrice
                  isPickupActive
                  isDeliveryActive
                  defaultAutoSelectFulfillmentMode
                  pickupOptionId: subscriptionPickupOptionId
                  pickupOption: subscriptionPickupOption {
                     id
                     time
                     address
                  }
               }
            }
         `,
      },
   },
   FULFILLMENT: {
      ONDEMAND: {
         PICKUP: gql`
            subscription OndemandPickup($brandId: Int!) {
               onDemandPickup: fulfillmentTypes(
                  where: {
                     isActive: { _eq: true }
                     value: { _eq: "ONDEMAND_PICKUP" }
                  }
               ) {
                  recurrences(
                     where: {
                        isActive: { _eq: true }
                        brands: {
                           _and: {
                              brandId: { _eq: $brandId }
                              isActive: { _eq: true }
                           }
                        }
                     }
                  ) {
                     id
                     type
                     rrule
                     timeSlots(where: { isActive: { _eq: true } }) {
                        id
                        to
                        from
                        pickUpPrepTime
                     }
                  }
               }
            }
         `,
         DELIVERY: gql`
            subscription OnDemandDelivery($distance: numeric!, $brandId: Int!) {
               onDemandDelivery: fulfillmentTypes(
                  where: {
                     isActive: { _eq: true }
                     value: { _eq: "ONDEMAND_DELIVERY" }
                  }
               ) {
                  recurrences(
                     where: {
                        isActive: { _eq: true }
                        brands: {
                           _and: {
                              brandId: { _eq: $brandId }
                              isActive: { _eq: true }
                           }
                        }
                     }
                  ) {
                     id
                     type
                     rrule
                     timeSlots(where: { isActive: { _eq: true } }) {
                        id
                        to
                        from
                        mileRanges(
                           where: {
                              isActive: { _eq: true }
                              from: { _lte: $distance }
                              to: { _gte: $distance }
                           }
                        ) {
                           id
                           to
                           from
                           isActive
                           prepTime
                           charges {
                              id
                              charge
                              orderValueFrom
                              orderValueUpto
                           }
                        }
                     }
                  }
               }
            }
         `,
      },
      PREORDER: {
         PICKUP: gql`
            subscription PreOrderPickup($brandId: Int!) {
               preOrderPickup: fulfillmentTypes(
                  where: {
                     isActive: { _eq: true }
                     value: { _eq: "PREORDER_PICKUP" }
                  }
               ) {
                  recurrences(
                     where: {
                        isActive: { _eq: true }
                        brands: {
                           _and: {
                              brandId: { _eq: $brandId }
                              isActive: { _eq: true }
                           }
                        }
                     }
                  ) {
                     id
                     type
                     rrule
                     timeSlots(where: { isActive: { _eq: true } }) {
                        id
                        to
                        from
                        pickUpLeadTime
                     }
                  }
               }
            }
         `,
         DELIVERY: gql`
            subscription PreOrderDelivery($distance: numeric!, $brandId: Int!) {
               preOrderDelivery: fulfillmentTypes(
                  where: {
                     isActive: { _eq: true }
                     value: { _eq: "PREORDER_DELIVERY" }
                  }
               ) {
                  recurrences(
                     where: {
                        isActive: { _eq: true }
                        brands: {
                           _and: {
                              brandId: { _eq: $brandId }
                              isActive: { _eq: true }
                           }
                        }
                     }
                  ) {
                     id
                     type
                     rrule
                     timeSlots(where: { isActive: { _eq: true } }) {
                        id
                        to
                        from
                        mileRanges(
                           where: {
                              isActive: { _eq: true }
                              from: { _lte: $distance }
                              to: { _gte: $distance }
                           }
                        ) {
                           id
                           to
                           from
                           isActive
                           leadTime
                           charges {
                              id
                              charge
                              orderValueFrom
                              orderValueUpto
                           }
                        }
                     }
                  }
               }
            }
         `,
      },
   },
}
