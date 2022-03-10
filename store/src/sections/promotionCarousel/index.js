import { useSubscription } from '@apollo/react-hooks'
import { Carousel } from 'antd'
import React from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
import { Loader } from '../../components'
import { COUPONS } from '../../graphql'
import { useConfig } from '../../lib'

export const PromotionCarousal = props => {
   const { config: componentConfig } = props
   const { brand } = useConfig()
   const { configOf } = useConfig()

   const carousalRef = React.useRef()

   const lastCarousal = e => {
      e.stopPropagation()
      carousalRef.current.prev()
   }
   const nextCarousal = e => {
      e.stopPropagation()
      carousalRef.current.next()
   }
   const {
      loading: subsLoading,
      error: subsError,
      data,
   } = useSubscription(COUPONS, {
      variables: {
         params: {},
         brandId: brand?.id,
      },
   })
   const theme = configOf('theme-color', 'Visual')
   if (subsLoading) {
      return <Loader inline />
   }
   if (subsError) {
      return <p>Something went wrong</p>
   }
   // if (data.coupons.length === 0) {
   //    return <p> No Coupons available</p>
   // }

   return (
      <div style={{ height: 'inherit', width: '100%' }}>
         <ArrowLeftIcon
            className="hern-kiosk__menu-carousal-left-arrow hern-kiosk__menu-carousal-arrow"
            size={42}
            onClick={lastCarousal}
            style={{
               backgroundColor: `${
                  componentConfig?.kioskSettings?.theme?.secondaryColor
                     ?.value || theme?.accent
               }99`,
            }}
         />
         <ArrowRightIcon
            className="hern-kiosk__menu-carousal-right-arrow hern-kiosk__menu-carousal-arrow"
            size={42}
            onClick={nextCarousal}
            style={{
               backgroundColor: `${
                  componentConfig?.kioskSettings?.theme?.secondaryColor
                     ?.value || theme?.accent
               }99`,
            }}
         />
         <Carousel ref={carousalRef} slidesToShow={2} slidesToScroll={2}>
            {data.coupons.map(eachCoupon => {
               if (!eachCoupon.metaDetails?.image) {
                  return null
               }
               return (
                  <div
                     className="hern-kiosk__promotion-image"
                     key={eachCoupon.id}
                  >
                     <img
                        src={eachCoupon.metaDetails.image}
                        style={{ padding: '1em' }}
                     />
                  </div>
               )
            })}
            {componentConfig.data.promotionImages.value.url.map(
               (eachImage, index) => {
                  return (
                     <div
                        className="hern-kiosk__promotion-image"
                        key={eachImage}
                     >
                        <img src={eachImage} style={{ padding: '1em' }} />
                     </div>
                  )
               }
            )}
         </Carousel>
      </div>
   )
}
