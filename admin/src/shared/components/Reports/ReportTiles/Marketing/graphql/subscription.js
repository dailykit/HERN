import gql from 'graphql-tag'

export const MARKETING_EARNING = gql`
   subscription MARKETING_EARNING($where: order_order_bool_exp!) {
      ordersAggregate(where: $where) {
         aggregate {
            sum {
               amountPaid
            }
         }
      }
   }
`
export const SALES_BY_COUPONS = gql`
   subscription SALES_BY_COUPONS(
      $args: getEarningByCoupons_insights_analytics_args!
   ) {
      insights_analytics {
         getEarningByCoupons(args: $args)
      }
   }
`
export const CAMPAIGN_INSIGHTS = gql`
   subscription CAMPAIGN_INSIGHTS(
      $where: crm_campaign_bool_exp!
      $rewardWhere: crm_rewardHistory_bool_exp!
   ) {
      campaigns(
         where: $where
         order_by: { rewardHistories_aggregate: { count: desc } }
      ) {
         id
         rewardHistories_aggregate(where: $rewardWhere) {
            aggregate {
               count
               sum {
                  walletAmount
                  loyaltyPoints
               }
            }
         }
         metaDetails
         type
         rewards {
            type
         }
      }
   }
`
