import React from 'react'
import { PRODUCTS } from '../../graphql'
import { useQuery } from '@apollo/react-hooks'
import { useConfig } from '../../lib'
import { Button, Loader } from '../../components'
import { Carousel, Row, Col } from 'antd'
import { ProductCard } from '../../components/product_card'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
import { useRouter } from 'next/router'
import { getRoute } from '../../utils'
import { CustomArea } from '../featuredCollection/productCustomArea'

export const ProductGallery = ({ config }) => {
   const [productsData, setProductsData] = React.useState([])
   const [productOrientation, setProductOrientation] = React.useState(
      config.informationVisibility.productOrientation.value[0].value
   )
   const [status, setStatus] = React.useState('loading')
   const { brand, locationId } = useConfig()
   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: locationId,
         },
      }),
      [brand]
   )
   const { loading: productsLoading, error: productsError } = useQuery(
      PRODUCTS,
      {
         variables: {
            ids: config.data.products.value,
            priceArgs: argsForByLocation,
            discountArgs: argsForByLocation,
            defaultCartItemArgs: argsForByLocation,
            productOptionPriceArgs: argsForByLocation,
            productOptionDiscountArgs: argsForByLocation,
            productOptionCartItemArgs: argsForByLocation,
            modifierCategoryOptionPriceArgs: argsForByLocation,
            modifierCategoryOptionDiscountArgs: argsForByLocation,
            modifierCategoryOptionCartItemArgs: argsForByLocation,
         },
         fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data && data.products.length) {
               const productsData = data.products
               setProductsData(productsData)
               setStatus('success')
            }
         },
         onError: error => {
            setStatus('error')
            console.log('Error: ', error)
         },
      }
   )

   if (status == 'loading') return <Loader inline />
   if (status == 'error') return <p>Something went wrong</p>
   return (
      <>
         <div className="hern-product_gallery-header">
            <h3 className="hern-product_gallery-header-heading">
               {config.data.title.value}
            </h3>
            <h5 className="hern-product_gallery-header-description">
               {config.data.subTitle.value}
            </h5>
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
            </>
         ) : (
            <Loader />
         )}
      </>
   )
}

const ProductGrid = ({ product, index }) => {
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
         showProductDescription={true}
         showImage={product.assets.images.length > 0 ? true : false}
         customAreaComponent={CustomAreaWrapper}
         showModifier={productModifier && productModifier.id === product.id}
         closeModifier={closeModifier}
         customAreaFlex={false}
      />
   )
}

const ProductSlider = ({ config, productsData }) => {
   const numberOfProductsToShow =
      config?.informationVisibility.numberOfProductsToShow.value
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
      >
         {sliderProducts.map((productsArray, index) => {
            return <SliderDiv productsArray={productsArray} />
         })}
      </Carousel>
   )
}

const SliderDiv = ({ productsArray }) => {
   return (
      <Row
         gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
         style={{ justifyContent: 'center', margin: '0 7em 0 7em' }}
      >
         {productsArray.map((product, index) => {
            return (
               <Col className="gutter-row" span={6}>
                  <div>
                     <ProductGrid product={product} index={index} />
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
