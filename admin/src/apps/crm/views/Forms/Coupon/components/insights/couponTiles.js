import React, { useState } from 'react'
import { BrandShopDateContext } from '../../../../../../../shared/components/BrandShopDateProvider/context'
import { useSubscription } from '@apollo/react-hooks'
import moment from 'moment'
import { SALES_BY_COUPONS } from '../../../../../graphql/subscriptions'
import styled from 'styled-components'
import { NoUnusedVariablesRule } from 'graphql'
import { currencyFmt } from '../../../../../../../shared/utils'
export const CouponTiles = ({ couponId }) => {
   const { brandShopDateState } = React.useContext(BrandShopDateContext)

   const { from, to, currency, brandShop } = brandShopDateState
   const [couponInsightDetails, setCouponsInsightDetails] = React.useState(
      NoUnusedVariablesRule
   )
   const [couponStatus, setCouponStatus] = useState('loading')
   const {
      loading: subsLoading,
      error: subsError,
      data: { insights_analytics = [] } = {},
   } = useSubscription(SALES_BY_COUPONS, {
      variables: {
         args: {
            params: {
               where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
                  from !== moment('2017 - 01 - 01') &&
                  `AND oo.created_at >= '${from}'`
               } ${
                  from !== moment('2017 - 01 - 01') &&
                  `AND oo.created_at < '${to}'`
               } ${
                  brandShop.brandId
                     ? `AND oo."brandId" = ${brandShop.brandId}`
                     : ''
               } ${
                  brandShop.shopTitle
                     ? `AND oc.source = \'${brandShop.shopTitle}\'`
                     : ''
               } ${
                  brandShop.locationId
                     ? `AND oc."locationId" = ${brandShop.locationId}`
                     : ''
               }`,
               couponWhere: `id = ${couponId}`,
            },
         },
      },
      onSubscriptionData: ({ subscriptionData }) => {
         const newData =
            subscriptionData.data.insights_analytics[0].getEarningByCoupons.map(
               each => {
                  each.startTimeStamp = each.couponStartTimeStamp
                     ? moment(each.couponStartTimeStamp).format(
                          'DD-MMM-YYYY HH:mm'
                       )
                     : 'N/A'
                  each.endTimeStamp = each.couponEndTimeStamp
                     ? moment(each.couponEndTimeStamp).format(
                          'DD-MMM-YYYY HH:mm'
                       )
                     : 'N/A'
                  return each
               }
            )
         console.log('couponData', newData)
         setCouponsInsightDetails(newData)
         setCouponStatus('success')
      },
   })
   return (
      <Styles.Cards>
         <Styles.Card>
            <span>Sales By Coupon</span>
            <span
               style={{
                  color: '#367BF5',
                  fontWeight: '500',
                  fontsize: '36px',
                  lineHeight: '42px',
               }}
            >
               {subsLoading || couponStatus === 'loading'
                  ? '...'
                  : subsError
                  ? 'Data not found'
                  : currencyFmt(couponInsightDetails[0].totalEarning)}
            </span>
         </Styles.Card>
         <Styles.Card>
            <span>Coupon Used</span>
            <span
               style={{
                  color: '#367BF5',
                  fontWeight: '500',
                  fontsize: '36px',
                  lineHeight: '42px',
               }}
            >
               {subsLoading || couponStatus === 'loading'
                  ? '...'
                  : subsError
                  ? 'Data not found'
                  : couponInsightDetails[0].count}
            </span>
         </Styles.Card>
      </Styles.Cards>
   )
}
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
