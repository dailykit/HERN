import { useSubscription } from '@apollo/react-hooks'
import moment from 'moment'
import React from 'react'
import styled from 'styled-components'
import { BrandShopDateContext } from '../../../../../../../shared/components/BrandShopDateProvider/context'
import { currencyFmt } from '../../../../../../../shared/utils'
import { CAMPAIGN_INSIGHTS } from '../../../../../graphql/subscriptions'

const CampaignTiles = ({ campaignId }) => {
   const { brandShopDateState } = React.useContext(BrandShopDateContext)

   const { from, to, brandShop } = brandShopDateState

   const { data, loading, error } = useSubscription(CAMPAIGN_INSIGHTS, {
      variables: {
         where: {
            id: {
               _eq: campaignId,
            },
            created_at: {
               _gte: from,
               _lte: moment(to).add(1, 'day').format('YYYY-MM-DD'),
            },
         },
         rewardWhere: {
            brandId: {
               ...(brandShop.brandId
                  ? { _eq: brandShop.brandId }
                  : { _is_null: false }),
            },
         },
      },
   })

   return (
      <Styles.Cards>
         <Styles.Card>
            <span>Campaign Reward</span>
            <span
               style={{
                  color: '#367BF5',
                  fontWeight: '500',
                  fontsize: '36px',
                  lineHeight: '42px',
               }}
            >
               {loading
                  ? '...'
                  : error
                  ? 'Data not found'
                  : data.campaigns.length === 0
                  ? 0
                  : data.campaigns[0].rewardHistories_aggregate.aggregate
                       .count}{' '}
               times
            </span>
         </Styles.Card>

         <Styles.Card>
            <span>Total Wallet Amount Reward</span>
            <span
               style={{
                  color: '#367BF5',
                  fontWeight: '500',
                  fontsize: '36px',
                  lineHeight: '42px',
               }}
            >
               {loading
                  ? '...'
                  : error
                  ? 'Data not found'
                  : data.campaigns.length === 0
                  ? currencyFmt(0)
                  : currencyFmt(
                       data.campaigns[0].rewardHistories_aggregate.aggregate.sum
                          .walletAmount || 0
                    )}
            </span>
         </Styles.Card>
         <Styles.Card>
            <span>Total Loyalty points Reward</span>
            <span
               style={{
                  color: '#367BF5',
                  fontWeight: '500',
                  fontsize: '36px',
                  lineHeight: '42px',
               }}
            >
               {loading
                  ? '...'
                  : error
                  ? 'Data not found'
                  : data.campaigns.length === 0
                  ? 0
                  : data.campaigns[0].rewardHistories_aggregate.aggregate.sum
                       .loyaltyPoints || 0}
            </span>
         </Styles.Card>
      </Styles.Cards>
   )
}
export default CampaignTiles
const Styles = {
   Card: styled.div`
      width: 270px;
      height: 130px;
      background: #f9f9f9;
      border-radius: 15px;
      margin-bottom: 16px;
      padding: 15px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      span {
         font-weight: 500;
         font-size: 28px;
         line-height: 33px;
         letter-spacing: 0.44px;
      }
   `,
   Cards: styled.div`
      display: grid;
      margin-top: 16px;
      @media screen and (min-width: 480px) {
         grid-template-columns: 1fr;
      }
      @media screen and (min-width: 768px) {
         grid-template-columns: 1fr 1fr;
      }
      @media screen and (min-width: 1280px) {
         grid-template-columns: 1fr 1fr 1fr 1fr;
      }
      @media screen and (min-width: 1440px) {
         grid-template-columns: repeat(auto, 1fr);
      }
   `,
}
