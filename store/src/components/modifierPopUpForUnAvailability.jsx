import React, {
    useEffect,
    useState,
    forwardRef,
    useImperativeHandle,
 } from 'react'
 import { Button, ModifierOptionCard, ProductCard, ModifierCategory } from '.'
 import {
    ArrowLeftIconBG,
    DownVector,
    RadioIcon,
    ShowImageIcon,
    UpVector,
 } from '../assets/icons'
 import {
    camelCaseToNormalText,
    formatCurrency,
    getCartItemWithModifiers,
    getRoute,
    isClient,
 } from '../utils'
 import { CloseIcon } from '../assets/icons'
 import { useOnClickOutside } from '../utils/useOnClickOutisde'
 import { CartContext, useTranslation } from '../context'
 import { CounterButton } from './counterBtn'
 import classNames from 'classnames'
 import Link from 'next/link'
 import { useToasts } from 'react-toast-notifications'
 import { useConfig } from '../lib'
 import { useModifier } from '../utils'
 import _ from 'lodash'
 import { LeftArrowIcon } from '../assets/icons/LeftArrow'
 import { HernLazyImage } from '../utils/hernImage'
 
 const isSmallerDevice = isClient && window.innerWidth < 768
 export const ModifierPopupForUnAvailability = props => {
    const {
       productData,
       showModifiers = true,
       closeModifier,
       showCounterBtn = true,
    //    forNewItem = false,
    //    edit = false,
    //    productCartDetail,
    //    showModifierImage = true,
       modifierWithoutPopup,
       customProductDetails = false,
    //    config,
       stepView = false,
       counterButtonPosition = 'BOTTOM',
    } = props
    //context
    const { addToCart, methods } = React.useContext(CartContext)
    const { t, dynamicTrans, locale } = useTranslation()
    const { addToast } = useToasts()
    const currentLang = React.useMemo(() => locale, [locale])
 
    const [productOption, setProductOption] = useState(
       productData.productOptions.find(
          x => x.id === productData.defaultProductOptionId
       ) || productData.productOptions.find(x => x.isPublished && x.isAvailable)
    ) // for by default choose one product option
   //  console.log("product option needed",productData)

    const [quantity, setQuantity] = useState(1)
    const [isModifierOptionsViewOpen, setIsModifierOptionsViewOpen] =
       useState(false) // used only when --> product option has modifier options and mobile view open
    const productOptionsGroupedByProductOptionType = React.useMemo(() => {
       const groupedData = _.chain(productData.productOptions)
          .groupBy('type')
          .map((value, key) => ({
             type: key,
             data: value,
          }))
          .value()
       return groupedData
    }, [productData])
    
    const defaultOptionType = productData.productOptions.find(
       x => x.id === productData.defaultProductOptionId
    )?.type
    
    const [productOptionType, setProductOptionType] = useState(
       defaultOptionType ? 
          defaultOptionType : 
          defaultOptionType===null ? 
             'null' : 
             productOptionsGroupedByProductOptionType[0]['type']
    )
 
    const showStepViewProductOptionAndModifiers = React.useMemo(
       () => stepView || isSmallerDevice,
       [stepView]
    )
   
    const imagePopUpRef = React.useRef()
    const [modifierImage, setModifierImage] = useState({
       showImage: false,
       src: null,
    })
 
    const { locationId, storeStatus, configOf } = useConfig()
    const recipeLink = useConfig('Product card').configOf('recipe-link')
 
   
    const recipeButton = {
       show:
          recipeLink?.['Recipe link Button']?.['Show link button']?.value ??
          false,
       label:
          recipeLink?.['Recipe link Button']?.['label'].value ?? 'View Recipe',
    }
    useOnClickOutside(imagePopUpRef, () =>
       setModifierImage({
          showImage: false,
          src: null,
       })
    )
 
   
    //custom area for product
    const CustomArea = () => {
       return (
          <div className="hern-menu-popup-product-custom-area">
             {showCounterBtn && counterButtonPosition == 'TOP' && (
                <CounterButton
                   count={quantity}
                   incrementClick={incrementClick}
                   decrementClick={decrementClick}
                />
             )}
          </div>
       )
    }
 
    useEffect(() => {
       if (productData && !modifierWithoutPopup) {
          document.querySelector('body').style.overflowY = 'hidden'
       }
       return () => {
          document.querySelector('body').style.overflowY = 'auto'
       }
    }, [productData])
 
    // if (status === 'loading') {
    //    return <p>Loading</p>
    // }
 
    
 
    const CustomProductDetails = React.memo(() => {
       useEffect(() => {
          const languageTags = document.querySelectorAll(
             '[data-translation="true"]'
          )
          dynamicTrans(languageTags)
       }, [currentLang])
 
       return (
          <div className="hern-product-options__custom-details">
             <div>
                <div
                   className="hern-product-options__custom-details__product-title"
                   data-translation="true"
                >
                   {productData.name}
                </div>
                <div
                   className="hern-product-options__custom-details__product-desc"
                   data-translation="true"
                >
                   {productData.description}
                </div>
                <div
                   className="hern-product-options__custom-details__product-tags"
                   data-translation="true"
                >
                   {productData?.tags?.join(',')}
                </div>
             </div>
    
          </div>
       )
    })
 
    window.onclick = function (event) {
       if (
          event.target ==
             document.querySelector(
                '.hern-product-modifier-pop-up-container--show-modifier-pop-up'
             ) &&
          !modifierWithoutPopup
       ) {
          closeModifier()
       }
    }
    // console.log('productOption', productOption)
    return (
       <>
          <div
             className={classNames(
                {
                   'hern-product-modifier-pop-up-container':
                      !modifierWithoutPopup,
                },
                {
                   'hern-product-modifier-pop-up-container--show-modifier-pop-up':
                      productData && !modifierWithoutPopup,
                }
             )}
          >
             <div
                className={classNames({
                   'hern-product-modifier-pop-up-product': !modifierWithoutPopup,
                })}
             >
                {!customProductDetails && (
                   <div className="hern-product-modifier-pop-up-header-container">
                      <div
                         className="hern-product-card__name"
                         style={{ fontSize: '20px', fontWeight: '600px' }}
                         data-translation="true"
                      >
                         {productData?.name}
                      </div>
                      <div
                         style={{
                            display: 'flex',
                            alignItems: 'center',
                         }}
                      >
                         {showCounterBtn && <CustomArea data={productData} />}
 
                         {!modifierWithoutPopup && (
                            <div className="hern-product-modifier-pop-up-close-icon">
                               <CloseIcon
                                  size={20}
                                  stroke="currentColor"
                                  onClick={closeModifier}
                               />
                            </div>
                         )}
                      </div>
                   </div>
                )}
                <div className="hern-product-modifier-pop-up-product-details">
                   {customProductDetails ? (
                      <CustomProductDetails />
                   ) : (
                      <ProductCard
                         data={productData}
                         showImage={false}
                         showCustomText={false}
                         customAreaComponent={CustomArea}
                         showModifier={false}
                         useForThirdParty={true}
                         showProductCard={false}
                      />
                   )}
                </div>
    
                   </div>
 
                  
                <div
                   style={{ padding: '0 32px' }}
                   className="hern-modifier-popup-add-to-cart-btn-parent-div"
                >
                   {showCounterBtn && counterButtonPosition == 'BOTTOM' && (
                   
                   <Button
                      className="hern-product-modifier-pop-up-add-to-cart-btn"
                      style={{ padding: '16px 0px 34px 0px' }}
                      disabled={
                         locationId ? (storeStatus.status ? false : true) : true
                      }
                   >
                       <span>
                                  {t('OUT OF STOCK')}&nbsp;
                               </span>

                   </Button>
                   )}
                </div>
             
             {modifierImage.showImage && (
                <div className="hern-product-modifier-image-pop-up">
                   <div
                      className="hern-product-modifier-image-pop-up-content"
                      ref={imagePopUpRef}
                   >
                      <HernLazyImage
                         dataSrc={modifierImage.src}
                         alt="modifier"
                      />
                      {/* <div className="hern-product-modifier-pop-up-close-icon">
                         <CloseIcon size={20} stroke="currentColor" />
                      </div> */}
                   </div>
                </div>
             )}
          </div>
       </>
    )
 }
 