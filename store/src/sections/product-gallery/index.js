import React from 'react'
import {PRODUCTS} from '../../graphql'
import { useQuery } from '@apollo/react-hooks'
import { useConfig } from '../../lib'
import { Card } from 'antd'
import {Loader} from '../../components'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'

export const ProductGallery = ({config})=> {
    console.log('product gallery config', config)
    const [productsData, setProductsData] = React.useState([])
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
                 console.log(productsData)
                 setProductsData(productsData)
              }
           },
           onError: error => {
              setStatus('error')
              console.log('Error: ', error)
           },
        }
     )
    return (
        <>
            <div className="hern-product_gallery-header">
                <h3 className="hern-product_gallery-header-heading">POPULAR RECIPES</h3>
                <h5 className="hern-product_gallery-header-description">CHECKOUT SOME OF OUR MOST POPULAR DISHES FROM THE MENU</h5>
            </div>
            {productsData.length?
                <div className="hern-product_gallery-cards">
                    {productsData.map((product, index)=>{
                        return (
                        <Card size="small" style={{padding: "0 0.5em"}} bordered={false}>
                            <img className="hern-product_gallery-product-image" src={product.assets.images[0]} />
                            <h3 className="hern-product_category-product-name">{product.name}</h3>
                            <p className="hern-product_category-product-price">₹ {product.price}</p>
                        </Card>
                        )
                    })}
                </div>
            : <Loader />}
        </>
    )
}

