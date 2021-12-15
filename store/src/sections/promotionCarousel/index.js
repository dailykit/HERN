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
   if (data.coupons.length === 0) {
      return <p> No Coupons available</p>
   }

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
            {data.coupons.map(eachCoupons => {
               if (!eachCoupons.metaDetails?.image) {
                  return null
               }
               return (
                  <img
                     src={eachCoupons.metaDetails.image}
                     key={eachCoupons.id}
                     style={{ height: 'inherit', padding: '1em' }}
                  />
               )
            })}
            {componentConfig.data.promotionImages.value.map(
               (eachImage, index) => {
                  return (
                     <img
                        src={eachImage.url}
                        key={index}
                        style={{ height: 'inherit', padding: '1em' }}
                     />
                  )
               }
            )}
         </Carousel>
      </div>
   )
}
