import gql from 'graphql-tag'

export const RECENT_ORDERS = gql`
   subscription RECENT_ORDERS($where: order_order_bool_exp = {}) {
      orders(
         order_by: { created_at: desc_nulls_last }
         limit: 10
         where: $where
      ) {
         id
         created_at
         cart {
            status
            customerInfo
         }
      }
   }
`
export const SUBSCRIBERS_LIST = gql`
   subscription SUBSCRIBERS_LIST($where: crm_brand_customer_bool_exp = {}) {
      brandCustomers(where: $where, limit: 10) {
         customer {
            platform_customer {
               created_at
               fullName
               email
            }
         }
      }
   }
`
export const TOP_CUSTOMERS = gql`
   subscription TOP_CUSTOMERS(
      $topCustomersArgs: insights_getTopCustomers_args!
   ) {
      insights_analytics {
         getTopCustomers(args: $topCustomersArgs)
         id
      }
   }
`
export const RECIPE_SUMMARY = gql`
   subscription RECIPE_SUMMARY(
      $recipeSummaryArgs: insights_getRecipeSummary_args!
   ) {
      insights_analytics {
         getTopRecipes(args: $recipeSummaryArgs)
      }
   }
`
export const ORDER_OPPORTUNITY = gql`
   query ORDER_OPPORTUNITY(
      $brandCustomerFilter: FullOccurenceReportCrmBrandCustomerBoolExp!
   ) {
      FullOccurenceReport(brandCustomerFilter: $brandCustomerFilter) {
         orderId
         fullName
         fulfillmentDate
         email
         percentagePaused
         percentageSkipped
      }
   }
`
export const TOP_PRODUCT_LIST = gql`
   subscription TOP_PRODUCT_LIST(
      $topProductArgs: insights_getTopProducts_args!
   ) {
      insights_analytics {
         getTopProducts(args: $topProductArgs)
      }
   }
`
