import gql from 'graphql-tag'

export const QUERIES = {
   CART: {
      ONE: gql`
         subscription cart($id: Int!) {
            cart(id: $id) {
               id
               status
               totalPrice
               paymentStatus
               stripeInvoiceId
               stripeCustomerId
               transactionId
               customerKeycloakId
               transactionRemarkHistory: paymentHistories(
                  where: { type: { _eq: "PAYMENT_INTENT" } }
                  order_by: { created_at: desc }
               ) {
                  id
                  details: transactionRemark
               }
               stripeInvoiceDetails
               stripeInvoiceHistory: paymentHistories(
                  where: { type: { _eq: "INVOICE" } }
                  order_by: { created_at: desc }
               ) {
                  id
                  details: stripeInvoiceDetails
               }
            }
         }
      `,
   },
   ORDER: {
      SOURCE: gql`
         query orderSource($orderId: oid!) {
            orderSource: order_thirdPartyOrder(
               where: { order: { id: { _eq: $orderId } } }
            ) {
               id
               thirdPartyCompany {
                  title
                  imageUrl
               }
            }
         }
      `,
      DETAILS: gql`
         subscription order($id: oid!) {
            order(id: $id) {
               id
               tax
               discount
               itemTotal
               isAccepted
               isRejected
               created_at
               deliveryPrice
               fulfillmentType
               thirdPartyOrderId
               thirdPartyOrder {
                  id
                  thirdPartyOrderId
                  products: parsedData(path: "items")
                  emailContent: parsedData(path: "HtmlDocument")
               }
               cartId
               cart {
                  id
                  status
                  source
                  isTest
                  address
                  paymentStatus
                  transactionId
                  fulfillmentInfo
                  customer: customerInfo
                  orderStatus {
                     title
                  }
                  subscriptionOccurence {
                     id
                     itemCount: subscriptionItemCount {
                        id
                        count
                     }
                     serving: subscriptionServing {
                        id
                        size: servingSize
                     }
                     title: subscriptionTitle {
                        id
                        title
                     }
                  }
                  assembledProducts: cartItems_aggregate(
                     where: {
                        levelType: { _eq: "orderItem" }
                        status: { _eq: "PACKED" }
                     }
                  ) {
                     aggregate {
                        count
                     }
                  }
                  packedProducts: cartItems_aggregate(
                     where: {
                        levelType: { _eq: "orderItem" }
                        status: { _in: ["READY", "PACKED"] }
                     }
                  ) {
                     aggregate {
                        count
                     }
                  }
                  totalProducts: cartItems_aggregate(
                     where: { levelType: { _eq: "orderItem" } }
                  ) {
                     aggregate {
                        count
                     }
                  }
               }
            }
         }
      `,
      PRODUCTS: gql`
         subscription products($where: order_cartItem_bool_exp = {}) {
            products: cartItems(where: $where, order_by: { created_at: desc }) {
               id
               status
               isAddOn
               displayName
               displayImage
               operationConfigId
               operationConfig {
                  id
                  labelTemplateId
                  stationId
               }
               productOption {
                  label
               }
               productOptionType
               totalSachets: childs_aggregate {
                  aggregate {
                     count
                  }
               }
               packedSachets: childs_aggregate(
                  where: { status: { _in: ["READY", "PACKED"] } }
               ) {
                  aggregate {
                     count
                  }
               }
               assembledSachets: childs_aggregate(
                  where: { status: { _eq: "PACKED" } }
               ) {
                  aggregate {
                     count
                  }
               }
            }
         }
      `,
      DELIVERY_INFO: gql`
         subscription order($id: oid!) {
            order(id: $id) {
               id
               deliveryInfo
               deliveryPartnershipId
            }
         }
      `,
      STATUSES: gql`
         subscription orderStatuses {
            order_orderStatusEnum(order_by: { index: asc }) {
               value
            }
         }
      `,
      PRODUCT: gql`
         subscription product($id: Int!) {
            product: cartItem(id: $id) {
               id
               id
               cart {
                  id
                  order {
                     id
                     isAccepted
                     isRejected
                  }
               }
               position
               stationId
               isModifier
               status
               displayName
               displayUnit
               processingName
               displayBulkDensity
               displayUnitQuantity
               supplierItemId
               supplierItem {
                  id
                  supplierItemName
                  supplierId
                  supplier {
                     id
                     name
                  }
               }
               operationConfigId
               operationConfig {
                  id
                  stationId
                  station {
                     id
                     name
                  }
                  labelTemplateId
                  labelTemplate {
                     id
                     name
                  }
                  packagingId
                  packaging {
                     id
                     name
                     assets
                  }
               }
            }
         }
      `,
      SACHET: {
         MULTIPLE: gql`
            subscription sachets($where: order_cartItem_bool_exp = {}) {
               sachets: cartItems(
                  where: $where
                  order_by: { position: desc, created_at: desc }
               ) {
                  id
                  cart {
                     id
                     order {
                        id
                        isAccepted
                        isRejected
                     }
                  }
                  position
                  stationId
                  isModifier
                  status
                  displayName
                  displayUnit
                  processingName
                  displayBulkDensity
                  displayUnitQuantity
                  supplierItemId
                  supplierItem {
                     id
                     supplierItemName
                  }
                  operationConfigId
                  operationConfig {
                     id
                     stationId
                     station {
                        id
                        name
                     }
                     labelTemplateId
                     labelTemplate {
                        id
                        name
                     }
                     packagingId
                     packaging {
                        id
                        name
                        assets
                     }
                  }
               }
            }
         `,
      },
   },
   ORDERS: {
      LIST: gql`
         subscription orders(
            $limit: Int
            $offset: Int
            $where: order_order_bool_exp = {}
         ) {
            orders(
               limit: $limit
               offset: $offset
               order_by: { created_at: desc }
               where: $where
            ) {
               id
               tax
               discount
               itemTotal
               amountPaid
               created_at
               isAccepted
               isRejected
               deliveryPrice
               fulfillmentType
               thirdPartyOrderId
               thirdPartyOrder {
                  id
                  source
                  thirdPartyOrderId
                  products: parsedData(path: "items")
               }
               cartId
               cart {
                  id
                  status
                  orderStatus {
                     title
                  }
                  isTest
                  source
                  address
                  paymentId
                  transactionId
                  paymentStatus
                  fulfillmentInfo
                  customer: customerInfo
                  subscriptionOccurence {
                     id
                     itemCount: subscriptionItemCount {
                        id
                        count
                     }
                     serving: subscriptionServing {
                        id
                        size: servingSize
                     }
                     title: subscriptionTitle {
                        id
                        title
                     }
                  }
                  brand {
                     id
                     onDemandName: onDemandSettings(
                        where: {
                           onDemandSetting: {
                              identifier: { _eq: "Brand Name" }
                           }
                        }
                     ) {
                        name: value(path: "name")
                     }
                     onDemandLogo: onDemandSettings(
                        where: {
                           onDemandSetting: {
                              identifier: { _eq: "Brand Logo" }
                           }
                        }
                     ) {
                        url: value(path: "url")
                     }
                     subscriptionSettings: subscriptionStoreSettings(
                        where: {
                           subscriptionStoreSetting: {
                              identifier: { _eq: "theme-brand" }
                           }
                        }
                     ) {
                        name: value(path: "name")
                        logo: value(path: "logo.url")
                     }
                  }
                  cartItems_aggregate(
                     where: { levelType: { _eq: "orderItem" } }
                  ) {
                     aggregate {
                        count
                     }
                     nodes {
                        id
                        status
                        displayName
                        displayImage
                        productOptionType
                        totalSachets: childs_aggregate {
                           aggregate {
                              count
                           }
                        }
                        packedSachets: childs_aggregate(
                           where: { status: { _in: ["READY", "PACKED"] } }
                        ) {
                           aggregate {
                              count
                           }
                        }
                        assembledSachets: childs_aggregate(
                           where: { status: { _eq: "PACKED" } }
                        ) {
                           aggregate {
                              count
                           }
                        }
                     }
                  }
               }
            }
         }
      `,
      AGGREGATE: {
         TOTAL: gql`
            subscription orders($where: order_order_bool_exp = {}) {
               orders: ordersAggregate(where: $where) {
                  aggregate {
                     count
                     sum {
                        amountPaid
                     }
                     avg {
                        amountPaid
                     }
                  }
               }
            }
         `,
         CANCELLED: gql`
            subscription orders {
               orders: ordersAggregate(where: { isRejected: { _eq: true } }) {
                  aggregate {
                     count
                     sum {
                        amountPaid
                     }
                     avg {
                        amountPaid
                     }
                  }
               }
            }
         `,
      },
   },
   DELIVERY: {
      SERVICE: gql`
         query service($id: Int!) {
            service: partnerships_deliveryPartnership_by_pk(id: $id) {
               id
               details: deliveryCompany {
                  id
                  name
                  assets
                  website
                  description
                  established
               }
            }
         }
      `,
      SERVICES: gql`
         query deliveryServices {
            deliveryServices(where: { isActive: { _eq: true } }) {
               id
               logo
               companyName
               isThirdParty
               partnershipId
            }
         }
      `,
   },
   NOTIFICATION: {
      LIST: gql`
         subscription displayNotifications {
            displayNotifications(
               order_by: { created_at: desc }
               where: { type: { app: { _eq: "Order" } } }
            ) {
               id
               content
               created_at
               updated_at
               type {
                  isGlobal
                  isLocal
                  playAudio
                  audioUrl
               }
            }
         }
      `,
      NEW: gql`
         subscription displayNotifications {
            displayNotifications(where: { type: { app: { _eq: "Order" } } }) {
               type {
                  audioUrl
               }
            }
         }
      `,
   },
   STATIONS: {
      ONE: gql`
         query station($id: Int!) {
            station(id: $id) {
               id
               name
            }
         }
      `,
      LIST: gql`
         subscription stations {
            stations {
               id
               title: name
            }
         }
      `,
      BY_USER: gql`
         subscription stations($email: String_comparison_exp!) {
            stations(where: { assignedUsers: { user: { email: $email } } }) {
               id
               name
               defaultKotPrinterId
               defaultKotPrinter {
                  name
                  state
                  printNodeId
               }
               defaultLabelPrinterId
               defaultLabelPrinter {
                  name
                  state
                  printNodeId
               }
               defaultScaleId
               defaultScale {
                  id
                  active
                  deviceNum
                  deviceName
               }
               attachedLabelPrinters {
                  printNodeId
                  labelPrinter {
                     name
                     state
                     printNodeId
                  }
               }
               attachedKotPrinters {
                  printNodeId
                  kotPrinter {
                     name
                     state
                     printNodeId
                  }
               }
               assignedScales {
                  id
                  active
                  deviceNum
                  deviceName
               }
            }
         }
      `,
   },
   PLANNED: {
      PRODUCTS: gql`
         subscription plannedProducts(
            $type: String_comparison_exp = {}
            $cart: order_cart_bool_exp = {}
         ) {
            plannedProducts: productsAggregate(
               where: { type: $type, cartItems: { cart: $cart } }
            ) {
               aggregate {
                  count
               }
               nodes {
                  id
                  name
                  cartItems_aggregate(where: { cart: $cart }) {
                     aggregate {
                        count
                     }
                     nodes {
                        id
                        status
                        cart {
                           id
                           orderId
                        }
                     }
                  }
               }
            }
         }
      `,
      PRODUCT_OPTIONS: gql`
         subscription productOptions(
            $type: String_comparison_exp = {}
            $cart: order_cart_bool_exp = {}
         ) {
            productOptions: products_productOptionView_aggregate(
               where: {
                  type: $type
                  cartItems: { level: { _eq: 2 }, cart: $cart }
               }
            ) {
               aggregate {
                  count
               }
               nodes {
                  id
                  displayName
                  cartItems_aggregate(
                     where: { level: { _eq: 2 }, cart: $cart }
                  ) {
                     aggregate {
                        count
                     }
                     nodes {
                        id
                        status
                        cart {
                           id
                           orderId
                        }
                     }
                  }
               }
            }
         }
      `,
      SIMPLE_RECIPES: gql`
         subscription simpleRecipes($cart: order_cart_bool_exp = {}) {
            simpleRecipes: simpleRecipesAggregate(
               where: {
                  simpleRecipeYields: {
                     simpleRecipeCartItems: { level: { _eq: 3 }, cart: $cart }
                  }
               }
            ) {
               aggregate {
                  count
               }
               nodes {
                  id
                  name
                  simpleRecipeYields_aggregate(
                     where: {
                        simpleRecipeCartItems: {
                           level: { _eq: 3 }
                           cart: $cart
                        }
                     }
                  ) {
                     aggregate {
                        count
                     }
                     nodes {
                        id
                        serving
                        simpleRecipeCartItems_aggregate(
                           where: { level: { _eq: 3 }, cart: $cart }
                        ) {
                           aggregate {
                              count
                              sum {
                                 displayServing
                                 displayUnitQuantity
                              }
                           }
                           nodes {
                              id
                              status
                              displayName
                              cart {
                                 id
                                 orderId
                              }
                           }
                        }
                     }
                  }
               }
            }
         }
      `,
      SUB_RECIPES: gql`
         subscription subRecipes($cart: order_cart_bool_exp = {}) {
            subRecipes: simpleRecipesAggregate(
               where: {
                  simpleRecipeYields: {
                     subRecipeCartItems: { level: { _gte: 4 }, cart: $cart }
                  }
               }
            ) {
               aggregate {
                  count
               }
               nodes {
                  id
                  name
                  simpleRecipeYields_aggregate(
                     where: {
                        subRecipeCartItems: { level: { _gte: 4 }, cart: $cart }
                     }
                  ) {
                     aggregate {
                        count
                     }
                     nodes {
                        id
                        serving
                        subRecipeCartItems_aggregate(
                           where: { level: { _gte: 4 }, cart: $cart }
                        ) {
                           aggregate {
                              count
                              sum {
                                 displayServing
                                 displayUnitQuantity
                              }
                           }
                           nodes {
                              id
                              status
                              displayName
                              cart {
                                 id
                                 orderId
                              }
                           }
                        }
                     }
                  }
               }
            }
         }
      `,
      INGREDIENTS: gql`
         subscription ingredients($cart: order_cart_bool_exp = {}) {
            ingredients: ingredientsAggregate(
               where: {
                  ingredientSachetViews: {
                     cartItems: {
                        level: { _eq: 4 }
                        orderMode: {
                           _in: ["assembledTogether", "assembledSeparately"]
                        }
                        cart: $cart
                     }
                  }
               }
            ) {
               aggregate {
                  count
               }
               nodes {
                  id
                  name
                  cartItems_aggregate(
                     where: {
                        level: { _eq: 4 }
                        orderMode: {
                           _in: ["assembledTogether", "assembledSeparately"]
                        }
                        cart: $cart
                     }
                  ) {
                     aggregate {
                        sum {
                           displayUnitQuantity
                        }
                     }
                  }
                  ingredientProcessings_aggregate(
                     where: {
                        ingredientSachetViews: {
                           cartItems: {
                              level: { _eq: 4 }
                              orderMode: {
                                 _in: [
                                    "assembledTogether"
                                    "assembledSeparately"
                                 ]
                              }
                              cart: $cart
                           }
                        }
                     }
                  ) {
                     aggregate {
                        count
                     }
                     nodes {
                        id
                        processingName
                        cartItems_aggregate(
                           where: {
                              level: { _eq: 4 }
                              orderMode: {
                                 _in: [
                                    "assembledTogether"
                                    "assembledSeparately"
                                 ]
                              }
                              cart: $cart
                           }
                        ) {
                           aggregate {
                              count
                              sum {
                                 displayUnitQuantity
                              }
                           }
                        }
                        ingredientSachets_aggregate(
                           where: {
                              cartItems: {
                                 level: { _eq: 4 }
                                 orderMode: {
                                    _in: [
                                       "assembledTogether"
                                       "assembledSeparately"
                                    ]
                                 }
                                 cart: $cart
                              }
                           }
                        ) {
                           aggregate {
                              count
                           }
                           nodes {
                              id
                              unit
                              quantity
                              cartItems_aggregate(
                                 where: {
                                    level: { _eq: 4 }
                                    orderMode: {
                                       _in: [
                                          "assembledTogether"
                                          "assembledSeparately"
                                       ]
                                    }
                                    cart: $cart
                                 }
                              ) {
                                 aggregate {
                                    count
                                    sum {
                                       displayUnitQuantity
                                    }
                                 }
                                 nodes {
                                    id
                                    cart {
                                       id
                                       orderId
                                    }
                                    product {
                                       id
                                       name
                                    }
                                    displayName
                                    status
                                 }
                              }
                           }
                        }
                     }
                  }
               }
            }
         }
      `,
      SACHET_ITEMS: gql`
         subscription sachetItems($cart: order_cart_bool_exp) {
            sachetItems: inventory_sachetItemView_aggregate(
               where: { cartItems: { level: { _eq: 4 }, cart: $cart } }
            ) {
               aggregate {
                  count
               }
               nodes {
                  id
                  processingName
                  cartItems_aggregate(
                     where: { level: { _eq: 4 }, cart: $cart }
                  ) {
                     aggregate {
                        count
                        sum {
                           displayUnitQuantity
                        }
                     }
                     nodes {
                        id
                        status
                        product {
                           name
                        }
                        cart {
                           id
                           orderId
                        }
                        displayName
                        displayUnitQuantity
                     }
                  }
               }
            }
         }
      `,
   },
   SETTINGS: {
      LIST: gql`
         subscription settings {
            settings: settings_appSettings {
               id
               app
               type
               identifier
               value
            }
         }
      `,
   },
   LABEL_TEMPLATE: {
      ONE: gql`
         query labelTemplate($id: Int!) {
            labelTemplate(id: $id) {
               id
               name
            }
         }
      `,
   },
   PRODUCT_OPTION_TYPES: gql`
      query productOptionTypes {
         productOptionTypes {
            title
         }
      }
   `,
   PRODUCT_TYPES: gql`
      query productTypes {
         productTypes: products_productType {
            title
            displayName
         }
      }
   `,
}

export const DEVICES = {
   PRINTERS: gql`
      query printers($type: String_comparison_exp!) {
         printers(where: { printerType: $type }) {
            name
            printNodeId
         }
      }
   `,
}

export const QUERIES2 = {
   ORDERS_AGGREGATE: gql`
      subscription ordersAggregate {
         ordersAggregate: order_ordersAggregate {
            title
            value
            count: totalOrders
            sum: totalOrderSum
            avg: totalOrderAverage
         }
      }
   `,
}

export const CUSTOMER_PAYMENT_METHODS = gql`
   query customer($keycloakId: String!) {
      customer(keycloakId: $keycloakId) {
         id
         platform_customer {
            payment_methods: stripePaymentMethods {
               brand
               last4
               funding
               expYear
               expMonth
               country
               name: cardHolderName
               id: stripePaymentMethodId
            }
         }
      }
   }
`
