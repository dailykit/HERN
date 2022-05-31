import gql from 'graphql-tag'

export const ITEM_COUNT = gql`
   query itemCount($id: Int!, $zipcode: String, $isDemo: Boolean) {
      itemCount: subscription_subscriptionItemCount_by_pk(id: $id) {
         id
         valid: subscriptions(
            where: {
               isDemo: { _eq: $isDemo }
               availableZipcodes: { zipcode: { _eq: $zipcode } }
            }
            order_by: { position: desc_nulls_last }
         ) {
            id
            isDemo
            rrule
            leadTime
            zipcodes: availableZipcodes(where: { zipcode: { _eq: $zipcode } }) {
               deliveryPrice
               isDeliveryActive
               isPickupActive
            }
         }
         invalid: subscriptions(
            where: {
               isDemo: { _eq: $isDemo }
               _not: { availableZipcodes: { zipcode: { _eq: $zipcode } } }
            }
            order_by: { position: desc_nulls_last }
         ) {
            id
            isDemo
            rrule
            leadTime
            zipcodes: availableZipcodes(where: { zipcode: { _eq: $zipcode } }) {
               deliveryPrice
               isDeliveryActive
               isPickupActive
            }
         }
      }
   }
`

export const PLANS = gql`
   subscription plans(
      $where: subscription_subscriptionTitle_bool_exp!
      $isDemo: Boolean!
   ) {
      plans: subscription_subscriptionTitle(where: $where) {
         id
         title
         isDemo
         metaDetails
         defaultServingId: defaultSubscriptionServingId
         defaultServing: defaultSubscriptionServing {
            id
            isDemo
            size: servingSize
            defaultItemCount: defaultSubscriptionItemCount {
               id
               isDemo
               count
               price
               isTaxIncluded
            }
            itemCounts: subscriptionItemCounts(
               where: { isDemo: { _eq: $isDemo } }
            ) {
               id
               count
               price
               isTaxIncluded
            }
         }
         servings: subscriptionServings(
            order_by: { servingSize: asc }
            where: { isDemo: { _eq: $isDemo }, isActive: { _eq: true } }
         ) {
            id
            isDemo
            metaDetails
            size: servingSize
            defaultItemCountId: defaultSubscriptionItemCountId
            defaultItemCount: defaultSubscriptionItemCount {
               id
               isDemo
               count
               price
               isTaxIncluded
            }
            itemCounts: subscriptionItemCounts(
               order_by: { count: asc, price: asc }
               where: { isDemo: { _eq: $isDemo }, isActive: { _eq: true } }
            ) {
               id
               isDemo
               count
               price
               metaDetails
               isTaxIncluded
            }
         }
      }
   }
`

export const OCCURENCES_BY_SUBSCRIPTION = gql`
   query subscription(
      $id: Int!
      $where: subscription_subscriptionOccurence_bool_exp
      $where1: subscription_subscriptionOccurence_customer_bool_exp
   ) {
      subscription: subscription_subscription_by_pk(id: $id) {
         id
         occurences: subscriptionOccurences(
            where: $where
            order_by: { fulfillmentDate: asc_nulls_last }
         ) {
            id
            isValid
            isVisible
            fulfillmentDate
            cutoffTimeStamp
            customers(where: $where1) {
               itemCountValid: validStatus(path: "itemCountValid")
            }
         }
      }
   }
`

export const OCCURENCE_ADDON_PRODUCTS_BY_CATEGORIES = gql`
   query categories(
      $subscriptionId: Int_comparison_exp
      $occurenceId: Int_comparison_exp
   ) {
      categories: productCategories(
         where: {
            subscriptionOccurenceAddOnProducts: {
               _or: [
                  { subscriptionId: $subscriptionId }
                  { subscriptionOccurenceId: $occurenceId }
               ]
               isAvailable: { _eq: true }
               isVisible: { _eq: true }
            }
         }
      ) {
         name
         productsAggregate: subscriptionOccurenceAddOnProducts_aggregate(
            where: {
               _or: [
                  { subscriptionId: $subscriptionId }
                  { subscriptionOccurenceId: $occurenceId }
               ]
            }
         ) {
            aggregate {
               count
            }
            nodes {
               id
               cartItem
               isSingleSelect
               productOption {
                  id
                  label
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
`

export const OCCURENCE_ADDON_PRODUCTS_AGGREGATE = gql`
   subscription productsAggregate(
      $subscriptionId: Int_comparison_exp
      $occurenceId: Int_comparison_exp
   ) {
      productsAggregate: subscription_subscriptionOccurence_addOn_aggregate(
         where: {
            _or: [
               { subscriptionId: $subscriptionId }
               { subscriptionOccurenceId: $occurenceId }
            ]
         }
      ) {
         aggregate {
            count
         }
      }
   }
`

export const OCCURENCE_PRODUCTS_BY_CATEGORIES = gql`
   query categories(
      $subscriptionId: Int_comparison_exp
      $occurenceId: Int_comparison_exp
   ) {
      categories: productCategories(
         where: {
            subscriptionOccurenceProducts: {
               _or: [
                  { subscriptionId: $subscriptionId }
                  { subscriptionOccurenceId: $occurenceId }
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
                  { subscriptionOccurenceId: $occurenceId }
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
                     tags
                  }
               }
            }
         }
      }
   }
`

