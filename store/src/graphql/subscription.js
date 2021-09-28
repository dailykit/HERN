import { gql } from '@apollo/client'

export const EXPERIENCES = gql`
   subscription EXPERIENCES(
      $where: experiences_experience_experienceCategory_bool_exp!
      $params: jsonb!
   ) {
      experiences_experienceCategory {
         title
         description
         assets
         experience_experienceCategories(where: $where) {
            experience {
               assets
               description
               id
               title
               isSaved(args: { params: $params })
               customer_savedEntities {
                  id
                  experienceId
                  productId
                  simpleRecipeId
               }
               experienceClasses {
                  id
                  isActive
                  isBooked
                  startTimeStamp
                  duration
                  experienceClassExpert {
                     assets
                     description
                     email
                     firstName
                     id
                     lastName
                  }
                  privateExperienceClassType {
                     minimumBookingAmount
                     minimumParticipant
                     maximumParticipant
                  }
                  publicExperienceClassType {
                     minimumBookingAmount
                     minimumParticipant
                     maximumParticipant
                  }
               }
            }
         }
      }
   }
`

export const CATEGORY_EXPERIENCE = gql`
   subscription CATEGORY_EXPERIENCE($tags: [Int!]!, $params: jsonb!) {
      experiences_experienceCategory(
         where: {
            experience_experienceCategories: {
               experience: {
                  experience_experienceTags: {
                     experienceTag: { id: { _in: $tags } }
                  }
               }
            }
         }
      ) {
         title
         description
         assets
         experience_experienceCategories {
            experience {
               assets
               description
               id
               title
               isSaved(args: { params: $params })
               customer_savedEntities {
                  id
                  experienceId
                  productId
                  simpleRecipeId
               }
               experienceClasses {
                  id
                  isActive
                  isBooked
                  startTimeStamp
                  duration

                  experienceClassExpert {
                     assets
                     description
                     email
                     firstName
                     id
                     lastName
                  }
                  privateExperienceClassType {
                     minimumBookingAmount
                     minimumParticipant
                     maximumParticipant
                  }
                  publicExperienceClassType {
                     minimumBookingAmount
                     minimumParticipant
                     maximumParticipant
                  }
               }
            }
         }
      }
   }
`

export const EXPERIENCE = gql`
   subscription EXPERIENCE($experienceId: Int!) {
      experiences_experience_experienceCategory(
         where: { experienceId: { _eq: $experienceId } }
      ) {
         experienceCategoryTitle
         experience {
            assets
            description
            id
            title
            metaData
            experience_headers {
               id
               title
               content
               position
            }
            experienceClasses {
               duration
               startTimeStamp
               isActive
               isBooked
               experienceClassExpert {
                  assets
                  description
                  email
                  firstName
                  id
                  lastName
                  experience_experts_aggregate {
                     aggregate {
                        count
                     }
                  }
               }
            }
         }
      }
   }
`

export const EXPERT_BY_CATEGORY = gql`
   subscription EXPERT_BY_CATEGORY(
      $where: experiences_experienceCategory_bool_exp!
   ) {
      experiences_experienceCategory(where: $where) {
         title
         description
         assets
         experts {
            expert {
               id
               firstName
               lastName
               email
               description
               assets
            }
            experienceCategoryTitle
         }
      }
   }
`

export const GET_EXPERIENCE_CATEGORIES = gql`
   subscription GET_EXPERIENCE_CATEGORIES {
      experiences_experienceCategory {
         title
         description
         assets
      }
   }
`

export const GET_BRAND_INFO = gql`
   subscription GET_BRAND_INFO($domain: String!) {
      brands(
         where: {
            _or: [{ domain: { _eq: $domain } }, { isDefault: { _eq: true } }]
         }
      ) {
         id
         domain
         isDefault
      }
   }
`

export const EXPERIENCE_TAGS = gql`
   subscription EXPERIENCE_TAGS {
      experiences_experienceTags {
         id
         title
      }
   }
`

export const CUSTOMER_SELECTED_TAGS = gql`
   subscription CUSTOMER_SELECTED_TAGS($keycloakId: String!) {
      crm_customer_experienceTags(where: { keycloakId: { _eq: $keycloakId } }) {
         keycloakId
         tags
      }
   }
`

