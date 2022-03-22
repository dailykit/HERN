import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { PRODUCT_DETAILS } from '../../graphql'
import { useConfig } from '../../lib'
import { Recipe, ProductCard, Loader } from '../../components'
import { useRouter } from 'next/router'
import ProductMedia from './ProductMedia'
import { VegNonVegType } from '../../assets/icons'
import { useTranslation } from '../../context'

export const Product = ({ config }) => {
   const router = useRouter()
   const { id } = router.query
   const [status, setStatus] = React.useState('loading')
   const { brand, locationId } = useConfig()
   const [productDetails, setProductDetails] = React.useState({})

   const { t, dynamicTrans, locale } = useTranslation()
   const currentLang = React.useMemo(() => locale, [locale])
   console.log(config, "config")
   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: locationId,
         },
      }),
      [brand, locationId]
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
   React.useEffect(() => {
      console.log(currentLang, status, 'product,productsLoading ', productsLoading)
      if (status == 'success') {
         const languageTags = document.querySelectorAll(
            '[data-translation="true"]'
         )
         dynamicTrans(languageTags)
      }
   }, [status, currentLang, productsLoading])

   if (productsLoading || status === 'loading') return <Loader />
   if (productsError) return <p>{t('Something went wrong')}</p>

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
                  showProductCard={false}
                  stepView={true}
                  modifierPopupConfig={{
                     counterButtonPosition: 'BOTTOM',
                  }}
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