export const RECIPE_DETAILS = gql`
   query productOption($optionId: Int!) {
      productOption(id: $optionId) {
         id
         label
         product {
            id
            name
         }
         simpleRecipeYield {
            id
            yield
            nutritionalInfo
            sachets: ingredientSachets {
               isVisible
               slipName
               sachet: ingredientSachet {
                  id
                  quantity
                  unit
                  ingredient {
                     id
                     assets
                  }
               }
            }
            simpleRecipe {
               id
               name
               type
               author
               cookingTime
               cuisine
               description
               assets
               utensils
               notIncluded
               showIngredients
               showIngredientsQuantity
               showProcedures
               instructionSets(order_by: { position: desc_nulls_last }) {
                  id
                  title
                  instructionSteps(order_by: { position: desc_nulls_last }) {
                     id
                     assets
                     description
                     isVisible
                     title
                  }
               }
            }
         }
      }
   }
`

export const PRODUCT_OPTION_WITH_RECIPES = gql`
   query ProductOptionsWithRecipes {
      productOptions(
         where: {
            isArchived: { _eq: false }
            simpleRecipeYieldId: { _neq: null }
            product: { isArchived: { _eq: false }, isPublished: { _eq: true } }
         }
      ) {
         id
      }
   }
`

export const INVENTORY_DETAILS = gql`
   query inventoryProduct(
      $id: Int!
      $args: products_inventoryProductCartItem_args!
   ) {
      inventoryProduct(id: $id) {
         cartItem(args: $args)
      }
   }
`

export const CART_BY_WEEK = gql`
   query subscriptionOccurenceCustomer(
      $keycloakId: String!
      $weekId: Int!
      $brand_customerId: Int!
   ) {
      subscriptionOccurenceCustomer: subscription_subscriptionOccurence_customer_by_pk(
         keycloakId: $keycloakId
         subscriptionOccurenceId: $weekId
         brand_customerId: $brand_customerId
      ) {
         isAuto
         isSkipped
         betweenPause
         validStatus
         cart {
            id
            status
            address
            paymentStatus
            walletAmountUsable
            loyaltyPointsUsable
            walletAmountUsed
            loyaltyPointsUsed
            billingDetails
            cartOwnerBilling
            fulfillmentInfo
            transactionId
            paymentMethodId
            products: cartItems(where: { level: { _eq: 1 } }) {
               id
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
      }
   }
`
export const CART_BY_WEEK_SUBSCRIPTION = gql`
   subscription subscriptionOccurenceCustomer(
      $keycloakId: String!
      $weekId: Int!
      $brand_customerId: Int!
   ) {
      subscriptionOccurenceCustomer: subscription_subscriptionOccurence_customer_by_pk(
         keycloakId: $keycloakId
         subscriptionOccurenceId: $weekId
         brand_customerId: $brand_customerId
      ) {
         isAuto
         isSkipped
         betweenPause
         validStatus
         cart {
            id
            status
            address
            paymentStatus
            walletAmountUsable
            loyaltyPointsUsable
            walletAmountUsed
            loyaltyPointsUsed
            billingDetails
            cartOwnerBilling
            fulfillmentInfo
            transactionId
            paymentMethodId
            products: cartItems(where: { level: { _eq: 1 } }) {
               id
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
      }
   }
`

export const ZIPCODE = gql`
   subscription zipcode($subscriptionId: Int!, $zipcode: String!) {
      zipcode: subscription_subscription_zipcode_by_pk(
         subscriptionId: $subscriptionId
         zipcode: $zipcode
      ) {
         deliveryTime
         deliveryPrice
         isPickupActive
         locationId
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
`

export const CART = gql`
   query cart($id: Int!) {
      cart(id: $id) {
         id
         tax
         tip
         address
         totalPrice
         paymentStatus
         deliveryPrice
         billingDetails
         fulfillmentInfo
         transactionId
         transactionRemark
         stripeInvoiceId
         stripeInvoiceDetails
         products: cartItems(where: { level: { _eq: 1 } }) {
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
      }
   }
`

export const CART_SUBSCRIPTION = gql`
   subscription cart($id: Int!) {
      cart(id: $id) {
         id
         tax
         tip
         address
         source
         totalPrice
         paymentStatus
         deliveryPrice
         billingDetails
         cartOwnerBilling
         fulfillmentInfo
         transactionId
         transactionRemark
         stripeInvoiceId
         stripeInvoiceDetails
         customerKeycloakId
         customerInfo
         retryPaymentMethod
         activeCartPaymentId
         activeCartPayment {
            id
            paymentStatus
            cancelAttempt
            transactionRemark
         }
         availablePaymentOptionToCart(
            where: { isActive: { _eq: true } }
            order_by: { position: desc_nulls_last }
         ) {
            id
            isActive
            isDown
            isRecommended
            isValid
            label
            position
            publicCreds
            showCompanyName
            supportedPaymentOption {
               id
               country
               supportedPaymentCompanyId
               paymentOptionLabel
               supportedPaymentCompany {
                  id
                  label
               }
            }
         }
         products: cartItems(where: { level: { _eq: 1 } }) {
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
      }
   }
`

export const CART_STATUS = gql`
   subscription cart($id: Int!) {
      cart(id: $id) {
         id
         status
         orderId
         address
         transactionId
         transactionRemark
         paymentStatus
         fulfillmentInfo
         billingDetails
         cartOwnerBilling
         customerKeycloakId
         amount
         products: cartItems(where: { level: { _eq: 1 } }) {
            id
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
   }
`

