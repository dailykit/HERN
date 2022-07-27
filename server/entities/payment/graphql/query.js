export const ORGANIZATIONS = `
query organizations {
   organizations {
      id
      organizationUrl
      stripeAccountId
      organizationName
      stripeAccountType
   }
}
`
export const CART_PAYMENT = `
query CART_PAYMENT($id: Int!) {
   cartPayment(id: $id) {
   id
   cartId
   paymentStatus
   stripeInvoiceId
   paymentRetryAttempt
   usedAvailablePaymentOptionId
   metaData
   cart{
      locationKioskId
      orderTab {
         availableOrderInterfaceLabel
      }
      brand{
        domain
      }
      availablePaymentOption {
         id
         label
         supportedPaymentOption {
            paymentOptionLabel
         }
      }
    }
 }
}
`

export const BRAND = `
query BRAND($id: Int!) {
   brand(id: $id) {
     domain
     id
   }
 } 
`

export const CART_PAYMENTS = `
query CART_PAYMENTS($where: order_cartPayment_bool_exp!) {
  cartPayments(where: $where) {
    id
    cartId
    amount
    stripeInvoiceId
    paymentMethodId
    paymentStatus
    usedAvailablePaymentOptionId
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
    cartOwnerBilling
    usedOrderInterface
    orderTab {
      availableOrderInterfaceLabel
    }
    locationKioskId
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

export const PAYMENT_METHOD = `
   query paymentMethod($paymentMethodId: String!) {
      paymentMethod: platform_customerPaymentMethod_by_pk(
         paymentMethodId: $paymentMethodId
      ) {
         paymentMethodId
         customer: customer {
            phoneNumber
            firstName
            lastName
         }
      }
   }
`

export const AVAILABLE_PAYMENT_OPTION = `
query AVAILABLE_PAYMENT_OPTION($id: Int!) {
   availablePaymentOption:brands_availablePaymentOption_by_pk(id: $id) {
     id
     isActive
     isDown
     isRecommended
     isValid
     label
     position
     privateCreds
     publicCreds
     showCompanyName
     supportedPaymentOption {
       id
       paymentOptionLabel
       country
       isRequestClientBased
       isWebhookClientBased
       supportedPaymentCompany {
         id
         label
       }
     }
   }
 }

 `

export const PINE_LABS_DEVICE_INFO = `
query MyQuery($kioskId: Int!) {
   devices: brands_kioskPineLabsDevices(where: {kioskId: {_eq: $kioskId}, pineLabsDevice: {isActive: {_eq: true}}}) {
     pineLabsDevice {
       imei
       merchantStorePosCode
     }
   }
}
`
