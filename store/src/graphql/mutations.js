import gql from 'graphql-tag'

export const MUTATIONS = {
   CUSTOMER: {
      UPDATE: gql`
         mutation updateCustomer(
            $keycloakId: String!
            $_set: crm_customer_set_input!
         ) {
            updateCustomer(
               pk_columns: { keycloakId: $keycloakId }
               _set: $_set
            ) {
               id
            }
         }
      `,
      CREATE: gql`
         mutation createCustomer($object: crm_customer_insert_input!) {
            createCustomer(object: $object) {
               id
               keycloakId
            }
         }
      `,
      ADDRESS: {
         CREATE: gql`
            mutation createCustomerAddress(
               $object: platform_customerAddress_insert_input!
            ) {
               createCustomerAddress: insert_platform_customerAddress_one(
                  object: $object
               ) {
                  id
               }
            }
         `,
      },
   },
   CUSTOMER_REFERRAL: {
      UPDATE: gql`
         mutation UpdateCustomerReferral(
            $brandId: Int!
            $keycloakId: String!
            $_set: crm_customerReferral_set_input
         ) {
            updateCustomerReferrals(
               where: {
                  brandId: { _eq: $brandId }
                  keycloakId: { _eq: $keycloakId }
               }
               _set: $_set
            ) {
               affected_rows
            }
         }
      `,
   },
   OCCURENCE: {
      CUSTOMER: {
         CREATE: {
            ONE: gql`
               mutation insertSubscriptionOccurenceCustomer(
                  $object: subscription_subscriptionOccurence_customer_insert_input!
               ) {
                  insertSubscriptionOccurenceCustomer: insert_subscription_subscriptionOccurence_customer_one(
                     object: $object
                     on_conflict: {
                        constraint: subscriptionOccurence_customer_pkey
                        update_columns: []
                     }
                  ) {
                     keycloakId
                     subscriptionOccurenceId
                  }
               }
            `,
            MULTIPLE: gql`
               mutation insertSubscriptionOccurenceCustomers(
                  $objects: [subscription_subscriptionOccurence_customer_insert_input!]!
               ) {
                  insertSubscriptionOccurenceCustomers: insert_subscription_subscriptionOccurence_customer(
                     objects: $objects
                  ) {
                     returning {
                        keycloakId
                        subscriptionOccurenceId
                     }
                  }
               }
            `,
         },
         UPDATE: gql`
            mutation updateOccurenceCustomer(
               $pk_columns: subscription_subscriptionOccurence_customer_pk_columns_input!
               $_set: subscription_subscriptionOccurence_customer_set_input!
            ) {
               updateOccurenceCustomer: update_subscription_subscriptionOccurence_customer_by_pk(
                  pk_columns: $pk_columns
                  _set: $_set
               ) {
                  isAuto
                  isSkipped
                  validStatus
               }
            }
         `,
         UPSERT: gql`
            mutation upsertOccurenceCustomerCart(
               $object: subscription_subscriptionOccurence_customer_insert_input!
            ) {
               upsertOccurenceCustomerCart: insert_subscription_subscriptionOccurence_customer_one(
                  on_conflict: {
                     constraint: subscriptionOccurence_customer_pkey
                     update_columns: [isSkipped]
                  }
                  object: $object
               ) {
                  isSkipped
               }
            }
         `,
      },
   },
   CART: {
      CREATE: gql`
         mutation createCart($object: order_cart_insert_input!) {
            createCart(object: $object) {
               id
               subscriptionOccurenceCustomer {
                  isSkipped
                  validStatus
               }
            }
         }
      `,
      UPDATE: gql`
         mutation updateCart(
            $id: Int!
            $_set: order_cart_set_input!
            $_inc: order_cart_inc_input = {}
         ) {
            updateCart(pk_columns: { id: $id }, _set: $_set, _inc: $_inc) {
               id
               itemTotal
               tax
               deliveryPrice
               discount
               totalPrice
            }
         }
      `,
      UPSERT: gql`
         mutation upsertCart(
            $object: order_cart_insert_input!
            $on_conflict: order_cart_on_conflict!
         ) {
            upsertCart: createCart(object: $object, on_conflict: $on_conflict) {
               id
               subscriptionOccurenceCustomer {
                  validStatus
                  isSkipped
               }
            }
         }
      `,
      DELETE: gql`
         mutation deleteCart($id: Int!) {
            deleteCart(id: $id) {
               id
            }
         }
      `,
   },
   CART_REWARDS: {
      CREATE: gql`
         mutation CartRewards($objects: [order_cart_rewards_insert_input!]!) {
            createCartRewards(objects: $objects) {
               returning {
                  id
               }
            }
         }
      `,
      DELETE: gql`
         mutation DeleteCartRewards($cartId: Int!) {
            deleteCartRewards(where: { cartId: { _eq: $cartId } }) {
               returning {
                  id
               }
            }
         }
      `,
   },
}