export const ORDER_HISTORY = gql`
   subscription orders($keycloakId: String_comparison_exp!) {
      orders: subscription_subscriptionOccurence_customer_aggregate(
         where: {
            keycloakId: $keycloakId
            cart: { status: { _nin: ["CART_PENDING"] } }
         }
         order_by: { subscriptionOccurence: { fulfillmentDate: desc } }
      ) {
         aggregate {
            count
         }
         nodes {
            occurenceId: subscriptionOccurenceId
            occurence: subscriptionOccurence {
               date: fulfillmentDate
            }
         }
      }
   }
`

export const ORDER = gql`
   subscription order(
      $keycloakId: String!
      $subscriptionOccurenceId: Int!
      $brand_customerId: Int!
   ) {
      order: subscription_subscriptionOccurence_customer_by_pk(
         keycloakId: $keycloakId
         brand_customerId: $brand_customerId
         subscriptionOccurenceId: $subscriptionOccurenceId
      ) {
         isSkipped
         validStatus
         keycloakId
         occurrence: subscriptionOccurence {
            id
            subscription {
               id
               item: subscriptionItemCount {
                  id
                  price
               }
            }
         }
         cart {
            id
            status
            orderStatus {
               title
            }
            address
            itemTotal
            addOnTotal
            totalPrice
            deliveryPrice
            paymentMethodId
            billingDetails
            fulfillmentInfo
            paymentStatus
            products: cartItems(where: { level: { _eq: 1 } }) {
               id
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
      }
   }
`

export const ZIPCODE_AVAILABILITY = gql`
   query subscription_zipcode(
      $subscriptionId: Int_comparison_exp!
      $zipcode: String_comparison_exp!
   ) {
      subscription_zipcode: subscription_subscription_zipcode(
         where: { subscriptionId: $subscriptionId, zipcode: $zipcode }
      ) {
         zipcode
         subscriptionId
      }
   }
`

export const INFORMATION_GRID = gql`
   subscription infoGrid($identifier: String_comparison_exp!) {
      infoGrid: content_informationGrid(
         where: { isVisible: { _eq: true }, identifier: $identifier }
      ) {
         id
         heading
         subHeading
         identifier
         columnsCount
         blockOrientation
         blocks: informationBlocks {
            id
            title
            thumbnail
            description
         }
      }
   }
`

export const OUR_MENU = {
   TITLES: gql`
      query titles($brandId: Int!) {
         titles: subscription_subscriptionTitle(
            where: {
               isActive: { _eq: true }
               brands: { brandId: { _eq: $brandId }, isActive: { _eq: true } }
            }
         ) {
            id
            title
         }
      }
   `,
   TITLE: gql`
      query title($id: Int!) {
         title: subscription_subscriptionTitle_by_pk(id: $id) {
            id
            servings: subscriptionServings(where: { isActive: { _eq: true } }) {
               id
               size: servingSize
            }
         }
      }
   `,
   SERVING: gql`
      query serving($id: Int!) {
         serving: subscription_subscriptionServing_by_pk(id: $id) {
            id
            size: servingSize
            counts: subscriptionItemCounts(where: { isActive: { _eq: true } }) {
               id
               count
            }
         }
      }
   `,
   ITEM_COUNT: gql`
      query itemCount($id: Int!) {
         itemCount: subscription_subscriptionItemCount_by_pk(id: $id) {
            id
            count
            subscriptions {
               id
               rrule
            }
         }
      }
   `,
   SUBSCRIPTION: gql`
      query subscription($id: Int!) {
         subscription: subscription_subscription_by_pk(id: $id) {
            id
            occurences: subscriptionOccurences(
               order_by: { fulfillmentDate: asc }
            ) {
               id
               isValid
               isVisible
               fulfillmentDate
            }
         }
      }
   `,
}

export const SETTINGS = gql`
   subscription settings($domain: String_comparison_exp) {
      settings: brands_brand_brandSetting(
         where: {
            brand: { _or: [{ domain: $domain }, { isDefault: { _eq: true } }] }
         }
      ) {
         value
         brandId
         meta: brandSetting {
            id
            type
            identifier
         }
      }
   }
`

export const SETTINGS_QUERY = gql`
   query settings($domain: String) {
      settings: brands_brand_brandSetting(
         where: {
            brand: {
               _or: [{ domain: { _eq: $domain } }, { isDefault: { _eq: true } }]
            }
         }
      ) {
         value
         brandId
         meta: brandSetting {
            id
            type
            identifier
         }
      }
   }
`

export const BRAND_CUSTOMER = gql`
   subscription brandCustomer($id: Int!) {
      brandCustomer(id: $id) {
         id
         subscriptionOnboardStatus
      }
   }
`

