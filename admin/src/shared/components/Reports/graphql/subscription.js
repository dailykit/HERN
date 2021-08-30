import gql from 'graphql-tag'

export const EARNING_BY_PRODUCT = gql`
   subscription EARNING_BY_PRODUCT(
      $earningByProductArgs: insights_getEarningByProducts_args!
   ) {
      insights_analytics {
         getEarningsByProducts(args: $earningByProductArgs)
      }
   }
`
