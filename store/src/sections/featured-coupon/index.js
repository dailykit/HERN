import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { COUPON_BY_ID } from '../../graphql'
import { isEmpty } from 'lodash'
import Link from 'next/link'

export const FeaturedCoupon = ({ config }) => {
   const couponConfig = {
      couponId: config.Coupon.couponId.value,
      heading: config.Coupon.heading.value,
      backgroundImage: config.Coupon.backgroundImage.value,
      backgroundImageSmall: config.Coupon.backgroundImageSmall.value,
      callToActionURL:
         config.Coupon['Call to action ']['Call to action URL'].value,
      ctaButtonLabel: config.Coupon['Call to action '].label.value,
   }

   const {
      loading,
      error,
      data: { coupon = {} } = {},
   } = useQuery(COUPON_BY_ID, {
      skip: !couponConfig.couponId,
      variables: {
         id: couponConfig.couponId,
      },
   })

   if (error) {
      console.error(error)
      return null
   }
   if (!loading && !couponConfig.couponId) return null

   return (
      <div className="hern-featured-coupon">
         <div className="hern-featured-coupon__background">
            <img src={couponConfig.backgroundImage} alt="" />
            <img
               className="hern-featured-coupon__background--sm"
               src={couponConfig.backgroundImageSmall}
               alt=""
            />
         </div>
         <div className="hern-featured-coupon__content">
            {!loading && !isEmpty(coupon) && (
               <>
                  <h2 className="hern-featured-coupon__header">
                     {couponConfig.heading}
                  </h2>
                  <div className="hern-featured-coupon__description">
                     <h4 className="hern-featured-coupon__title">
                        {coupon.metaDetails.description}
                     </h4>
                     <h4 className="hern-featured-coupon__code">
                        Use Code : <span>{coupon.code}</span>
                     </h4>
                  </div>
                  <div className="hern-featured-coupon__cta">
                     <Link href={couponConfig.callToActionURL}>
                        <a>
                           <button>{couponConfig.ctaButtonLabel}</button>
                        </a>
                     </Link>
                  </div>
               </>
            )}
         </div>
      </div>
   )
}