export const CUSTOMER = {
   DETAILS: gql`
      subscription customer($keycloakId: String!, $brandId: Int!) {
         customer(keycloakId: $keycloakId) {
            id
            keycloakId
            isSubscriber
            isTest
            carts(
               where: {
                  source: { _eq: "subscription" }
                  brandId: { _eq: $brandId }
               }
            ) {
               id
               paymentStatus
               subscriptionOccurence {
                  fulfillmentDate
               }
            }
            brandCustomers(where: { brandId: { _eq: $brandId } }) {
               id
               isDemo
               brandId
               keycloakId
               isSubscriber
               isSubscriptionCancelled
               pausePeriod
               subscriptionId
               subscriptionAddressId
               subscriptionPaymentMethodId
               subscriptionOnboardStatus
               subscription {
                  recipes: subscriptionItemCount {
                     count
                     price
                     tax
                     isTaxIncluded
                     servingId: subscriptionServingId
                     serving: subscriptionServing {
                        size: servingSize
                     }
                  }
               }
            }
            platform_customer: platform_customer {
               email
               firstName
               lastName
               keycloakId
               phoneNumber
               paymentCustomerId
               defaultPaymentMethodId
               fullName
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
                  paymentCustomerId
                  supportedPaymentOptionId
               }
            }
         }
      }
   `,
   DETAILS_QUERY: gql`
      query customer($keycloakId: String!, $brandId: Int!) {
         customer(keycloakId: $keycloakId) {
            id
            keycloakId
            isSubscriber
            isTest
            carts {
               id
               paymentStatus
               subscriptionOccurence {
                  fulfillmentDate
               }
            }
            brandCustomers(where: { brandId: { _eq: $brandId } }) {
               id
               isDemo
               brandId
               keycloakId
               isSubscriber
               isSubscriptionCancelled
               pausePeriod
               subscriptionId
               subscriptionAddressId
               subscriptionPaymentMethodId
               subscriptionOnboardStatus
               subscription {
                  recipes: subscriptionItemCount {
                     count
                     price
                     tax
                     isTaxIncluded
                     servingId: subscriptionServingId
                     serving: subscriptionServing {
                        size: servingSize
                     }
                  }
               }
            }
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
         }
      }
   `,
   WITH_BRAND: gql`
      query customers(
         $where: crm_customer_bool_exp = {}
         $brandId: Int_comparison_exp = {}
      ) {
         customers(where: $where) {
            id
            brandCustomers(where: { brandId: $brandId }) {
               id
               subscriptionOnboardStatus
            }
         }
      }
   `,
}

export const GET_FILEID = gql`
   query GET_FILEID($divId: [String!]!) {
      content_subscriptionDivIds(where: { id: { _in: $divId } }) {
         fileId
         id
         subscriptionDivFileId {
            linkedCssFiles {
               cssFile {
                  path
               }
            }
            linkedJsFiles {
               jsFile {
                  path
               }
            }
         }
      }
   }
`

export const GET_FILES = gql`
   query GET_FILES($divId: [String!]!) {
      content_subscriptionDivIds(where: { id: { _in: $divId } }) {
         id
         fileId
         subscriptionDivFileId {
            id
            path
            linkedCssFiles {
               id
               cssFile {
                  id
                  path
               }
            }
            linkedJsFiles {
               id
               jsFile {
                  id
                  path
               }
            }
         }
      }
   }
`

export const COUPONS = gql`
   subscription Coupons($params: jsonb, $brandId: Int!) {
      coupons(
         where: {
            isActive: { _eq: true }
            isArchived: { _eq: false }
            brands: { brandId: { _eq: $brandId }, isActive: { _eq: true } }
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
`

export const SEARCH_COUPONS = gql`
   query SearchCoupons($typedCode: String!, $params: jsonb, $brandId: Int!) {
      coupons(
         where: {
            code: { _eq: $typedCode }
            isActive: { _eq: true }
            isArchived: { _eq: false }
            brands: { brandId: { _eq: $brandId }, isActive: { _eq: true } }
         }
      ) {
         id
         isRewardMulti
         metaDetails
         rewards(order_by: { position: desc_nulls_last }) {
            id
            condition {
               isValid(args: { params: $params })
            }
         }
      }
   }
`

export const CART_REWARDS = gql`
   subscription CartRewards(
      $params: jsonb
      $where: order_cart_rewards_bool_exp!
   ) {
      cartRewards(where: $where) {
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
`

export const REFERRER = gql`
   query customerReferral($brandId: Int!, $code: String!) {
      customerReferrals(
         where: { brandId: { _eq: $brandId }, referralCode: { _eq: $code } }
      ) {
         id
         customer {
            platform_customer: platform_customer {
               firstName
               lastName
            }
         }
      }
   }
`

export const WALLETS = gql`
   subscription Wallets($brandId: Int!, $keycloakId: String!) {
      wallets(
         where: { brandId: { _eq: $brandId }, keycloakId: { _eq: $keycloakId } }
      ) {
         id
         amount
         walletTransactions(order_by: { created_at: desc_nulls_last }) {
            id
            type
            amount
            created_at
         }
      }
   }
`

export const LOYALTY_POINTS = gql`
   subscription LoyaltyPoints($brandId: Int!, $keycloakId: String!) {
      loyaltyPoints(
         where: { brandId: { _eq: $brandId }, keycloakId: { _eq: $keycloakId } }
      ) {
         points
         loyaltyPointTransactions(order_by: { created_at: desc_nulls_last }) {
            id
            points
            type
            created_at
         }
      }
   }
`
export const CUSTOMER_REFERRALS = gql`
   subscription CustomerReferrals($brandId: Int!, $keycloakId: String!) {
      customerReferrals(
         where: { brandId: { _eq: $brandId }, keycloakId: { _eq: $keycloakId } }
      ) {
         id
         referralCode
         referredByCode
      }
   }
`

export const CUSTOMERS_REFERRED = gql`
   query CustomersReferred($brandId: Int!, $code: String!) {
      customerReferrals(
         where: { brandId: { _eq: $brandId }, referredByCode: { _eq: $code } }
      ) {
         id
         customer {
            platform_customer: platform_customer {
               firstName
               lastName
            }
         }
      }
   }
`

