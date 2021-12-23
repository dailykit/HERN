import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { PRODUCT_DETAILS } from '../../graphql'
import { CartContext, onDemandMenuContext } from '../../context'
import { useConfig } from '../../lib'
import { Recipe, ProductCard, Loader } from '../../components'

export const Product = ({ productId }) => {
   console.log(productId)
   const { cartState, addToCart } = React.useContext(CartContext)
   const { onDemandMenu } = React.useContext(onDemandMenuContext)
   const { isMenuLoading, allProductIds, categories } = onDemandMenu
   const [hydratedMenu, setHydratedMenu] = React.useState([])
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
         skip: !productId,
         variables: {
            id: productId,
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
      <>
         <div className="hern-product-section">
            <div className="hern-product-section__image-gallery">
               <ProductCard
                  data={productDetails}
                  showProductDescription={true}
                  showImage={true}
                  closeModifier={() => console.log('close')}
                  customAreaFlex={false}
               />
            </div>

            <div className="hern-product-section__product-details">
               <ProductCard
                  data={productDetails}
                  showProductPrice={false}
                  showProductDescription={false}
                  showImage={false}
                  showProductName={false}
                  closeModifier={() => console.log('close')}
                  customAreaFlex={false}
                  showModifier={true}
               />
            </div>
         </div>
         <div className="hern-product-recipe-section">
            <Recipe productOption={productDetails?.productOptions[0]} />
         </div>
      </>
   )
}