export const UPDATE_PLATFORM_CUSTOMER = gql`
   mutation updateCustomers(
      $keycloakId: String!
      $_set: platform_customer_set_input!
   ) {
      platform_updateCustomer: update_platform_customer_by_pk(
         pk_columns: { keycloakId: $keycloakId }
         _set: $_set
      ) {
         keycloakId
         defaultPaymentMethodId
      }
   }
`

export const CREATE_CUSTOMER_PAYMENT_METHOD = gql`
   mutation paymentMethod(
      $object: platform_customerPaymentMethod_insert_input!
   ) {
      paymentMethod: insert_platform_customerPaymentMethod_one(
         object: $object
      ) {
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
`

export const UPDATE_CART = gql`
   mutation updateCart(
      $id: Int!
      $_set: order_cart_set_input!
      $_inc: order_cart_inc_input = {}
   ) {
      updateCart(pk_columns: { id: $id }, _set: $_set, _inc: $_inc) {
         id
         paymentMethodId
         itemTotal
         tax
         deliveryPrice
         discount
         totalPrice
      }
   }
`

export const BRAND = {
   CUSTOMER: {
      CREATE: gql`
         mutation createBrandCustomer(
            $object: crm_brand_customer_insert_input!
         ) {
            createBrandCustomer(object: $object) {
               id
            }
         }
      `,
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
}

export const DELETE_CART_ITEM = gql`
   mutation deleteCartItem($id: Int!) {
      deleteCartItem(id: $id) {
         id
      }
   }
`

export const INSERT_CART_ITEM = gql`
   mutation createCartItem($object: order_cartItem_insert_input!) {
      createCartItem(object: $object) {
         id
         cartId
         name: displayName
         image: displayImage
         isAddOn
         unitPrice
         addOnLabel
         addOnPrice
         isAutoAdded
         subscriptionOccurenceProductId
         subscriptionOccurenceAddOnProductId
      }
   }
`

export const UPDATE_BRAND_CUSTOMER = gql`
   mutation updateBrandCustomer(
      $id: Int!
      $_set: crm_brand_customer_set_input = {}
   ) {
      updateBrandCustomer(pk_columns: { id: $id }, _set: $_set) {
         id
         subscriptionOnboardStatus
      }
   }
`

export const DELETE_CART = gql`
   mutation deleteCart($id: Int!) {
      deleteCart(id: $id) {
         id
         customerKeycloakId
         subscriptionOccurenceId
      }
   }
`

export const DELETE_OCCURENCE_CUSTOMER = gql`
   mutation deleteOccurenceCustomer(
      $brand_customerId: Int!
      $keycloakId: String!
      $subscriptionOccurenceId: Int!
   ) {
      delete_subscription_subscriptionOccurence_customer_by_pk(
         brand_customerId: $brand_customerId
         keycloakId: $keycloakId
         subscriptionOccurenceId: $subscriptionOccurenceId
      ) {
         cartId
      }
   }
`

export const FORGOT_PASSWORD = gql`
   mutation ForgotPassword(
      $type: String
      $email: String!
      $origin: String!
      $redirectUrl: String
   ) {
      forgotPassword: forgotPassword(
         type: $type
         email: $email
         origin: $origin
         redirectUrl: $redirectUrl
      ) {
         success
      }
   }
`

export const RESET_PASSWORD = gql`
   mutation ResetPassword($token: String!, $password: String!) {
      resetPassword: resetPassword(token: $token, password: $password) {
         success
         message
      }
   }
`

export const VERIFY_RESET_PASSWORD_TOKEN = gql`
   mutation verifyResetPasswordToken($token: String!) {
      verifyResetPasswordToken: verifyResetPasswordToken(token: $token) {
         success
         message
      }
   }
`

export const DELETE_CUSTOMER_ADDRESS = gql`
   mutation deleteAddress($id: uuid!) {
      deleteAddress: delete_platform_customerAddress_by_pk(id: $id) {
         id
      }
   }
`

export const DELETE_STRIPE_PAYMENT_METHOD = gql`
   mutation deletePaymentMethod($paymentMethodId: String!) {
      deletePaymentMethod: delete_platform_customerPaymentMethod_by_pk(
         paymentMethodId: $paymentMethodId
      ) {
         paymentMethodId
      }
   }
`

export const INSERT_PLATFORM_CUSTOMER = gql`
   mutation insertCustomer($object: platform_customer_insert_input!) {
      insertCustomer: insert_platform_customer_one(object: $object) {
         email
         password
      }
   }
`

export const INSERT_OTP_TRANSACTION = gql`
   mutation insertOtp($object: platform_otp_transaction_insert_input!) {
      insertOtp: insert_platform_otp_transaction_one(object: $object) {
         id
      }
   }
`

export const SEND_SMS = gql`
   mutation sendSMS($phone: String!, $message: String!) {
      sendSMS(phone: $phone, message: $message) {
         success
         message
      }
   }
`

export const RESEND_OTP = gql`
   mutation resend($id: uuid!) {
      resend: update_platform_otp_transaction_by_pk(
         pk_columns: { id: $id }
         _inc: { resendAttempts: 1 }
      ) {
         id
      }
   }
`

export const UPSERT_BRAND_CUSTOMER = gql`
   mutation createBrandCustomer($object: crm_brand_customer_insert_input!) {
      createBrandCustomer(
         object: $object
         on_conflict: {
            constraint: brand_customer_brandId_keycloakId_key
            update_columns: []
         }
      ) {
         id
      }
   }
`
export const CREATE_CART_ITEMS = gql`
   mutation CREATE_CART_ITEMS($objects: [order_cartItem_insert_input!]!) {
      createCartItems(objects: $objects) {
         returning {
            id
         }
      }
   }
`
export const DELETE_CART_ITEMS = gql`
   mutation DELETE_CART_ITEMS($where: order_cartItem_bool_exp!) {
      deleteCartItems(where: $where) {
         returning {
            id
            cart {
               id
               cartItems_aggregate {
                  aggregate {
                     count
                  }
               }
            }
         }
      }
   }
`
export const UPDATE_CART_ITEMS = gql`
   mutation UPDATE_CART_ITEMS(
      $where: order_cartItem_bool_exp!
      $_set: order_cartItem_set_input!
   ) {
      updateCartItems(where: $where, _set: $_set) {
         affected_rows
      }
   }
`

export const UPDATE_CART_PAYMENT = gql`
   mutation UPDATE_CART_PAYMENT(
      $id: Int!
      $_inc: order_cartPayment_inc_input = {}
      $_set: order_cartPayment_set_input!
   ) {
      updateCartPayment(pk_columns: { id: $id }, _inc: $_inc, _set: $_set) {
         cartId
         paymentStatus
         id
      }
   }
`
export const UPDATE_CART_PAYMENTS = gql`
   mutation UPDATE_CART_PAYMENTS(
      $where: order_cartPayment_bool_exp!
      $_set: order_cartPayment_set_input!
   ) {
      updateCartPayments(where: $where, _set: $_set) {
         returning {
            id
         }
      }
   }
`
export const CREATE_PRINT_JOB = gql`
   mutation CREATE_PRINT_JOB(
      $contentType: String!
      $printerId: Int!
      $source: String!
      $title: String!
      $url: String!
   ) {
      createPrintJob(
         contentType: $contentType
         printerId: $printerId
         source: $source
         title: $title
         url: $url
      ) {
         message
         success
      }
   }
`
export const SEND_MAIL = gql`
   mutation MyMutation($emailInput: EmailInput!) {
      sendEmail(emailInput: $emailInput) {
         success
      }
   }
`