export const SUBSCRIPTION_PLAN = gql`
   query SubscriptionPlan($subscriptionId: Int!, $brandCustomerId: Int) {
      subscription_subscription(
         where: {
            id: { _eq: $subscriptionId }
            brand_customers: { id: { _eq: $brandCustomerId } }
         }
      ) {
         subscriptionItemCount {
            count
            subscriptionServing {
               servingSize
               subscriptionTitle {
                  title
               }
            }
         }
      }
   }
`
export const NAVIGATION_MENU = gql`
   query NAVIGATION_MENU($navigationMenuId: Int!) {
      brands_navigationMenuItem(
         where: { navigationMenuId: { _eq: $navigationMenuId } }
      ) {
         created_at
         id
         label
         navigationMenuId
         openInNewTab
         position
         updated_at
         url
         parentNavigationMenuItemId
      }
   }
`
export const BRAND_PAGE = gql`
   query BRAND_PAGE($domain: String!, $route: String!) {
      brands_brandPages(
         where: {
            route: { _eq: $route }
            brand: {
               _or: [{ isDefault: { _eq: true } }, { domain: { _eq: $domain } }]
            }
         }
      ) {
         id
         internalPageName
         isArchived
         published
         route
         animationConfig
         brandPageSettings {
            value
            brandPageSetting {
               identifier
               type
            }
         }
         linkedNavigationMenuId
         brandPageModules(
            order_by: { position: desc_nulls_last }
            where: { isHidden: { _eq: false } }
         ) {
            id
            internalModuleIdentifier
            config
            animationConfig
            moduleType
            isHidden
            fileId
            position
            subscriptionDivFileId: file {
               path
               linkedCssFiles {
                  id
                  cssFile {
                     id
                     path
                  }
               }
               linkedJsFiles {
                  id
                  jsFile {
                     id
                     path
                  }
               }
            }
         }
         brand {
            navigationMenuId
         }
      }
   }
`

export const OTPS = gql`
   subscription otps($where: platform_otp_transaction_bool_exp = {}) {
      otps: platform_otp_transaction(
         where: $where
         order_by: { created_at: desc }
      ) {
         id
         code
         isValid
         validTill
         resendAttempts
         isResendAllowed
      }
   }
`

export const PLATFORM_CUSTOMERS = gql`
   query customers($where: platform_customer_bool_exp = {}) {
      customers: platform_customer(where: $where) {
         email
         password
         fullName
         id: keycloakId
      }
   }
`

export const PRODUCTS_BY_CATEGORY = gql`
   query PRODUCTS_BY_CATEGORY($params: jsonb!) {
      onDemand_getMenuV2copy(args: { params: $params }) {
         data
         id
      }
   }
`
export const PRODUCTS = gql`
   query Products($ids: [Int!]!, $params: jsonb!) {
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
         isPopupAllowed
         isPublished: publishedByLocation(args: { params: $params })
         isAvailable: availabilityByLocation(args: { params: $params })
         defaultProductOptionId
         defaultCartItem: defaultCartItemByLocation(args: { params: $params })
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
                     sachetItemId
                     ingredientSachetId
                     cartItem: cartItemByLocation(args: { params: $params })
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
                              price: priceByLocation(args: { params: $params })
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
                                             order_by: {
                                                position: desc_nulls_last
                                             }
                                          ) {
                                             id
                                             name
                                             isRequired
                                             type
                                             limits
                                             options(
                                                where: {
                                                   isVisible: { _eq: true }
                                                }
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
                           }
                        }
                     }
                  }
               }
            }
         }
      }
   }
`
export const PRODUCT_DETAILS = gql`
   query Products($id: Int!, $params: jsonb!) {
      products(where: { isArchived: { _eq: false }, id: { _eq: $id } }) {
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
         isPopupAllowed
         isPublished: publishedByLocation(args: { params: $params })
         isAvailable: availabilityByLocation(args: { params: $params })
         defaultProductOptionId
         defaultCartItem: defaultCartItemByLocation(args: { params: $params })
         productionOptionSelectionStatement
         productOptions(
            where: { isArchived: { _eq: false } }
            order_by: { position: desc_nulls_last }
         ) {
            id
            position
            type
            label
            isPublished: publishedByLocation(args: { params: $params })
            isAvailable: availabilityByLocation(args: { params: $params })
            price: priceByLocation(args: { params: $params })
            discount: discountByLocation(args: { params: $params })
            cartItem: cartItemByLocation(args: { params: $params })
            additionalModifiers(where: { isActive: { _eq: true } }) {
               type
               label
               modifier {
                  id
                  name
                  categories(where: { isVisible: { _eq: true } }) {
                     id
                     name
                     isRequired
                     type
                     limits
                     options(where: { isVisible: { _eq: true } }) {
                        id
                        name
                        price: priceByLocation(args: { params: $params })
                        discount: discountByLocation(args: { params: $params })
                        quantity
                        image
                        isActive
                        sachetItemId
                        ingredientSachetId
                        cartItem: cartItemByLocation(args: { params: $params })
                     }
                  }
               }
            }
            modifier {
               id
               name
               categories(where: { isVisible: { _eq: true } }) {
                  id
                  name
                  isRequired
                  type
                  limits
                  options(where: { isVisible: { _eq: true } }) {
                     id
                     name
                     price: priceByLocation(args: { params: $params })
                     discount: discountByLocation(args: { params: $params })
                     quantity
                     image
                     isActive
                     sachetItemId
                     ingredientSachetId
                     cartItem: cartItemByLocation(args: { params: $params })
                  }
               }
            }
            simpleRecipeYield {
               id
               yield
               nutritionalInfo
               sachets: ingredientSachets {
                  isVisible
                  slipName
                  sachet: ingredientSachet {
                     id
                     quantity
                     unit
                     ingredient {
                        id
                        assets
                     }
                  }
               }
               simpleRecipe {
                  id
                  name
                  type
                  author
                  cookingTime
                  cuisine
                  description
                  assets
                  utensils
                  notIncluded
                  showIngredients
                  showIngredientsQuantity
                  showProcedures
                  instructionSets(order_by: { position: desc_nulls_last }) {
                     id
                     title
                     instructionSteps(order_by: { position: desc_nulls_last }) {
                        id
                        assets
                        description
                        isVisible
                        title
                     }
                  }
               }
            }
         }
      }
   }
`
export const GET_CART = gql`
   subscription cart($where: order_cart_bool_exp!) {
      carts(where: $where) {
         id
         status
         tax
         source
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
         walletAmountUsable
         locationId
         loyaltyPointsUsable
         customerKeycloakId
         cartOwnerBilling
         billing: billingDetails
         subscriptionOccurenceId
         toUseAvailablePaymentOptionId
         posistOrderStatus
         posistOrderResponse
         locationTableId
         locationTable {
            internalTableLabel
            id
            seatCover
         }
         subscriptionOccurence {
            id
            fulfillmentDate
         }
         address
         fulfillmentInfo
         cartItems_aggregate(where: { level: { _eq: 1 } }) {
            aggregate {
               count
            }
         }
         paymentMethods: availablePaymentOptionToCart(
            where: { isActive: { _eq: true } }
            order_by: { position: desc_nulls_last }
         ) {
            id
            isActive
            isDown
            isRecommended
            isValid
            label
            position
            publicCreds
            showCompanyName
            supportedPaymentOption {
               id
               country
               supportedPaymentCompanyId
               paymentOptionLabel
               supportedPaymentCompany {
                  id
                  label
               }
            }
         }
      }
   }
`

