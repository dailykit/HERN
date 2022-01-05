import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { PRODUCT_DETAILS } from '../../graphql'
import { useConfig } from '../../lib'
import { Recipe, ProductCard, Loader } from '../../components'
import { useRouter } from 'next/router'
import ProductMedia from './ProductMedia'
import { VegNonVegType } from '../../assets/icons'

export const Product = ({ config }) => {
   const router = useRouter()
   const { id } = router.query
   const [status, setStatus] = React.useState('loading')
   const { brand } = useConfig()
   const [productDetails, setProductDetails] = React.useState({})

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
      PRODUCT_DETAILS,
      {
         skip: !id,
         variables: {
            id: Number(id),
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
               setStatus('success')
               setProductDetails(data.products[0])
            }
         },
         onError: error => {
            setStatus('error')
            console.log('Error: ', error)
         },
      }
   )
   if (productsLoading || status === 'loading') return <Loader />
   if (productsError) return <p>Something went wrong</p>

   return (
      <div className="hern-product-page">
         <div className="hern-product-page__product-section">
            <div className="hern-product-page__product-media-wrapper">
               <ProductMedia assets={productDetails?.assets} config={config} />
               <div className="hern-veg-non-veg-type">
                  <VegNonVegType
                     vegNonVegType={productDetails?.VegNonVegType}
                     size={38}
                  />
               </div>
            </div>
            <div className="hern-product-page__product-options-wrapper">
               <ProductCard
                  data={productDetails}
                  showProductPrice={false}
                  showProductDescription={false}
                  showImage={false}
                  showProductName={false}
                  closeModifier={() => console.log('close')}
                  customAreaFlex={false}
                  showModifier={true}
                  customProductDetails={true}
                  modifierWithoutPopup={true}
               />
            </div>
         </div>
         <div className="hern-product-page-section-ending" />
         <div className="hern-product-page__recipe-section">
            <Recipe
               productOption={productDetails?.productOptions[0]}
               config={config}
            />
         </div>
      </div>
   )
}
