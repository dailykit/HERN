import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { PRODUCT_DETAILS } from '../../graphql'
import { useConfig } from '../../lib'
import {
   Recipe,
   ProductCard,
   Loader,
   ModifierPopup,
   ModifierPopupForUnAvailability,
} from '../../components'
import { useRouter } from 'next/router'
import ProductMedia from './ProductMedia'
import { VegNonVegType } from '../../assets/icons'
import { useTranslation } from '../../context'
import classNames from 'classnames'
import { formatCurrency, useProductConfig } from '../../utils'
import { isEmpty } from 'lodash'
import { CustomArea } from '../featuredCollection/productCustomArea'

export const Product = ({ config }) => {
   const router = useRouter()
   const { id } = router.query
   const [status, setStatus] = React.useState('loading')
   const { brand, locationId, brandLocation } = useConfig()
   const [productDetails, setProductDetails] = React.useState({})
   const [productTotalAmount, setProductTotalAmount] = React.useState(null)

   const { t, dynamicTrans, locale } = useTranslation()
   const currentLang = React.useMemo(() => locale, [locale])

   const { value: productSetting } = useProductConfig(
      'showProductDetailOnImage',
      id
   )

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )
   const { loading: productsLoading, error: productsError } = useQuery(
      PRODUCT_DETAILS,
      {
         skip: !id || !brand?.id || !locationId || !brandLocation?.id,
         variables: {
            id: Number(id),
            params: argsForByLocation,
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

   const isProductOutOfStock = React.useMemo(() => {
      if (productDetails.isAvailable) {
         if (
            productDetails.productOptions.length > 0 &&
            productDetails.isPopupAllowed
         ) {
            const availableProductOptions =
               productDetails.productOptions.filter(
                  option => option.isPublished && option.isAvailable
               ).length
            if (availableProductOptions > 0) {
               return false
            } else {
               return true
            }
         } else {
            return false
         }
      }
      return true
   }, [productDetails])

   const showProductDetailOnImage =
      config?.display?.showProductDetailOnImage?.value ??
      config?.display?.showProductDetailOnImage?.default ??
      false
   if (productsLoading || status === 'loading') return <Loader />
   if (productsError) return <p>{t('Something went wrong')}</p>

   return (
      <div className="hern-product-page">
         <div
            className={classNames('hern-product-page__product-section', {
               'hern-product-page__product-section--no-product-option': isEmpty(
                  productDetails?.productOptions
               ),
            })}
         >
            <div
               style={{
                  ...(showProductDetailOnImage && {
                     backgroundColor: 'rgba(223, 249, 164, 0.2)',
                     borderRadius: '24px',
                  }),
               }}
               className={classNames(
                  'hern-product-page__product-media-wrapper',
                  {
                     'hern-product-page__product-media-wrapper-detail-on-image':
                        showProductDetailOnImage,
                  }
               )}
            >
               {(showProductDetailOnImage ||
                  isEmpty(productDetails?.productOptions)) && (
                  <ProductInfo
                     productTotalAmount={productTotalAmount}
                     productData={productDetails}
                  />
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
               {isProductOutOfStock && (
                  <ModifierPopupForUnAvailability
                     productData={productDetails}
                     closeModifier={() => {}}
                     showCounterBtn={true}
                     modifierWithoutPopup={true}
                     customProductDetails={true}
                     config={config}
                     stepView={true}
                     counterButtonPosition={'BOTTOM'}
                  />
               )}
               {!showProductDetailOnImage &&
                  !isEmpty(productDetails?.productOptions) &&
                  !isProductOutOfStock && (
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
               {showProductDetailOnImage &&
                  !isEmpty(productDetails?.productOptions) &&
                  !isProductOutOfStock && (
                     <ModifierPopup
                        productData={productDetails}
                        closeModifier={() => {}}
                        showCounterBtn={true}
                        modifierWithoutPopup={true}
                        config={config}
                        stepView={true}
                        counterButtonPosition={'BOTTOM'}
                        setProductTotalAmount={setProductTotalAmount}
                     />
                  )}
               {isEmpty(productDetails?.productOptions) && (
                  <>
                     <CustomArea
                        data={productDetails}
                        setProductModifier={{}}
                        showAddToCartButtonFullWidth={true}
                     />

                     <div
                        className="hern-product-card__description"
                        title={productDetails?.description}
                     >
                        <span data-translation="true">
                           {productDetails?.description?.slice(0, 50)}
                        </span>
                        {productDetails?.description?.length > 50 && '...'}
                     </div>
                  </>
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
const ProductInfo = ({ productData, productTotalAmount }) => {
   return (
      <div className={classNames('hern-product__product-info')}>
         <div className={classNames('hern-product__product-header')}>
            <span className={classNames('hern-product__product-name')}>
               {productData.name}
            </span>
            <span className={classNames('hern-product__product-price')}>
               {formatCurrency(productTotalAmount)}
            </span>
         </div>
         <div className="hern-product_product-additional-text">
            {productData?.additionalText}
         </div>
      </div>
   )
}
