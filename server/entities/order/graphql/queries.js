export const FETCH_INVENTORY_PRODUCT = `
   query inventoryProduct($id: Int!, $optionId: Int_comparison_exp!) {
      inventoryProduct(id: $id) {
         id
         sachetItemId
         sachetItem {
            id
            unit
            bulkItemId
            bulkItem {
               id
               processingName
               supplierItemId
               supplierItem {
                 id
                 name
               }
            }
         }
         supplierItemId
         supplierItem {
            id
            name
            unit
         }
         inventoryProductOptions(where: { id: $optionId }) {
            quantity
            packagingId
            instructionCardTemplateId
            operationConfigId
            operationConfig {
               stationId
               labelTemplateId
            }
         }
      }
   }
`

export const FETCH_SIMPLE_RECIPE_PRODUCT = `
   query simpleRecipeProductOption($id: Int!) {
      simpleRecipeProductOption(id: $id) {
         id
         simpleRecipeProduct {
            simpleRecipeId
         }
         packagingId
         instructionCardTemplateId
         operationConfigId
         operationConfig {
            stationId
            labelTemplateId
         }
      }
   }
`

export const FETCH_SIMPLE_RECIPE_PRODUCT_OPTION = `
   query simpleRecipeProductOption($id: Int!) {
      simpleRecipeProductOption(id: $id) {
         id
         simpleRecipeYieldId
         simpleRecipeYield {
            yield
            ingredientSachets {
               ingredientSachet {
                  id
                  unit
                  quantity
                  liveModeOfFulfillment {
                     id
                     accuracy
                     bulkItemId
                     sachetItemId
                     packagingId
                     stationId
                     labelTemplateId
                  }
                  ingredient {
                     name
                  }
                  ingredientProcessing {
                     processing {
                        name
                     }
                  }
               }
            }
         }
      }
   }
`

export const FETCH_CART = `
   query cartByPK($id: Int!) {
      cartByPK(id: $id) {
         id
         tip
         tax
         amount
         status
         address
         brandId
         cartInfo
         orderId
         isValid
         discount
         cartSource
         taxPercent
         totalPrice
         itemTotal
         created_at
         customerId
         customerInfo
         transactionId
         deliveryPrice
         paymentStatus
         fulfillmentInfo
         paymentMethodId
         paymentCustomerId
         transactionRemark
      }
   }
`

// export const BRAND_ON_DEMAND_SETTING = `
//    query brand($id: Int!) {
//       brand(id: $id) {
//          name: onDemandSettings(
//             where: { onDemandSetting: { identifier: { _eq: "Brand Name" } } }
//          ) {
//             name: value(path: "name")
//          }
//          address: onDemandSettings(
//             where: { onDemandSetting: { identifier: { _eq: "Location" } } }
//          ) {
//             line1: value(path: "line1")
//             line2: value(path: "line2")
//             city: value(path: "city")
//             state: value(path: "state")
//             country: value(path: "country")
//             zipcode: value(path: "zipcode")
//             latitude: value(path: "lat")
//             longitude: value(path: "lng")
//          }
//          contact: onDemandSettings(
//             where: { onDemandSetting: { identifier: { _eq: "Contact" } } }
//          ) {
//             email: value(path: "email")
//             phoneNo: value(path: "phoneNo")
//          }
//          email: onDemandSettings(
//             where: {
//                onDemandSetting: { identifier: { _eq: "Email Notification" } }
//             }
//          ) {
//             name: value(path: "name")
//             email: value(path: "email")
//             template: value(path: "template")
//          }
//       }
//    }
// `

// export const BRAND_SUBSCRIPTION_SETTING = `
//    query brand($id: Int!) {
//       brand(id: $id) {
//          name: subscriptionStoreSettings(
//             where: {
//                subscriptionStoreSetting: { identifier: { _eq: "theme-brand" } }
//             }
//          ) {
//             name: value(path: "name")
//          }
//          address: subscriptionStoreSettings(
//             where: {
//                subscriptionStoreSetting: { identifier: { _eq: "Location" } }
//             }
//          ) {
//             line1: value(path: "line1")
//             line2: value(path: "line2")
//             city: value(path: "city")
//             state: value(path: "state")
//             country: value(path: "country")
//             zipcode: value(path: "zipcode")
//             latitude: value(path: "lat")
//             longitude: value(path: "lng")
//          }
//          contact: subscriptionStoreSettings(
//             where: {
//                subscriptionStoreSetting: { identifier: { _eq: "Contact" } }
//             }
//          ) {
//             email: value(path: "email")
//             phoneNo: value(path: "phoneNo")
//          }
//          email: subscriptionStoreSettings(
//             where: {
//                subscriptionStoreSetting: {
//                   identifier: { _eq: "Email Notification" }
//                }
//             }
//          ) {
//             name: value(path: "name")
//             email: value(path: "email")
//             template: value(path: "template")
//          }
//       }
//    }
// `

export const EMAIL_CONFIG = `
   query brand($id: Int!) {
      brand(id: $id) {
         email: brand_brandSettings(
            where: {
               brandSetting: { identifier: { _eq: "Email Notification" } }
            }
         ) {
            name: value(path: "name")
            email: value(path: "email")
            template: value(path: "template")
         }
      }
   }
`

export const EMAIL_SETTINGS = `
query brand($id: Int!) {
   brand(id: $id) {
      id
      delivered: brand_brandSettings(
         where: {
            brandSetting: { identifier: { _eq: "Order Delivered" } }
         }
      ) {
         name: value(path: "name")
         email: value(path: "email")
         template: value(path: "template")
      }
      cancelled: brand_brandSettings(
         where: {
            brandSetting: { identifier: { _eq: "Order Cancelled" } }
         }
      ) {
         name: value(path: "name")
         email: value(path: "email")
         template: value(path: "template")
      }
      new: brand_brandSettings(
         where: {
            brandSetting: { identifier: { _eq: "Email Notification" } }
         }
      ) {
         name: value(path: "name")
         email: value(path: "email")
         template: value(path: "template")
      }
      subs_new: brand_brandSettings(
         where: {
            brandSetting: {
               identifier: { _eq: "New Email Notification" }
            }
         }
      ) {
         name: value(path: "name")
         email: value(path: "email")
         template: value(path: "template")
      }
   }
}
`

export const CUSTOMER = `
   query customer($keycloakId: String!) {
      customer(keycloakId: $keycloakId) {
         email
      }
   }
`
export const MILE_RANGE = `
   query mileRange($id: Int!) {
      mileRange: mileRangeByPK(id: $id) {
         id
         prepTime
      }
   }
`

export const ORDER_BY_CART = `
   query order($cartId: Int_comparison_exp!) {
      orders(where: { cartId: $cartId }) {
         id
         isRejected
      }
   }
`

export const CART = `
query cart($id: Int!) {
  cart(id: $id) {
    id
    isTest
    amount
    orderId
    customerId
    customerKeycloakId
    balancePayment
    retryPaymentMethod
    paymentMethodId
    paymentCustomerId
    statementDescriptor
    toUseAvailablePaymentOptionId
    customerInfo
    posistOrderDetails
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

export const LOCATION_KIOSK = `
query LOCATION_KIOSK($id: Int!, $brandId: Int!) {
   locationKiosk:brands_locationKiosk_by_pk(id: $id) {
     location {
       brand_locations(where: {brandId: {_eq: $brandId}}) {
         posist_customer_key
       }
     }
   }
 }

 `