export const CART_INFO = gql`
   subscription CART_INFO($keycloakId: String!, $params: jsonb!) {
      carts(
         where: {
            customerKeycloakId: { _eq: $keycloakId }
            parentCartId: { _is_null: true }
            experienceClass: {
               experienceBookingId: { _is_null: true }
               isBooked: { _eq: false }
            }
         }
      ) {
         id
         customerKeycloakId
         parentCartId
         isHostParticipant
         totalParticipants
         totalKit(args: { params: $params })
         totalKitPrice(args: { params: $params })
         toPayByParent
         experienceClassId
         experienceClass {
            experienceId
            startTimeStamp
            duration
            experience {
               title
               assets
            }
         }
         childCarts {
            id
            customerKeycloakId
            parentCartId
            toPayByParent
            experienceClassId
            address
            isHostCart(args: { params: $params })
            cartItems {
               cartId
               id
               experienceClassId
               experienceClassTypeId
               productId
               productOptionId
               product {
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
                  productOptions(
                     where: { isArchived: { _eq: false } }
                     order_by: { position: desc_nulls_last }
                  ) {
                     id
                     position
                     type
                     label
                     price
                     discount
                     cartItem
                     productId
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
                     simpleRecipeYield {
                        quantity
                        serving
                        unit
                        yield
                        cost
                        allergens
                        nutritionalInfo
                        simpleRecipe {
                           assets
                           author
                           cookingTime
                           cuisine
                           description
                           image
                           id
                           name
                           showIngredients
                           showIngredientsQuantity
                           showProcedures
                           type
                           simpleRecipeIngredients {
                              id
                              processingId
                              ingredient {
                                 assets
                                 category
                                 createdAt
                                 id
                                 image
                                 name
                                 isValid
                              }
                           }
                        }
                     }
                  }
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
                           cartItem
                           productId
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
                           cartItem
                           productId
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
                                 cartItem
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
         }
         cartItems {
            cartId
            id
            experienceClassId
            experienceClassTypeId
            productId
         }
      }
   }
`

export const CART_SUBSCRIPTION = gql`
   subscription CART_SUBSCRIPTION($where: order_cart_bool_exp!) {
      carts(where: $where) {
         cartId: id
         experienceClassId
         experienceClassTypeId
         tax2(args: { params: { shareFor: "parent" } })
         tip
         address
         isHostParticipant
         totalParticipants
         totalKitPrice(args: { params: { shareFor: "parent" } })
         totalExperiencePrice(args: { params: { shareFor: "parent" } })
         totalKit(args: { params: { shareFor: "parent" } })
         totalPrice2(args: { params: { shareFor: "parent" } })
         subTotal2(args: { params: { shareFor: "parent" } })
         itemTotal2(args: { params: { shareFor: "parent" } })
         balancePayment
         toPayByParent
         paidAmount: amount
         paymentStatus
         deliveryPrice2(args: { params: { shareFor: "parent" } })
         billingDetails2(args: { params: { shareFor: "parent" } })
         fulfillmentInfo
         transactionId
         transactionRemark
         stripeInvoiceId
         stripeInvoiceDetails
         products: cartItemViews(where: { level: { _eq: 1 } }) {
            id
            isAddOn
            unitPrice
            addOnLabel
            addOnPrice
            isAutoAdded
            name: displayName
            image: displayImage
            subscriptionOccurenceProductId
            subscriptionOccurenceAddOnProductId
         }
         experienceClass {
            experinceClassId: id
            startTimeStamp
            duration
            isActive
            isBooked
            experience {
               assets
               description
               experienceId: id
               metaData
               ohyay_wsid
               title
               experience_products {
                  product {
                     productOptions {
                        cartItem
                     }
                  }
               }
            }
         }
         experienceClassType {
            experienceClassTypeId: id
            maximumParticipant
            minimumParticipant
            minimumBookingAmount
            priceRanges
            title
         }
         childCarts {
            id
            customerKeycloakId
            parentCartId
            isHostCart(args: { params: {} })
            experienceClassId
            experienceClassTypeId
            cartItems(
               where: {
                  productId: { _is_null: false }
                  productOptionId: { _is_null: false }
               }
            ) {
               id
               productOption {
                  cartItem
               }
            }
         }
         experienceBooking {
            id
            experienceBookingParticipants {
               id
               rsvp
               email
               cartId
            }
         }
      }
   }
`

