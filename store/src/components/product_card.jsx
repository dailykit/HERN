import React from 'react'
import { Slide } from 'react-slideshow-image'
import 'react-slideshow-image/dist/styles.css'
import { formatCurrency } from '../utils'
import { ModifierPopup } from './index'

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
      showModifier = false,
      closeModifier,
   } = props

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
   return (
      <>
         <div className="hern-product-card">
            {showImage && (
               <div className="hern-product-card-image-container">
                  <Slide ref={slideRef} {...properties}>
                     {data.assets.images.map((each, index) => {
                        return (
                           <div key={index}>
                              <div
                                 className="hern-product-card-image-background"
                                 style={{ backgroundImage: `url(${each})` }}
                              ></div>
                              <img
                                 src={each}
                                 className="hern-product-card__image"
                                 onClick={e => {
                                    e.stopPropagation()
                                    onImageClick ? onImageClick() : null
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
                           e.stopPropagation()
                           onIconOnImageClick ? onIconOnImageClick() : null
                        }}
                     >
                        <IconOnImage />
                     </div>
                  )}
               </div>
            )}
            <div
               className="hern-product-card-content"
               onClick={e => {
                  e.stopPropagation()
                  onProductCardContentClick ? onProductCardContentClick : null
               }}
            >
               {AdditionalIcon && (
                  <div
                     className="hern-product-card-additional-icon"
                     onClick={e => {
                        e.stopPropagation()
                        onAdditionalIconClick ? onAdditionalIconClick() : null
                     }}
                  >
                     <AdditionalIcon />
                  </div>
               )}
               <div className="hern-product-card-details">
                  <div className="hern-product-card-title">
                     {showProductName && (
                        <div
                           className="hern-product-card__name"
                           onClick={e => {
                              e.stopPropagation()
                              onProductNameClick ? onProductNameClick() : null
                           }}
                        >
                           {data.name}
                        </div>
                     )}
                     {ShowImageIcon && (
                        <div
                           className="hern-product-card-show-image-icon"
                           onClick={e => {
                              e.stopPropagation()
                              onShowImageIconClick
                                 ? onShowImageIconClick()
                                 : null
                           }}
                        >
                           <ShowImageIcon />
                        </div>
                     )}
                  </div>
                  {showProductPrice && (
                     <div className="hern-product-card__price">
                        {formatCurrency(data.price)}
                     </div>
                  )}
                  {showProductAdditionalText && (
                     <div className="hern-product-card__additional-text">
                        {data.additionalText}
                     </div>
                  )}
               </div>
               <div className="hern-product-card-custom-area">
                  {CustomAreaComponent && <CustomAreaComponent data={data} />}
                  {showCustomText && (
                     <div className="hern-product-card-custom-text"></div>
                  )}
               </div>
            </div>
         </div>
         {showModifier && data && (
            <ModifierPopup
               productData={data}
               closeModifier={closeModifier}
               height={data ? '100%' : '0'}
            />
         )}
      </>
   )
}
