export const INSERT_CUSTOMER = `
   mutation insertCustomer($object: platform_customer_insert_input!) {
      insertCustomer: insert_platform_customer_one(object: $object) {
         id: keycloakId
      }
   }
`
export const CREATE_CUSTOMER = `
mutation createCustomer($object: crm_customer_insert_input!) {
   createCustomer(object: $object) {
      id
      keycloakId
   }
}
`
export const INSERT_BRAND_CUSTOMER_ID_DEVICE_ID = `
   mutation INSERT_BRAND_CUSTOMER_ID_DEVICE_ID(
      $object: crm_brand_customer_device_insert_input!
   ) {
      insert_crm_brand_customer_device_one(object: $object) {
         brandCustomerId
         mobileDeviceId
      }
   }
`
export const INSERT_BRAND_CUSTOMER = `
mutation INSERT_BRAND_CUSTOMER($object: crm_brand_customer_insert_input!) {
   createBrandCustomer(object: $object) {
     keycloakId
     id
   }
 }
`