export const EXPERIENCE_PRODUCT = gql`
   subscription EXPERIENCE_PRODUCT($experienceId: Int!) {
      products(
         where: {
            experience_products: { experienceId: { _eq: $experienceId } }
         }
      ) {
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
         productOptions(
            where: { isArchived: { _eq: false } }
            order_by: { position: desc_nulls_last }
         ) {
            id
            position
            type
            label
            price
            discount
            cartItem
            productId
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
            simpleRecipeYield {
               quantity
               serving
               unit
               yield
               cost
               allergens
               nutritionalInfo
               simpleRecipe {
                  assets
                  author
                  cookingTime
                  cuisine
                  description
                  image
                  id
                  name
                  showIngredients
                  showIngredientsQuantity
                  showProcedures
                  type
                  simpleRecipeIngredients {
                     id
                     processingId
                     ingredient {
                        assets
                        category
                        createdAt
                        id
                        image
                        name
                        isValid
                     }
                  }
               }
            }
         }
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
                  cartItem
                  productId
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
                  cartItem
                  productId
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
                        cartItem
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
`

export const EXPERIENCE_POLLS = gql`
   subscription EXPERIENCE_POLL($id: Int!) {
      experienceBooking(id: $id) {
         id
         cartId
         hostKeycloakId
         experienceClassId
         cutoffTime
         created_at
         isPublicUrlActive
         experienceBookingOptions {
            id
            experienceClass {
               id
               experienceId
               startTimeStamp
               duration
               isActive
               isBooked
               publicExperienceClassTypeId
               privateExperienceClassTypeId
               experience {
                  assets
                  description
                  id
                  title
                  experienceClasses {
                     id
                     isActive
                     isBooked
                     startTimeStamp
                     duration
                     experienceClassExpert {
                        assets
                        description
                        email
                        firstName
                        id
                        lastName
                     }
                     privateExperienceClassType {
                        minimumBookingAmount
                        minimumParticipant
                     }
                     publicExperienceClassType {
                        minimumBookingAmount
                        minimumParticipant
                     }
                  }
               }
            }
            voting: experienceBookingParticipantChoices_aggregate {
               aggregate {
                  count
               }
            }
            voters: experienceBookingParticipantChoices {
               participant: experienceBookingParticipant {
                  email
                  id
                  cartId
                  phone
                  keycloakId
                  isArchived
               }
            }
         }
         participants: experienceBookingParticipants {
            email
            id
            cartId
            keycloakId
            phone
            isArchived
            rsvp
         }
      }
   }
`
export const EXPERIENCE_BOOKING = gql`
   subscription EXPERIENCE_BOOKING($id: Int!) {
      experienceBooking(id: $id) {
         id
         cartId
         hostKeycloakId
         experienceClassId
         cutoffTime
         created_at
         isPublicUrlActive
         experienceClass {
            id
            experienceId
            startTimeStamp
            duration
            isActive
            isBooked
            experience {
               assets
               description
               id
               title
               experience_products {
                  product {
                     productOptions {
                        cartItem
                     }
                  }
               }
               experienceClasses {
                  id
                  isActive
                  isBooked
                  startTimeStamp
                  duration
                  experienceClassExpert {
                     assets
                     description
                     email
                     firstName
                     id
                     lastName
                  }
                  privateExperienceClassType {
                     minimumBookingAmount
                     minimumParticipant
                  }
                  publicExperienceClassType {
                     minimumBookingAmount
                     minimumParticipant
                  }
               }
            }
         }
         participants: experienceBookingParticipants {
            email
            id
            keycloakId
            phone
            isArchived
            rsvp
         }
         parentCart {
            id
            experienceClassId
            experienceClassTypeId
            childCarts(
               where: {
                  cartItems: {
                     productId: { _is_null: false }
                     productOptionId: { _is_null: false }
                  }
               }
            ) {
               cartItems(
                  where: {
                     productId: { _is_null: false }
                     productOptionId: { _is_null: false }
                  }
               ) {
                  id
                  productOption {
                     cartItem
                  }
               }
            }
         }
      }
   }
`

