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
               locationId
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
                  brand_brandSettings(
                     where: {
                        brandSetting: {
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
                     brandSetting {
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
            $_brandId: Int!
            $identifier: String_comparison_exp!
            $type: String_comparison_exp!
         ) {
            settings: brands_brand_brandSetting(
               where: {
                  brandId: { _eq: $brandId }
                  brandSetting: { identifier: $identifier, type: $type }
               }
            ) {
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
      query PRODUCTS_BY_CATEGORY($params: jsonb!) {
         onDemand_getMenuV2copy(args: { params: $params }) {
            data
            id
         }
      }
   `,
   PRODUCTS: {
      LIST: gql`
         query products($ids: [Int!]!, $params: jsonb!) {
            products(where: { isArchived: { _eq: false }, id: { _in: $ids } }) {
               id
               name
               type
               assets
               tags
               VegNonVegType
               additionalText
               description
               price: priceByLocation(args: { params: $params })
               discount: discountByLocation(args: { params: $params })
               isPublished: publishedByLocation(args: { params: $params })
               isPopupAllowed
               isAvailable: availabilityByLocation(args: { params: $params })
               defaultProductOptionId
               defaultCartItem: defaultCartItemByLocation(
                  args: { params: $params }
               )
               productionOptionSelectionStatement
               subCategory
               productOptions(
                  where: { isArchived: { _eq: false } }
                  order_by: { position: desc_nulls_last }
               ) {
                  id
                  position
                  type
                  label
                  price: priceByLocation(args: { params: $params })
                  discount: discountByLocation(args: { params: $params })
                  cartItem: cartItemByLocation(args: { params: $params })
                  isPublished: publishedByLocation(args: { params: $params })
                  isAvailable: availabilityByLocation(args: { params: $params })
               }
            }
         }
      `,
      ONE: gql`
         subscription product($id: Int!, $params: jsonb!) {
            product(id: $id) {
               id
               name
               type
               additionalText
               description
               price: priceByLocation(args: { params: $params })
               discount: discountByLocation(args: { params: $params })
               isPublished: publishedByLocation(args: { params: $params })
               isAvailable: availabilityByLocation(args: { params: $params })
               defaultProductOptionId
               defaultCartItem: defaultCartItemByLocation(
                  args: { params: $params }
               )
               productOptions(
                  where: { isArchived: { _eq: false } }
                  order_by: { position: desc_nulls_last }
               ) {
                  id
                  label
                  type
                  price: priceByLocation(args: { params: $params })
                  discount: discountByLocation(args: { params: $params })
                  cartItem: cartItemByLocation(args: { params: $params })
                  isPublished: publishedByLocation(args: { params: $params })
                  isAvailable: availabilityByLocation(args: { params: $params })
                  additionalModifiers(where: { isActive: { _eq: true } }) {
                     type
                     label
                     linkedToModifierCategoryOptionId
                     productOptionId
                     modifierId
                     modifier {
                        id
                        name
                        categories(
                           where: { isVisible: { _eq: true } }
                           order_by: { position: desc_nulls_last }
                        ) {
                           id
                           name
                           isRequired
                           type
                           limits
                           options(
                              where: { isVisible: { _eq: true } }
                              order_by: { position: desc_nulls_last }
                           ) {
                              id
                              name
                              price: priceByLocation(args: { params: $params })
                              discount: discountByLocation(args: { params: $params })
                              quantity
                              image
                              isActive
                              additionalModifierTemplateId
                              isAdditionalModifierRequired
                              additionalModifierTemplate {
                                 id
                                 name
                                 categories(
                                    where: { isVisible: { _eq: true } }
                                    order_by: { position: desc_nulls_last }
                                 ) {
                                    id
                                    name
                                    isRequired
                                    type
                                    limits
                                    options(
                                       where: { isVisible: { _eq: true } }
                                       order_by: { position: desc_nulls_last }
                                    ) {
                                       id
                                       name
                                       price: priceByLocation(
                                          args: { params: $params }
                                       )
                                       discount: discountByLocation(
                                          args: { params: $params }
                                       )
                                       quantity
                                       image
                                       isActive
                                       additionalModifierTemplateId
                                       isAdditionalModifierRequired
                                       sachetItemId
                                       ingredientSachetId
                                       cartItem: cartItemByLocation(
                                          args: { params: $params }
                                       )
                                       additionalModifierTemplate {
                                          id
                                          name
                                          categories(
                                             where: { isVisible: { _eq: true } }
                                             order_by: { position: desc_nulls_last }
                                          ) {
                                             id
                                             name
                                             isRequired
                                             type
                                             limits
                                             options(
                                                where: { isVisible: { _eq: true } }
                                                order_by: {
                                                   position: desc_nulls_last
                                                }
                                             ) {
                                                id
                                                name
                                                price: priceByLocation(
                                                   args: { params: $params }
                                                )
                                                discount: discountByLocation(
                                                   args: { params: $params }
                                                )
                                                quantity
                                                image
                                                isActive
                                                additionalModifierTemplateId
                                                isAdditionalModifierRequired
                                                sachetItemId
                                                ingredientSachetId
                                                cartItem: cartItemByLocation(
                                                   args: { params: $params }
                                                )
                                                additionalModifierTemplate {
                                                   categories {
                                                      options {
                                                         name
                                                      }
                                                   }
                                                }
                                             }
                                          }
                                       }
                                    }
                                 }
                              }
                              sachetItemId
                              ingredientSachetId
                              cartItem: cartItemByLocation(args: { params: $params })
                           }
                        }
                     }
                  }
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
                           price: priceByLocation(args: { params: $params })
                           discount: discountByLocation(
                              args: { params: $params }
                           )
                           image
                           isActive
                           cartItem: cartItemByLocation(
                              args: { params: $params }
                           )
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

export const GET_BRAND_LOCATION = gql`
   query GET_BRAND_LOCATION($where: brands_brand_location_bool_exp!) {
      brandLocations: brands_brand_location(where: $where) {
         id
         brandMenuId
         posist_customer_key
      }
   }
`
