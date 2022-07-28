import React, { useEffect } from 'react'
import { useQuery, useSubscription } from '@apollo/react-hooks'
import { Carousel, Col, Row } from 'antd'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
import { Loader } from '../../components'
import { ProductCard } from '../../components/product_card'
import { PRODUCTS } from '../../graphql'
import { useConfig } from '../../lib'
import { getRoute, isClient, setThemeVariable } from '../../utils'
import { CustomArea } from '../featuredCollection/productCustomArea'

export const ProductGallery = ({ config }) => {
   const [productsData, setProductsData] = React.useState([])
   const [productOrientation, setProductOrientation] = React.useState(
      config.informationVisibility.productOrientation.value.value
   )
   const [status, setStatus] = React.useState('loading')
   const { brand, locationId, brandLocation } = useConfig()

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )
   const { loading: productsLoading, error: productsError } = useSubscription(
      PRODUCTS,
      {
         variables: {
            ids: config.data.products.value,
            params: argsForByLocation,
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const { data } = subscriptionData
            if (data && data.products.length) {
               const productsData = data.products
               setProductsData(productsData)
               setStatus('success')
            }
         },
      }
   )
   React.useEffect(() => {
      if (productsError) {
         setStatus('error')
      }
   }, [productsError])
   // Setting arrows active color into root variables
   setThemeVariable(
      '--arrow-active-color',
      config?.data?.arrowActiveColor?.value
   )

   if (status == 'loading') return <Loader inline />
   if (status == 'error')
      return (
         <div className="hern-product-galllery__something-went-wrong">
            Opps!
            <br /> Something went wrong while loading products. <br />
            <button
               onClick={() => {
                  if (isClient) {
                     window.location.reload()
                  }
               }}
            >
               Reload
            </button>
         </div>
      )
   return (
      <div
         className={classNames('hern-product_gallery__container', {
            'hern-product-gallery__product__display--1':
               config?.informationVisibility?.productDetailType?.value?.value,
         })}
      >
         <div className="hern-product_gallery-header">
            <h3
               className={
                  config?.informationVisibility?.headingStyleType?.value
                     ?.value || 'hern-product_gallery-header-heading'
               }
            >
               {config.data.title.value}
            </h3>
            {config?.data?.subTitle?.value && (
               <h5 className="hern-product_gallery-header-description">
                  {config.data.subTitle.value}
               </h5>
            )}
         </div>
         {productsData.length ? (
            <>
               {productOrientation == 'slide' ? (
                  <ProductSlider config={config} productsData={productsData} />
               ) : (
                  <Row
                     gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                     style={{
                        justifyContent: 'center',
                        margin: '0 7em 0 7em',
                     }}
                  >
                     {productsData.map((product, index) => {
                        return (
                           <Col lg={6} md={12} sm={24}>
                              <div>
                                 <ProductGrid product={product} index={index} />
                              </div>
                           </Col>
                        )
                     })}
                  </Row>
               )}
               {config?.informationVisibility?.showPageButton?.value && (
                  <Row
                     style={{
                        justifyContent: 'center',
                        margin: '20px 0px',
                     }}
                  >
                     <Col span={24} style={{ textAlign: 'center' }}>
                        <a
                           class="hern-product_gallery_page-button"
                           href={
                              config?.data?.pageButton?.route?.value ||
                              config?.data?.pageButton?.route?.default
                           }
                        >
                           {config.data.pageButton.title.value ||
                              config.data.pageButton.title.default}
                        </a>
                     </Col>
                  </Row>
               )}
            </>
         ) : (
            <Loader />
         )}
      </div>
   )
}

const ProductGrid = ({ config, product, index }) => {
   const { locationId, storeStatus } = useConfig()
   const router = useRouter()
   const [productModifier, setProductModifier] = React.useState(null)
   const CustomAreaWrapper = ({ data }) => {
      return <CustomArea data={data} setProductModifier={setProductModifier} />
   }

   const closeModifier = () => {
      setProductModifier(null)
   }
   return (
      <ProductCard
         onProductNameClick={() =>
            router.push(getRoute('/products/' + product.id))
         }
         onImageClick={() => router.push(getRoute('/products/' + product.id))}
         key={index}
         data={product}
         //showImage={product.assets.images.length > 0 ? true : false}
         customAreaComponent={
            (!config?.informationVisibility?.showAddButtonInProduct &&
               CustomAreaWrapper) ||
            (config?.informationVisibility?.showAddButtonInProduct?.value &&
               CustomAreaWrapper)
         }
         showModifier={productModifier && productModifier.id === product.id}
         closeModifier={closeModifier}
         customAreaFlex={false}
         showSliderIndicators={
            config?.informationVisibility?.showSliderIndicators?.value
         }
         showSliderArrows={
            config?.informationVisibility?.showSliderArrows?.value
         }
         productDetailType={
            config?.informationVisibility?.productDetailType?.value?.value
         }
         showProductDescription={
            config?.informationVisibility?.showProductDescription?.value ||
            !config?.informationVisibility?.showProductDescription
         }
      />
   )
}

const isMobile = () => {
   if (window.innerWidth <= 599) {
      return true
   }
   return false
}

const isTab = () => {
   if (window.innerWidth > 599 && window.innerWidth <= 1024) {
      return true
   }
   return false
}

const ProductSlider = ({ config, productsData }) => {
   let numberOfProductsToShow
   if (isMobile() || isTab()) {
      numberOfProductsToShow = 1
   } else {
      numberOfProductsToShow =
         config?.informationVisibility.numberOfProductsToShow.value
   }
   const numberOfSliders = Math.ceil(
      productsData.length / numberOfProductsToShow
   )
   const sliderProducts = []
   let productIndex = 0
   for (let i = 0; i < numberOfSliders; i++) {
      const singleSliderProducts = []
      for (let j = 0; j < numberOfProductsToShow; j++) {
         if (productsData[productIndex]) {
            singleSliderProducts.push(productsData[productIndex])
         }
         productIndex += 1
      }
      sliderProducts.push(singleSliderProducts)
   }
   return (
      <Carousel
         className="hern-product_gallery-carousel"
         arrows
         prevArrow={<LeftArrow />}
         nextArrow={<RightArrow />}
         responsive={[
            {
               breakpoint: 1024,
               settings: {
                  slidesToShow: 1,
                  initialSlide: 1,
               },
            },
            {
               breakpoint: 599,
               settings: {
                  slidesToShow: 1,
               },
            },
            {
               breakpoint: 480,
               settings: {
                  slidesToShow: 1,
               },
            },
         ]}
      >
         {sliderProducts.map((productsArray, index) => {
            return <SliderDiv productsArray={productsArray} config={config} />
         })}
      </Carousel>
   )
}

const SliderDiv = ({ config, productsArray }) => {
   return (
      <Row
         gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
         style={{ justifyContent: 'center', margin: '0 7em 0 7em' }}
      >
         {productsArray.map((product, index) => {
            return (
               <Col
                  className="gutter-row"
                  span={isMobile() || isTab() ? 12 : 6}
               >
                  <div>
                     <ProductGrid
                        product={product}
                        index={index}
                        config={config}
                     />
                  </div>
               </Col>
            )
         })}
      </Row>
   )
}

const LeftArrow = ({ ...props }) => {
   return (
      <div {...props} className="hern-product_gallery-left_arrow">
         <ArrowLeftIcon color="white" size="35" />
      </div>
   )
}

const RightArrow = ({ ...props }) => {
   return (
      <div {...props} className="hern-product_gallery-right_arrow">
         <ArrowRightIcon color="white" size="35" />
      </div>
   )
}