export const GET_CARTS = gql`
   subscription GET_CARTS($where: order_cart_bool_exp!) {
      carts(where: $where) {
         id
         address
         fulfillmentInfo
         locationId
         orderTabId
      }
   }
`
export const BRAND_SETTINGS_BY_TYPE = gql`
   query BRAND_SEO_SETTINGS($domain: String!, $type: String!) {
      brands_brand_brandSetting(
         where: {
            brand: {
               _or: [{ isDefault: { _eq: true } }, { domain: { _eq: $domain } }]
            }
            brandSetting: { type: { _eq: $type } }
         }
      ) {
         brandId
         meta: brandSetting {
            id
            type
            identifier
         }
         value
      }
   }
`
export const BRAND_ONDEMAND_DELIVERY_RECURRENCES = gql`
   query BRAND_ONDEMAND_DELIVERY_RECURRENCES(
      $where: fulfilment_brand_recurrence_bool_exp!
   ) {
      brandRecurrences(where: $where) {
         brandId
         brandLocationId
         recurrenceId
         recurrence {
            id
            rrule
            type
            timeSlots {
               from
               to
               pickUpPrepTime
               id
               mileRanges {
                  id
                  from
                  city
                  distanceType
                  to
                  zipcodes
                  state
                  prepTime
                  geoBoundary
                  isExcluded
               }
            }
         }
      }
   }
`
export const ORDER_TAB = gql`
   query ORDER_TAB($where: brands_orderTab_bool_exp!) {
      brands_orderTab(where: $where) {
         id
         orderFulfillmentTypeLabel
         label
         orderType
         availableOrderInterfaceLabel
      }
   }
`
export const BRAND_LOCATIONS = gql`
   query BRAND_LOCATIONS($where: brands_brand_location_bool_exp!) {
      brands_brand_location_aggregate(where: $where) {
         aggregate {
            count
         }
         nodes {
            brandId
            locationId
            id
            location {
               id
               locationAddress
               label
               zipcode
               city
               state
               lat
               lng
               country
            }
            orderExperienceId
            orderExperienceOptionType
            doesDeliverOutsideCity
            doesDeliverOutsideState
            operatingTime
            brand_recurrences(where: { isActive: { _eq: true } }) {
               recurrence {
                  rrule
                  type
                  timeSlots {
                     from
                     to
                  }
               }
            }
         }
      }
   }
`
export const PREORDER_DELIVERY_BRAND_RECURRENCES = gql`
   query PREORDER_DELIVERY_BRAND_RECURRENCES(
      $where: fulfilment_brand_recurrence_bool_exp!
   ) {
      brandRecurrences(where: $where) {
         brandId
         brandLocationId
         recurrenceId
         recurrence {
            id
            rrule
            type
            timeSlots {
               from
               to
               id
               slotInterval
               mileRanges {
                  from
                  city
                  distanceType
                  to
                  zipcodes
                  state
                  geoBoundary
                  isExcluded
                  leadTime
                  id
               }
            }
         }
      }
   }
`
export const ONDEMAND_PICKUP_BRAND_RECURRENCES = gql`
   query ONDEMAND_PICKUP_BRAND_RECURRENCES(
      $where: fulfilment_brand_recurrence_bool_exp!
   ) {
      brandRecurrences(where: $where) {
         brandId
         recurrenceId
         recurrence {
            id
            rrule
            type
            timeSlots {
               from
               to
               id
               mileRanges {
                  id
                  from
                  city
                  distanceType
                  to
                  zipcodes
                  state
                  geoBoundary
                  isExcluded
                  prepTime
               }
            }
         }
         brandLocationId
      }
   }
`
export const PREORDER_PICKUP_BRAND_RECURRENCES = gql`
   query PREORDER_PICKUP_BRAND_RECURRENCES(
      $where: fulfilment_brand_recurrence_bool_exp!
   ) {
      brandRecurrences(where: $where) {
         brandId
         recurrenceId
         brandLocationId
         recurrence {
            id
            rrule
            type
            timeSlots {
               from
               to
               id
               slotInterval
               pickUpLeadTime
               mileRanges {
                  id
                  from
                  city
                  distanceType
                  to
                  zipcodes
                  state
                  geoBoundary
                  isExcluded
                  leadTime
               }
            }
         }
      }
   }
`
export const ONDEMAND_DINE_BRAND_RECURRENCES = gql`
   query ONDEMAND_DINE_BRAND_RECURRENCES(
      $where: fulfilment_brand_recurrence_bool_exp!
   ) {
      brandRecurrences(where: $where) {
         brandId
         recurrenceId
         recurrence {
            id
            rrule
            type
            timeSlots {
               from
               to
               id
               mileRanges {
                  id
                  from
                  city
                  distanceType
                  to
                  zipcodes
                  state
                  geoBoundary
                  isExcluded
                  prepTime
               }
            }
         }
         brandLocationId
      }
   }
`
export const SCHEDULED_DINEIN_BRAND_RECURRENCES = gql`
   query SCHEDULED_DINEIN_BRAND_RECURRENCES(
      $where: fulfilment_brand_recurrence_bool_exp!
   ) {
      brandRecurrences(where: $where) {
         brandId
         recurrenceId
         recurrence {
            id
            rrule
            type
            timeSlots {
               from
               to
               id
               mileRanges {
                  id
                  from
                  city
                  distanceType
                  to
                  zipcodes
                  state
                  geoBoundary
                  isExcluded
                  leadTime
               }
            }
         }
         brandLocationId
      }
   }
`
export const GET_BRAND_LOCATION = gql`
   query GET_BRAND_LOCATION($where: brands_brand_location_bool_exp!) {
      brandLocations: brands_brand_location(where: $where) {
         id
         brandId
         location {
            id
            locationAddress
            label
            zipcode
            city
            state
            lat
            lng
            country
         }
      }
   }
`
export const GET_JS_CSS_FILES = gql`
   query GET_CSS_JS_FILES($where: brands_jsCssFileLinks_bool_exp!) {
      brands_jsCssFileLinks(where: $where) {
         id
         brandId
         brandPageId
         brandPageModuleId
         htmlFileId
         position
         file {
            fileName
            fileType
            id
            path
         }
      }
   }
`

