import { useQuery, useSubscription } from '@apollo/react-hooks'
import { Carousel } from 'antd'
import React, { useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
import { Loader } from '../../components'
import { COUPONS, PRODUCTS } from '../../graphql'
import { useConfig } from '../../lib'
import { useCart } from '../../context'
import { KioskModifier } from '../../components/kiosk/component'
import { HernLazyImage } from '../../utils/hernImage'

export const PromotionCarousal = props => {
   const { config: componentConfig } = props
   const { brand, locationId, brandLocation } = useConfig()
   const { configOf, isStoreAvailable } = useConfig()
   const { addToCart } = useCart()

   const carousalRef = React.useRef()
   const [showModifierPopup, setShowModifierPopup] = useState(false)
   const [productData, setProductData] = useState(null)

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
   // get all products from productIds getting from PRODUCT_BY_CATEGORY

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )

   // take all productIds from promotion carousal images
   const productIds = React.useMemo(() => {
      if (
         componentConfig.data.promotionImageWithEvent?.value?.images?.length > 0
      ) {
         const ids = componentConfig.data.promotionImageWithEvent?.value?.images
            ?.map(eachImage => {
               if (eachImage.belongsTo === 'PRODUCT') {
                  return eachImage.productId
               } else {
                  return null
               }
            })
            .filter(eachId => eachId !== null)
         return ids
      } else {
         return []
      }
   }, [componentConfig])

   const { data: productsData } = useQuery(PRODUCTS, {
      skip: productIds?.length === 0,
      variables: {
         ids: productIds,
         params: argsForByLocation,
      },
   })
   console.log('productsData: ', productsData, productIds)
   const theme = configOf('theme-color', 'Visual')
   const onImageClick = imageDetail => {
      if (imageDetail.belongsTo === 'PRODUCT') {
         if (imageDetail.productId) {
            const clickedProduct = productsData.products.find(
               product => product.id == imageDetail.productId
            )
            const isProductAvailable =
               clickedProduct?.isAvailable && clickedProduct?.isPublished

            if (clickedProduct && isProductAvailable) {
               if (
                  clickedProduct.productOptions.length > 0 &&
                  clickedProduct.isPopupAllowed
               ) {
                  const isProductOptionsAvailable =
                  clickedProduct.productOptions.filter(
                        option => option.isPublished && option.isAvailable
                     ).length > 0
                  if (isProductOptionsAvailable) {
                     setShowModifierPopup(true)
                     setProductData(clickedProduct)
                  }
               } else {
                  if (isStoreAvailable) {
                     addToCart(clickedProduct.defaultCartItem, 1)
                  }
               }
            }
         }
      }
   }
   if (subsLoading) {
      return (
         <div style={{ height: '235.5px', width: '100%', display: 'flex' }}>
            <div className="hern-kiosk__promotion-carousel-skeleton"></div>
            <div className="hern-kiosk__promotion-carousel-skeleton"></div>
         </div>
      )
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
                  componentConfig?.kioskSettings?.theme?.arrowBgColor?.value ||
                  theme?.accent
               }99`,
               color: `${
                  componentConfig?.kioskSettings?.theme?.arrowColor?.value ||
                  '#000000'
               }`,
            }}
         />
         <ArrowRightIcon
            className="hern-kiosk__menu-carousal-right-arrow hern-kiosk__menu-carousal-arrow"
            size={42}
            onClick={nextCarousal}
            style={{
               backgroundColor: `${
                  componentConfig?.kioskSettings?.theme?.arrowBgColor?.value ||
                  theme?.accent
               }99`,
               color: `${
                  componentConfig?.kioskSettings?.theme?.arrowColor?.value ||
                  '#000000'
               }`,
            }}
         />
         <Carousel
            ref={carousalRef}
            slidesToShow={2}
            slidesToScroll={2}
            infinite={false}
            style={{ minHeight: '235px' }}
         >
            {data.coupons.map(eachCoupon => {
               if (!eachCoupon.metaDetails?.image) {
                  return null
               }
               return (
                  <div
                     className="hern-kiosk__promotion-image"
                     key={eachCoupon.id}
                  >
                     <HernLazyImage
                        dataSrc={eachCoupon.metaDetails.image}
                        style={{ padding: '1em' }}
                        height={225}
                        width={540}
                     />
                  </div>
               )
            })}
            {componentConfig.data.promotionImageWithEvent.value.images.map(
               (eachImage, index) => {
                  return (
                     <div
                        className="hern-kiosk__promotion-image"
                        key={eachImage.url + eachImage.belongsTo}
                     >
                        <HernLazyImage
                           dataSrc={eachImage.url}
                           style={{ padding: '1em' }}
                           onClick={() => {
                              onImageClick(eachImage)
                           }}
                           height={225}
                           width={540}
                        />
                     </div>
                  )
               }
            )}
            {componentConfig.data.promotionImages.value.url.map(
               (eachImage, index) => {
                  return (
                     <div
                        className="hern-kiosk__promotion-image"
                        key={eachImage}
                     >
                        <HernLazyImage
                           dataSrc={eachImage}
                           style={{ padding: '1em' }}
                           height={225}
                           width={540}
                        />
                     </div>
                  )
               }
            )}
         </Carousel>
         {showModifierPopup && productData && (
            <KioskModifier
               config={componentConfig}
               onCloseModifier={() => {
                  setShowModifierPopup(false)
                  setProductData(null)
               }}
               productData={productData}
               key={productData.id}
            />
         )}
      </div>
   )
}
