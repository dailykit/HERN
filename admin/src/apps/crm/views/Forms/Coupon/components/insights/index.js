import React from 'react'
import BrandShopDate from '../../../../../../../shared/components/BrandShopDateProvider'
import { CouponTiles } from './couponTiles'

const CouponInsights = ({ couponId }) => {
   return (
      <BrandShopDate
         brandProvider
         shopTypeProvider
         datePickerProvider
         locationProvider
      >
         <CouponTiles couponId={couponId} />
      </BrandShopDate>
   )
}
export default CouponInsights
