import { useQuery, useSubscription } from '@apollo/react-hooks'
import React, { useState, useEffect } from 'react'
import { Loader } from '../..'
import { PRODUCTS } from '../../../graphql'
import { useConfig } from '../../../lib'
import isEmpty from 'lodash/isEmpty'
import { formatCurrency } from '../../../utils'
import { useCart, useTranslation } from '../../../context'
import KioskButton from './button'
import classNames from 'classnames'
import { Carousel } from 'antd'
import {
   ArrowLeftIcon,
   ArrowRightIcon,
   ProductGalleryBG,
} from '../../../assets/icons'
import { HernLazyImage } from '../../../utils/hernImage'

export const ProductGalleryKiosk = ({ config }) => {
   const { brand, isConfigLoading, kioskDetails, configOf, brandLocation } =
      useConfig()
   const { locale, dynamicTrans, t } = useTranslation()

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: kioskDetails?.locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, kioskDetails?.locationId, brandLocation?.id]
   )

   const theme = configOf('theme-color', 'Visual')
   const [products, setProducts] = useState(null)
   const [status, setStatus] = useState('loading')
   // get all products from productIds getting from PRODUCT_BY_CATEGORY

   const carousalRef = React.useRef()

   const lastCarousal = e => {
      e.stopPropagation()
      carousalRef.current.prev()
   }
   const nextCarousal = e => {
      e.stopPropagation()
      carousalRef.current.next()
   }

   useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [locale])

   const { loading: productsLoading, error: productsError } = useQuery(
      PRODUCTS,
      {
         skip:
            !config.productGallery.showProductGallery.value || isConfigLoading,
         variables: {
            ids: config.productGallery.products.value,
            params: argsForByLocation,
         },
         // fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data && data.products.length > 0) {
               setProducts(data.products)
               setStatus('success')
            }
         },
         onError: error => {
            setStatus('error')
            console.log('Error: ', error)
         },
      }
   )

   if (!config.productGallery.showProductGallery.value) {
      return null
   }
   if (status == 'loading') {
      return <Loader inline />
   }
   if (status == 'error') {
      return <p>{t('Something went wrong')}</p>
   }
   return (
      <div className="hern-kiosk__product-gallery-container">
         <div
            className="hern-kiosk__product-gallery-background"
            style={{
               background: `url(${config?.productGallery?.productGalleryBackgroundImage?.value})`,
            }}
         >
            {/* <ProductGalleryBG
               fill={
                  config?.kioskSettings?.theme?.secondaryColorLight?.value ||
                  theme?.accent
               }
            /> */}
            <img
               src={
                  config?.productGallery?.productGalleryBackgroundImage?.value
               }
            />
         </div>
         <label
            className="hern-kiosk__product-gallery-title"
            data-translation="true"
         >
            {config?.productGallery.productGalleryTitle?.value}
         </label>
         <div className="hern-kiosk__product-gallery">
            <ArrowLeftIcon
               className="hern-kiosk__menu-carousal-left-arrow hern-kiosk__menu-carousal-arrow"
               size={36}
               onClick={lastCarousal}
               style={{
                  backgroundColor: `${
                     config?.kioskSettings?.theme?.arrowBgColor?.value ||
                     theme?.accent
                  }99`,
                  color: `${
                     config?.kioskSettings?.theme?.arrowColor?.value ||
                     '#000000'
                  }`,
               }}
            />
            <ArrowRightIcon
               className="hern-kiosk__menu-carousal-right-arrow hern-kiosk__menu-carousal-arrow"
               size={36}
               onClick={nextCarousal}
               style={{
                  backgroundColor: `${
                     config?.kioskSettings?.theme?.arrowBgColor?.value ||
                     theme?.accent
                  }99`,
                  color: `${
                     config?.kioskSettings?.theme?.arrowColor?.value ||
                     '#000000'
                  }`,
               }}
            />
            <Carousel
               ref={carousalRef}
               slidesToShow={4}
               slidesToScroll={4}
               infinite={false}
            >
               {products.map(eachProduct => {
                  return (
                     <ProductGalleryCard
                        product={eachProduct}
                        key={eachProduct.id}
                        config={config}
                     />
                  )
               })}
            </Carousel>
         </div>
      </div>
   )
}

const ProductGalleryCard = ({ product, config }) => {
   const { locale, dynamicTrans, t, direction } = useTranslation()
   const { addToCart } = useCart()

   useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [locale])

   let totalPrice = 0
   let totalDiscount = 0
   const price = product => {
      if (!isEmpty(product)) {
         totalPrice += product.unitPrice
         totalDiscount += product.discount
         if (!isEmpty(product.childs) && !isEmpty(product.childs.data)) {
            price(product.childs.data[0])
         }
         return {
            totalPrice: totalPrice,
            totalDiscount: totalDiscount,
         }
      }
   }
   const getTotalPrice = React.useMemo(
      () => price(product.defaultCartItem),
      [product]
   )

   return (
      <div className="hern-kiosk__product-gallery-card" dir={direction}>
         <HernLazyImage
            dataSrc={product.assets.images[0]}
            alt="p-image"
            className="hern-kiosk__product-gallery-p-image"
            width={115}
            height={115}
            style={{
               ...(config.kioskSettings.allowTilt.value && {
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 97%)',
               }),
            }}
         />
         <div className="hern-kiosk__product-card-details">
            <span
               className="hern-kiosk__product-gallery-product-name"
               data-translation="true"
            >
               {product.name}
            </span>
            <span className="hern-kiosk__product-gallery-product-price">
               {getTotalPrice.totalDiscount > 0 && (
                  <span style={{ textDecoration: 'line-through' }}>
                     {' '}
                     {formatCurrency(getTotalPrice.totalPrice)}
                  </span>
               )}
               {formatCurrency(
                  getTotalPrice.totalPrice - getTotalPrice.totalDiscount
               )}
            </span>
         </div>
         <KioskButton
            customClass={classNames('hern-kiosk__product-gallery-add-btn', {
               'hern-kiosk__product-gallery-add-btn-ltr': direction === 'ltr',
               'hern-kiosk__product-gallery-add-btn-rtl': direction === 'rtl',
            })}
            buttonConfig={config.kioskSettings.buttonSettings}
            onClick={() => {
               addToCart(product.defaultCartItem, 1)
            }}
         >
            {t('Add')}
         </KioskButton>
      </div>
   )
}