export const YOUR_BOOKINGS = gql`
   subscription YOUR_BOOKINGS($where: experiences_experienceBooking_bool_exp!) {
      experienceBookings(where: $where) {
         id
         cutoffTime
         created_at
         experienceClassId
         experienceClass {
            id
            startTimeStamp
            isActive
            isBooked
            duration
            experienceClassExpert {
               assets
               description
               email
               firstName
               id
               lastName
            }
            privateExperienceClassType {
               minimumBookingAmount
               minimumParticipant
            }
            publicExperienceClassType {
               minimumBookingAmount
               minimumParticipant
            }
            experience {
               id
               title
               assets
            }
         }
         parentCart {
            id
            totalPrice2(args: { params: { shareFor: "parent" } })
            balancePayment
            toPayByParent
            paidAmount: amount
            paymentStatus
            deliveryPrice2(args: { params: { shareFor: "parent" } })
            billingDetails2(args: { params: { shareFor: "parent" } })
         }
         experienceBookingOptions {
            id
            experienceClass {
               id
               startTimeStamp
               isActive
               isBooked
               duration
               experienceClassExpert {
                  assets
                  description
                  email
                  firstName
                  id
                  lastName
               }
               privateExperienceClassType {
                  minimumBookingAmount
                  minimumParticipant
               }
               publicExperienceClassType {
                  minimumBookingAmount
                  minimumParticipant
               }
               experience {
                  id
                  title
                  assets
               }
            }
            voting: experienceBookingParticipantChoices_aggregate {
               aggregate {
                  count
               }
            }
         }
         participants: experienceBookingParticipants {
            email
            id
            keycloakId
            phone
            isArchived
            rsvp
         }
      }
   }
`

export const MANAGE_PARTICIPANTS = gql`
   subscription MANAGE_PARTICIPANTS(
      $experienceBookingId: Int!
      $paramsForParent: jsonb!
      $paramsForChild: jsonb!
   ) {
      experienceBookingParticipants(
         where: {
            experienceBookingId: { _eq: $experienceBookingId }
            cartId: { _is_null: false }
         }
      ) {
         id
         phone
         rsvp
         isArchived
         keycloakId
         cartId
         email
         childCart {
            address
            totalKit(args: { params: $paramsForChild })
            totalPriceForParent: totalPrice2(args: { params: $paramsForParent })
            totalPriceForChild: totalPrice2(args: { params: $paramsForChild })
            toPayByParent
            totalExperiencePriceForParent: totalExperiencePrice(
               args: { params: $paramsForParent }
            )
            totalExperiencePriceForChild: totalExperiencePrice(
               args: { params: $paramsForChild }
            )
            itemTotalForParent: itemTotal2(args: { params: $paramsForParent })
            itemTotalForChild: itemTotal2(args: { params: $paramsForChild })
         }
      }
   }
`

export const CART_COUNT = gql`
   subscription MySubscription($where: order_cart_bool_exp = {}) {
      cartsAggregate(where: $where) {
         aggregate {
            count
         }
      }
   }
`

export const WISHLISTED_EXPERIENCES = gql`
   subscription WISHLISTED_EXPERIENCES(
      $where: experiences_experience_bool_exp!
      $params: jsonb!
   ) {
      experiences_experience(where: $where) {
         assets
         description
         id
         title
         isSaved(args: { params: $params })
         customer_savedEntities {
            id
            experienceId
            productId
            simpleRecipeId
         }
         experienceClasses {
            id
            isActive
            isBooked
            startTimeStamp
            duration
            experienceClassExpert {
               assets
               description
               email
               firstName
               id
               lastName
            }
            privateExperienceClassType {
               minimumBookingAmount
               minimumParticipant
               maximumParticipant
            }
            publicExperienceClassType {
               minimumBookingAmount
               minimumParticipant
               maximumParticipant
            }
         }
      }
   }
`

export const CUSTOMER_DETAILS = gql`
   subscription CUSTOMER_DETAILS($keycloakId: String!) {
      customer(keycloakId: $keycloakId) {
         id
         keycloakId
         email
         platform_customer: platform_customer {
            email
            firstName
            lastName
            keycloakId
            phoneNumber
            paymentCustomerId
            addresses: customerAddresses(order_by: { created_at: desc }) {
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
            }
            paymentMethods: customerPaymentMethods {
               brand
               last4
               country
               expMonth
               expYear
               funding
               keycloakId
               cardHolderName
               paymentMethodId
            }
         }
         brandCustomers {
            id
            keycloakId
         }
      }
   }
`
