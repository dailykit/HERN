export const INSERT_CUSTOMER = `
   mutation insertCustomer($object: platform_customer_insert_input!) {
      insertCustomer: insert_platform_customer_one(object: $object) {
         id: keycloakId
      }
   }
`
