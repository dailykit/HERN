import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { PRODUCT_DETAILS } from '../../graphql'
import { useConfig } from '../../lib'
import { Recipe, ProductCard, Loader, ModifierPopup } from '../../components'
import { useRouter } from 'next/router'
import ProductMedia from './ProductMedia'
import { VegNonVegType } from '../../assets/icons'
import { useTranslation } from '../../context'
import classNames from 'classnames'
import { formatCurrency } from '../../utils'

export const Product = ({ config }) => {
   const router = useRouter()
   const { id } = router.query
   const [status, setStatus] = React.useState('loading')
   const { brand, locationId } = useConfig()
   const [productDetails, setProductDetails] = React.useState({})

   const { t, dynamicTrans, locale } = useTranslation()
   const currentLang = React.useMemo(() => locale, [locale])

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
      console.log(
         currentLang,
         status,
         'product,productsLoading ',
         productsLoading
      )
      if (status == 'success') {
         const languageTags = document.querySelectorAll(
            '[data-translation="true"]'
         )
         dynamicTrans(languageTags)
      }
   }, [status, currentLang, productsLoading])

   const showProductDetailOnImage =
      config?.display?.showProductDetailOnImage?.value ??
      config?.display?.showProductDetailOnImage?.default ??
      false
   if (productsLoading || status === 'loading') return <Loader />
   if (productsError) return <p>Something went wrong</p>

   return (
      <div className="hern-product-page">
         <div className="hern-product-page__product-section">
            <div
               className={classNames(
                  'hern-product-page__product-media-wrapper',
                  {
                     'hern-product-page__product-media-wrapper-detail-on-image':
                        showProductDetailOnImage,
                  }
               )}
            >
               {showProductDetailOnImage && (
                  <ProductInfo productData={productDetails} />
               )}
               <ProductMedia assets={productDetails?.assets} config={config} />
               <div className="hern-veg-non-veg-type">
                  <VegNonVegType
                     vegNonVegType={productDetails?.VegNonVegType}
                     size={38}
                  />
               </div>
            </div>
            <div
               className={classNames(
                  'hern-product-page__product-options-wrapper',
                  {
                     'hern-product-page__product-options-wrapper-detail-on-image':
                        showProductDetailOnImage,
                  }
               )}
            >
               {!showProductDetailOnImage && (
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
               )}
               {showProductDetailOnImage && (
                  <ModifierPopup
                     productData={productDetails}
                     closeModifier={() => {}}
                     showCounterBtn={true}
                     modifierWithoutPopup={true}
                     config={config}
                     stepView={true}
                     counterButtonPosition={'BOTTOM'}
                  />
               )}
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
const ProductInfo = ({ productData }) => {
   return (
      <div className={classNames('hern-product__product-info')}>
         <div className={classNames('hern-product__product-header')}>
            <span className={classNames('hern-product__product-name')}>
               {productData.name}
            </span>
            <span className={classNames('hern-product__product-price')}>
               {formatCurrency(productData.price)}
            </span>
         </div>
         <div className="hern-product_product-additional-text">
            {productData?.additionalText}
         </div>
         <div className="hern-product_product-description">
            {productData?.description}
         </div>
      </div>
   )
}
