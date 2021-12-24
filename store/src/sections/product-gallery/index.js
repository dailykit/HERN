import React from 'react'
import {PRODUCTS} from '../../graphql'
import { useQuery } from '@apollo/react-hooks'
import { useConfig } from '../../lib'
import {Button, Loader} from '../../components'
import { Carousel, Row, Col } from 'antd'
import {ProductCard} from '../../components/product_card'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
export const ProductGallery = ({config})=> {
    console.log('product gallery config', config)
    const [productsData, setProductsData] = React.useState([])
    const [productOrientation, setProductOrientation] = React.useState(config.informationVisibility.productOrientation.value[0].value)
    const [status, setStatus] = React.useState('loading')
    const { brand } = useConfig()
    const argsForByLocation = React.useMemo(
        () => ({
           params: {
              brandId: brand?.id,
              locationId: 1000,
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
                 console.log('productsData',productsData)
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
     if (status=='loading') return <Loader inline />
    return (
        <>
            <div className="hern-product_gallery-header">
                <h3 className="hern-product_gallery-header-heading">POPULAR RECIPES</h3>
                <h5 className="hern-product_gallery-header-description">CHECKOUT SOME OF OUR MOST POPULAR DISHES FROM THE MENU</h5>
            </div>
            {productsData.length?
            <>
                {productOrientation=='slide'? 
                    <ProductSlider config={config} productsData={productsData} />
                    :
                    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} style={{justifyContent: 'center', margin: '0 7em 0 7em'}}>
                        {productsData.map((product, index)=>{
                            return (
                                
                                    <Col className="gutter-row" span={6}>
                                        <div>
                                            <ProductGrid product={product} index={index} />
                                        </div>
                                    </Col>
                                
                            )
                        })}
                    </Row>
                }
                
                
                </>
            : <Loader />}
        </>
    )
}

const ProductGrid = ({product, index}) => {
    const [productModifier, setProductModifier] = React.useState(null)
    const CustomArea = props => {
        const { data } = props
        return (
           <div className="hern-product_gallery-product-custom-area">
              <Button
                 className="hern-custom-area-add-btn"
                 type="outline"
                 onClick={() => {
                    if (data.productOptions.length > 0) {
                       setProductModifier(data)
                    } else {
                       console.log('product added to cart', data)
                       addToCart({ productId: data.id }, 1)
                    }
                 }}
              >
                 ADD
              </Button>
              {data.productOptions.length > 0 && <span>Customizable</span>}
           </div>
        )
     }
     const closeModifier = () => {
        setProductModifier(null)
     }
    return (
         
                <ProductCard
                    key={index}
                    data={product}
                    showProductDescription={true}
                    showImage={
                    product.assets.images
                        .length > 0
                        ? true
                        : false
                    }
                    customAreaComponent={CustomArea}
                    showModifier={
                        productModifier &&
                        productModifier.id ===
                           product.id
                     }
                     closeModifier={closeModifier}
                     customAreaFlex={false}
                />
                        
                            
    )
}

const ProductSlider = ({config, productsData}) => {
    const numberOfProductsToShow = config?.informationVisibility.numberOfProductsToShow.value
    const numberOfSliders = Math.ceil(productsData.length/numberOfProductsToShow)
    const sliderProducts = []
    let productIndex = 0
    for (let i=0;i<numberOfSliders;i++){
        const singleSliderProducts = []
        for (let j=0;j<numberOfProductsToShow;j++){
            if (productsData[productIndex]){
                singleSliderProducts.push(productsData[productIndex])
            }
            productIndex+=1
        }
        sliderProducts.push(singleSliderProducts)
    }
    return (
            <Carousel className="hern-product_gallery-carousel" arrows prevArrow={<LeftArrow />} nextArrow={<RightArrow />}>
                {sliderProducts.map((productsArray, index)=>{
                    return <SliderDiv productsArray={productsArray} />
                })}
            </Carousel>
    )
}

const SliderDiv = ({productsArray})=> {
    return (
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} style={{justifyContent: 'center', margin: '0 7em 0 7em'}}>
            {productsArray.map((product, index)=>{
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

const LeftArrow = ({...props})=> {
    return (
        <div {...props}  className="hern-product_gallery-left_arrow">
            <ArrowLeftIcon color="white" size="30" />
        </div>
    )
     
}

const RightArrow = ({...props})=> {
    return (
        <div {...props} className="hern-product_gallery-right_arrow">
            <ArrowRightIcon color="white" size="30" />
        </div>
    )
     
}