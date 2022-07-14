export const OTPS = `
   query otps($where: platform_otp_transaction_bool_exp = {}) {
      otps: platform_otp_transaction(where: $where, order_by: {created_at: desc}) {
         id
         code
      }
   }
`
export const PLATFORM_CUSTOMER = `
   query platform_customer($where: platform_customer_bool_exp = {}) {
      platform_customer: platform_customer(where: $where) {
         id: keycloakId
      }
   }
`
export const BRAND_CUSTOMER_AND_DEVICE_ID = `
   query BRAND_CUSTOMER_AND_DEVICE_ID(
      $where: crm_brand_customer_bool_exp!
      $where1: deviceHub_mobileDevice_bool_exp!
   ) {
      brandCustomers(where: $where) {
         id
      }
      deviceHub_mobileDevice(where: $where1) {
         id
      }
   }
`
export const BRAND_CUSTOMER = `
query MyQuery($brandId: Int_comparison_exp!, $phoneNumber: String_comparison_exp!) {
   brandCustomers(where: {brandId: $brandId, customer: {platform_customer: {phoneNumber: $phoneNumber}}}) {
     keycloakId
   }
 } 
`