export const GET_CART_ITEMS_BY_CART = gql`
   subscription GET_CART_ITEMS_BY_CART($where: order_cartItem_bool_exp!) {
      cartItems(where: $where) {
         cartItemId: id
         parentCartItemId
         addOnLabel
         addOnPrice
         created_at
         price: unitPrice
         discount
         name: displayName
         image: displayImage
         childs(where: { ingredientId: { _is_null: true } }) {
            price: unitPrice
            name: displayName
            discount
            productOption {
               id
               label
            }
            childs(where: { ingredientId: { _is_null: true } }) {
               displayName
               price: unitPrice
               discount
               modifierOption {
                  id
                  name
               }
               childs(where: { ingredientId: { _is_null: true } }) {
                  displayName
                  price: unitPrice
                  discount
                  modifierOption {
                     id
                     name
                  }
               }
            }
         }
         productId
      }
   }
`
export const LOCATION_KIOSK = gql`
   query LOCATION_KIOSK($id: Int!) {
      brands_locationKiosk_by_pk(id: $id) {
         accessPassword
         accessUrl
         id
         internalLocationKioskLabel
         kioskModuleConfig
         locationId
         printerId
      }
   }
`

export const GET_CART_PAYMENT_INFO = gql`
   subscription GET_CART_PAYMENT_INFO($where: order_cartPayment_bool_exp!) {
      cartPayments(where: $where, limit: 1, order_by: { updated_at: desc }) {
         id
         amount
         cancelAttempt
         cartId
         cart {
            customerInfo
            source
         }
         isTest
         paymentStatus
         paymentType
         transactionRemark
         isResultShown
         stripeInvoiceId
         transactionId
         actionUrl
         actionRequired
         availablePaymentOption {
            id
            label
            supportedPaymentOption {
               paymentOptionLabel
               id
               isRequestClientBased
               isWebhookClientBased
               supportedPaymentCompany {
                  label
                  id
               }
            }
         }
      }
   }
`

export const GET_PAYMENT_OPTIONS = gql`
   subscription cart($id: Int!) {
      cart(id: $id) {
         id
         cartOwnerBilling
         isCartValid
         availablePaymentOptionToCart(
            where: { isActive: { _eq: true } }
            order_by: { position: desc_nulls_last }
         ) {
            id
            isActive
            isDown
            isRecommended
            isValid
            label
            description
            position
            publicCreds
            showCompanyName
            supportedPaymentOption {
               id
               country
               supportedPaymentCompanyId
               paymentOptionLabel
               isLoginRequired
               canShowWhileLoggedIn
               supportedPaymentCompany {
                  id
                  label
               }
            }
         }
      }
   }
`

export const GET_AVAILABLE_PAYMENT_OPTIONS = gql`
   subscription availablePaymentOptions($ids: [Int!]) {
      availablePaymentOptions: brands_availablePaymentOption(
         where: { isActive: { _eq: true }, id: { _in: $ids } }
         order_by: { position: desc_nulls_last }
      ) {
         id
         isActive
         isDown
         isRecommended
         isValid
         label
         description
         position
         publicCreds
         showCompanyName
         supportedPaymentOption {
            id
            country
            supportedPaymentCompanyId
            paymentOptionLabel
            isLoginRequired
            canShowWhileLoggedIn
            supportedPaymentCompany {
               id
               label
            }
         }
      }
   }
`

