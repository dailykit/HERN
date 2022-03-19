import React from 'react'
import { Carousel } from 'antd'
import { Slide } from 'react-slideshow-image'
import 'react-slideshow-image/dist/styles.css'
import { formatCurrency, isClient } from '../utils'
import { ModifierPopup } from './index'
import classNames from 'classnames'
import { EditIcon } from '../assets/icons'
import { useTranslation } from '../context'
import { HernLazyImage } from '../utils/hernImage'
// if (isClient) {
//    import('lazysizes/plugins/unveilhooks/ls.unveilhooks').then(module => module)
// }

export const ProductCard = props => {
   const {
      data,
      showImage = true,
      onImageClick,
      iconOnImage: IconOnImage,
      onIconOnImageClick,
      canSwipe = true,
      showSliderArrows = true,
      showSliderIndicators = true,
      onProductCardContentClick,
      additionalIcon: AdditionalIcon,
      onAdditionalIconClick,
      showImageIcon: ShowImageIcon,
      onProductNameClick,
      showProductPrice = true,
      showProductName = true,
      showProductAdditionalText = true,
      onShowImageIconClick,
      showCustomText = true,
      customAreaComponent: CustomAreaComponent,
      showProductDescription = false,
      showModifier = false,
      closeModifier,
      modifierPopupConfig, //use for cart
      useForThirdParty = false, // use some where else this component (don't wanna use some fn from this component)
      maintainRatio = true,
      customAreaFlex = true, //If custom area on the next line
      contentAreaCustomStyle = {},
      modifierWithoutPopup = false,
      showProductDetails = true,
      customProductDetails = false,
      showProductCard = true,
      className = '',
      config,
      stepView = false,
   } = props
   const { t, dynamicTrans, locale } = useTranslation()
   const currentLang = React.useMemo(() => locale, [locale])
   const slideRef = React.useRef()
   const properties = {
      duration: 5000,
      autoplay: false,
      transitionDuration: 500,
      infinite: false,
      easing: 'ease',
      ...(showImage && data.assets.images.length !== 1
         ? { arrows: showSliderArrows }
         : { arrows: false }),
      ...(showImage &&
         data.assets.images.length !== 1 &&
         showSliderIndicators && {
            indicators: i => (
               <div className="hern-product-card-slider-indicator"></div>
            ),
         }),
      ...(showImage &&
         data.assets.images.length !== 1 &&
         canSwipe && { canSwipe: canSwipe }),
   }

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   const finalProductPrice = () => {
      // use for product card
      if (!useForThirdParty) {
         if (data.isPopupAllowed && data.productOptions.length > 0) {
            return (
               data.price -
               data.discount +
               ((data?.productOptions[0]?.price || 0) -
                  (data?.productOptions[0]?.discount || 0))
            )
         } else {
            return data.price - data.discount
         }
      }
      // when using this product card some where else
      else {
         if (data.price > 0) {
            return data.price - data.discount
         } else {
            return null
         }
      }
   }

   return (
      <>
         {showProductCard && (
            <div className={classNames('hern-product-card', className)}>
               {showImage && (
                  <div className="hern-product-card-image-container">
                     <Slide ref={slideRef} {...properties}>
                        {data.assets.images.map((each, index) => {
                           return (
                              <div key={each}>
                                 {/* <div
                                    className={classNames(
                                       'lazyload hern-product-card-image-background',
                                       {
                                          'hern-product-card-image-background--aspect-ratio':
                                             maintainRatio,
                                       }
                                    )}
                                    // style={{
                                    //    backgroundImage: `url(https://dailykit-502-chefbaskit1.s3.us-east-2.amazonaws.com/images/64330-Lal-Maas.jpg)`,
                                    // }}
                                    data-bg={each}
                                 ></div> */}
                                 <HernLazyImage
                                    // src={each}
                                    dataSrc={each}
                                    alt={data.name}
                                    className={classNames(
                                       'hern-product-card__image',
                                       {
                                          'hern-product-card__image--aspect-ratio':
                                             maintainRatio,
                                       }
                                    )}
                                    onClick={e => {
                                       if (onImageClick) {
                                          e.stopPropagation()
                                          onImageClick()
                                       }
                                    }}
                                    style={{
                                       cursor: onImageClick ? 'pointer' : null,
                                    }}
                                 />
                              </div>
                           )
                        })}
                     </Slide>
                     {IconOnImage && (
                        <div
                           className="hern-product-card-on-image-icon"
                           onClick={e => {
                              if (onIconOnImageClick) {
                                 e.stopPropagation()
                                 onIconOnImageClick()
                              }
                           }}
                        >
                           <IconOnImage />
                        </div>
                     )}
                  </div>
               )}
               <div
                  className={classNames('hern-product-card-content', {
                     'hern-product-card-content--custom-area-not-flex':
                        !customAreaFlex,
                  })}
                  style={contentAreaCustomStyle}
                  onClick={e => {
                     if (onProductCardContentClick) {
                        e.stopPropagation()
                        onProductCardContentClick()
                     }
                  }}
               >
                  {AdditionalIcon && (
                     <div
                        className="hern-product-card-additional-icon"
                        onClick={e => {
                           if (onAdditionalIconClick) {
                              e.stopPropagation()
                              onAdditionalIconClick()
                           }
                        }}
                     >
                        <AdditionalIcon />
                     </div>
                  )}
                  {showProductDetails && (
                     <div className="hern-product-card-details">
                        <div className="hern-product-card-title">
                           {showProductName && (
                              <div
                                 className="hern-product-card__name"
                                 onClick={e => {
                                    if (onProductNameClick) {
                                       e.stopPropagation()
                                       onProductNameClick()
                                    }
                                 }}
                                 title={data?.name}
                                 style={{
                                    cursor: onProductNameClick
                                       ? 'pointer'
                                       : null,
                                 }}
                                 data-translation="true"
                              >
                                 {data.name}
                              </div>
                           )}
                           {data?.childs?.length > 0 && (
                              <div className="hern-product-card-productOption-label">
                                 {data.childs[0].productOption.label || 'N/A'}
                              </div>
                           )}
                           {ShowImageIcon && (
                              <div
                                 className="hern-product-card-show-image-icon"
                                 onClick={e => {
                                    if (onShowImageIconClick) {
                                       e.stopPropagation()
                                       onShowImageIconClick()
                                    }
                                 }}
                              >
                                 <ShowImageIcon />
                              </div>
                           )}
                        </div>
                        {showProductPrice && (
                           <div className="hern-product-card__price">
                              {useForThirdParty && data.discount > 0 && (
                                 <span
                                    style={{
                                       textDecoration: 'line-through',
                                    }}
                                 >
                                    {formatCurrency(data.price - data.discount)}
                                 </span>
                              )}
                              {finalProductPrice() &&
                                 finalProductPrice() > 0 && (
                                    <span style={{ marginLeft: '6px' }}>
                                       {formatCurrency(finalProductPrice())}
                                    </span>
                                 )}
                           </div>
                        )}
                        {showProductAdditionalText && data?.additionalText && (
                           <div
                              className="hern-product-card__additional-text"
                              data-translation="true"
                           >
                              {data.additionalText}
                           </div>
                        )}
                     </div>
                  )}
                  {showProductDescription && (
                     <div
                        className="hern-product-card__description"
                        title={data?.description}
                     >
                        <span data-translation="true">
                           {data?.description?.slice(0, 50)}
                        </span>
                        {data?.description?.length > 50 && '...'}
                     </div>
                  )}
                  <div className="hern-product-card-custom-area">
                     {CustomAreaComponent && (
                        <CustomAreaComponent data={data} />
                     )}
                     {showCustomText && (
                        <div className="hern-product-card-custom-text"></div>
                     )}
                  </div>
               </div>
            </div>
         )}
         {showModifier && data && (
            <ModifierPopup
               productData={
                  modifierPopupConfig && modifierPopupConfig?.productData
                     ? modifierPopupConfig?.productData
                     : data
               }
               closeModifier={closeModifier}
               showCounterBtn={modifierPopupConfig?.showCounterBtn}
               forNewItem={modifierPopupConfig?.forNewItem}
               edit={modifierPopupConfig?.edit}
               productCartDetail={modifierPopupConfig?.productCartDetail}
               showModifierImage={modifierPopupConfig?.showModifierImage}
               modifierWithoutPopup={modifierWithoutPopup}
               customProductDetails={customProductDetails}
               config={config}
               stepView={stepView}
               counterButtonPosition={
                  modifierPopupConfig?.counterButtonPosition
               }
            />
         )}
      </>
   )
}
