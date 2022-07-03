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