export const GET_MODIFIER_BY_ID = gql`
   query GET_MODIFIER_BY_ID(
      $priceArgs: priceByLocation_onDemand_modifierCategoryOption_args!
      $discountArgs: discountByLocation_onDemand_modifierCategoryOption_args!
      $modifierCategoryOptionCartItemArgs: cartItemByLocation_onDemand_modifierCategoryOption_args!
      $id: [Int!]!
   ) {
      modifiers(where: { id: { _in: $id } }) {
         id
         name
         categories(where: { isVisible: { _eq: true } }) {
            id
            name
            isRequired
            type
            limits
            options(where: { isVisible: { _eq: true } }) {
               id
               name
               quantity
               image
               isActive
               sachetItemId
               ingredientSachetId
               additionalModifierTemplateId
               isAdditionalModifierRequired
               price: priceByLocation(args: $priceArgs)
               discount: discountByLocation(args: $discountArgs)
               cartItem: cartItemByLocation(
                  args: $modifierCategoryOptionCartItemArgs
               )
            }
         }
      }
   }
`
export const GET_ORDER_DETAILS = gql`
   subscription GET_ORDER_DETAILS($where: order_cart_bool_exp!) {
      carts(where: $where, order_by: { order: { created_at: desc } }) {
         id
         status
         paymentStatus
         fulfillmentInfo
         billingDetails
         cartOwnerBilling
         address
         order {
            created_at
            deliveryInfo
         }
         cartPayments {
            id
            amount
            transactionRemark
         }
         availablePaymentOption {
            label
            supportedPaymentOption {
               id
               paymentOptionLabel
            }
         }
         cartItems(where: { level: { _eq: 1 } }) {
            cartItemId: id
            parentCartItemId
            addOnLabel
            addOnPrice
            created_at
            price: unitPrice
            discount
            name: displayName
            image: displayImage
            childs {
               price: unitPrice
               name: displayName
               discount
               productOption {
                  id
                  label
               }
               childs {
                  displayName
                  price: unitPrice
                  discount
                  modifierOption {
                     id
                     name
                  }
                  childs {
                     displayName
                     price: unitPrice
                     discount
                     modifierOption {
                        id
                        name
                     }
                  }
               }
            }
            productId
         }
      }
   }
`

export const GET_ALL_RECURRENCES = gql`
   query GET_ALL_RECURRENCES($where: fulfilment_brand_recurrence_bool_exp!) {
      brandRecurrences(where: $where) {
         brandId
         brandLocationId
         recurrenceId
         recurrence {
            id
            rrule
            type
            timeSlots {
               from
               to
               pickUpPrepTime
               id
               pickUpLeadTime
               slotInterval
               mileRanges {
                  id
                  from
                  city
                  distanceType
                  to
                  zipcodes
                  state
                  prepTime
                  geoBoundary
                  isExcluded
                  leadTime
               }
            }
         }
      }
   }
`
export const PRODUCT_SEO_SETTINGS_BY_ID = gql`
   query PRODUCT_SEO_SETTINGS($productId: Int!, $type: String!) {
      products(where: { id: { _eq: $productId } }) {
         description
         name
      }
      products_productSetting(where: { type: { _eq: $type } }) {
         product_productSettings(where: { productId: { _eq: $productId } }) {
            value
            productId
         }
         identifier
      }
      brands {
         brand_brandSettings(
            where: { brandSettingId: { _eq: 33 }, brandId: { _eq: 1 } }
         ) {
            value
         }
      }
   }
`
export const SUPPORTED_PAYMENT_OPTIONS = gql`
   query SUPPORTED_PAYMENT_OPTIONS {
      brands_supportedPaymentCompany {
         id
         label
      }
   }
`
export const LOCATION_TABLES = gql`
   query LOCATION_TABLES($where: brands_locationTable_bool_exp) {
      brands_locationTable(where: $where) {
         id
         internalTableLabel
         isActive
         locationId
         seatCover
      }
   }
`
export const COUPON_BY_ID = gql`
   query coupon($id: Int!) {
      coupon(id: $id) {
         code
         metaDetails
      }
   }
`
export const GET_PAGE_ROUTES = gql`
   query MyQuery($domain: String!) {
      brands(
         where: {
            _or: [{ domain: { _eq: $domain } }, { isDefault: { _eq: true } }]
         }
      ) {
         brandPages(
            where: {
               isArchived: { _eq: false }
               published: { _eq: true }
               isAllowedToCrawl: { _eq: true }
            }
         ) {
            route
         }
      }
   }
`
export const GET_DISALLOWED_PAGE_ROUTES = gql`
   query MyQuery($domain: String!) {
      brands(
         where: {
            _or: [{ domain: { _eq: $domain } }, { isDefault: { _eq: true } }]
         }
      ) {
         brandPages(
            where: {
               isArchived: { _eq: false }
               published: { _eq: true }
               isAllowedToCrawl: { _eq: false }
            }
         ) {
            route
         }
      }
   }
`
export const LOCATION_KIOSK_VALIDATION = gql`
   query LOCATION_KIOSK_VALIDATION($where: brands_locationKiosk_bool_exp!) {
      brands_locationKiosk(where: $where) {
         id
      }
   }
`
