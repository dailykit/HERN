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
import _, { isEmpty } from 'lodash'
import { LeftArrowIcon } from '../assets/icons/LeftArrow'
import { HernLazyImage } from '../utils/hernImage'
import { PRODUCT_ONE } from '../graphql'
import { useQuery } from '@apollo/react-hooks'

const isSmallerDevice = isClient && window.innerWidth < 768
export const ModifierPopup = props => {
   const {
      productData,
      showModifiers = true,
      closeModifier,
      showCounterBtn = true,
      forNewItem = false,
      edit = false,
      productCartDetail,
      showModifierImage = true,
      modifierWithoutPopup,
      customProductDetails = false,
      config,
      stepView = false,
      counterButtonPosition = 'TOP',
   } = props
   //context
   const { addToCart, methods } = React.useContext(CartContext)
   const { t, dynamicTrans, locale } = useTranslation()
   const { addToast } = useToasts()
   const currentLang = React.useMemo(() => locale, [locale])
   const { locationId, storeStatus, configOf, brand, brandLocation } =
      useConfig()

   const [isModifiersLoading, setIsModifiersLoading] = useState(true)
   const [productOption, setProductOption] = useState(null) // for by default choose one product option
   // console.log("product option needed",productData,productOption)

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
      defaultOptionType
         ? defaultOptionType
         : defaultOptionType === null
         ? 'null'
         : productOptionsGroupedByProductOptionType[0]['type']
   )

   const showStepViewProductOptionAndModifiers = React.useMemo(
      () => stepView || isSmallerDevice,
      [stepView]
   )

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )

   //! productData doesn't have modifiers
   // get complete product data
   const {
      loading,
      error,
      data: { product: completeProductData = {} } = {},
   } = useQuery(PRODUCT_ONE, {
      variables: {
         id: productData.id,
         params: argsForByLocation,
      },
      onError: error => {
         console.error('kiosk modifier popup', error)
      },
   })
   console.log('completeProductData', completeProductData)
   // useModifier

   useEffect(() => {
      if (!isEmpty(completeProductData)) {
         setProductOption(
            completeProductData.productOptions.find(
               x =>
                  x.id === completeProductData.defaultProductOptionId &&
                  x.isPublished &&
                  x.isAvailable
            ) ||
               completeProductData.productOptions.find(
                  x => x.isPublished && x.isAvailable
               )
         )
         setIsModifiersLoading(false)
      }
   }, [completeProductData])
   const {
      selectedModifierOptions,
      setSelectedModifierOptions,
      errorCategories,
      setErrorCategories,
      status,
   } = useModifier({
      product: productData,
      productOption,
      forNewItem,
      edit,
      setProductOption,
      productCartDetail,
      simpleModifier: true,
   })
   const {
      selectedModifierOptions: nestedSelectedModifierOptions,
      setSelectedModifierOptions: nestedSetSelectedModifierOptions,
      errorCategories: nestedErrorCategories,
      setErrorCategories: nestedSetErrorCategories,
      status: nestedStatus,
   } = useModifier({
      product: productData,
      productOption,
      forNewItem,
      edit,
      setProductOption,
      productCartDetail,
      nestedModifier: true,
   })

   const imagePopUpRef = React.useRef()
   const [modifierImage, setModifierImage] = useState({
      showImage: false,
      src: null,
   })

   const recipeLink = useConfig('Product card').configOf('recipe-link')

   const getPriceWithDiscount = (price, discount) => {
      return price - (price * discount) / 100
   }

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

   useEffect(() => {
      if (!isEmpty(completeProductData)&&(forNewItem || edit)) {
         const productOptionId = productCartDetail.childs[0].productOption.id
         const selectedProductOption = completeProductData.productOptions.find(
            x => x.id == productOptionId
         )
         setProductOption(selectedProductOption)
         if (edit) {
            setQuantity(productCartDetail.ids.length)
         }
      }
   }, [completeProductData])

   useEffect(() => {
      if (status == 'success') {
         const languageTags = document.querySelectorAll(
            '[data-translation="true"]'
         )
         dynamicTrans(languageTags)
      }
   }, [status, currentLang])

   //add to cart
   const handleAddOnCartOn = async () => {
      //check category fulfillment conditions
      const allSelectedOptions = [
         ...selectedModifierOptions.single,
         ...selectedModifierOptions.multiple,
      ]
      const allNestedSelectedOptions = [
         ...nestedSelectedModifierOptions.single,
         ...nestedSelectedModifierOptions.multiple,
      ]
      //no modifier available in product options
      if (!productOption.modifier) {
         // console.log('PASS')
         // addToCart({ ...productOption, quantity })
         const cartItem = getCartItemWithModifiers(
            productOption.cartItem,
            allSelectedOptions.map(x => x.cartItem)
         )
         // const objects = new Array(quantity).fill({ ...cartItem })
         // console.log('cartItem', objects)
         await addToCart(cartItem, quantity)
         addToast(t('Added to the Cart!'), {
            appearance: 'success',
         })
         if (edit) {
            methods.cartItems.delete({
               variables: {
                  where: {
                     id: {
                        _in: productCartDetail.ids,
                     },
                  },
               },
            })
         }
         closeModifier()
         return
      }

      let allCatagories = productOption.modifier?.categories || []
      let allAdditionalCatagories = []
      if (!_.isEmpty(productOption.additionalModifiers)) {
         productOption.additionalModifiers.forEach(eachAdditionalModifier => {
            eachAdditionalModifier.modifier.categories.forEach(eachCategory => {
               allAdditionalCatagories.push(eachCategory)
            })
         })
      }

      let finalCategories = [...allCatagories, ...allAdditionalCatagories]

      let errorState = []
      for (let i = 0; i < finalCategories.length; i++) {
         const allFoundedOptionsLength = allSelectedOptions.filter(
            x => x.modifierCategoryID === finalCategories[i].id
         ).length

         if (
            finalCategories[i]['isRequired'] &&
            finalCategories[i]['type'] === 'multiple'
         ) {
            const min = finalCategories[i]['limits']['min']
            const max = finalCategories[i]['limits']['max']
            if (
               allFoundedOptionsLength > 0 &&
               min <= allFoundedOptionsLength &&
               (max
                  ? allFoundedOptionsLength <= max
                  : allFoundedOptionsLength <=
                    finalCategories[i].options.length)
            ) {
            } else {
               errorState.push(finalCategories[i].id)
            }
         }
      }
      let nestedFinalCategories = []
      let nestedFinalErrorCategories = []
      // console.log('finalCategories', finalCategories)
      finalCategories.forEach(eachCategory => {
         eachCategory.options.forEach(eachOption => {
            if (eachOption.additionalModifierTemplateId) {
               nestedFinalCategories.push(
                  ...eachOption.additionalModifierTemplate.categories
               )
            }
         })
      })
      if (nestedFinalCategories.length > 0) {
         for (let i = 0; i < nestedFinalCategories.length; i++) {
            const allFoundedOptionsLength = allNestedSelectedOptions.filter(
               x => x.modifierCategoryID === nestedFinalCategories[i].id
            ).length

            if (
               nestedFinalCategories[i]['isRequired'] &&
               nestedFinalCategories[i]['type'] === 'multiple'
            ) {
               const min = nestedFinalCategories[i]['limits']['min']
               const max = nestedFinalCategories[i]['limits']['max']
               if (
                  allFoundedOptionsLength > 0 &&
                  min <= allFoundedOptionsLength &&
                  (max
                     ? allFoundedOptionsLength <= max
                     : allFoundedOptionsLength <=
                       nestedFinalCategories[i].options.length)
               ) {
               } else {
                  nestedFinalErrorCategories.push(nestedFinalCategories[i].id)
               }
            }
         }
      }
      setErrorCategories(errorState)
      nestedSetErrorCategories(nestedFinalErrorCategories)
      if (errorState.length > 0 || nestedFinalErrorCategories.length > 0) {
         // console.log('FAIL')
         return
      } else {
         // console.log('PASS')
         const nestedModifierOptionsGroupByParentModifierOptionId =
            allNestedSelectedOptions.length > 0
               ? _.chain(allNestedSelectedOptions)
                    .groupBy('parentModifierOptionId')
                    .map((value, key) => ({
                       parentModifierOptionId: +key,
                       data: value,
                    }))
                    .value()
               : []

         if (!_.isEmpty(nestedModifierOptionsGroupByParentModifierOptionId)) {
            const cartItem = getCartItemWithModifiers(
               productOption.cartItem,
               allSelectedOptions.map(x => x.cartItem),
               nestedModifierOptionsGroupByParentModifierOptionId
            )
            // console.log('finalCartItem', cartItem)
            await addToCart(cartItem, quantity)
         } else {
            const cartItem = getCartItemWithModifiers(
               productOption.cartItem,
               allSelectedOptions.map(x => x.cartItem)
            )
            await addToCart(cartItem, quantity)
         }
         if (edit) {
            methods.cartItems.delete({
               variables: {
                  where: {
                     id: {
                        _in: productCartDetail.ids,
                     },
                  },
               },
            })
         }
         closeModifier()
      }
   }

   //total amount for this item
   const totalAmount = () => {
      if(!productOption){
         return {total:0,totalWithoutDiscount:0,totalDiscount:0}
      }
      const productOptionPrice = productOption.price
      const allSelectedOptions = [
         ...selectedModifierOptions.single,
         ...selectedModifierOptions.multiple,
      ]
      const allNestedSelectedOptions = [
         ...nestedSelectedModifierOptions.single,
         ...nestedSelectedModifierOptions.multiple,
      ]
      let allSelectedOptionsPrice = 0
      let allSelectedOptionsPriceWithDiscount = 0
      let allNestedSelectedOptionsPrice = 0
      let allNestedSelectedOptionsPriceWithDiscount = 0
      allSelectedOptions.forEach(x => {
         allSelectedOptionsPrice += x?.modifierCategoryOptionsPrice || 0
         allSelectedOptionsPriceWithDiscount +=
            getPriceWithDiscount(
               x?.modifierCategoryOptionsPrice,
               x?.modifierCategoryOptionsDiscount
            ) || 0
      })
      allNestedSelectedOptions.forEach(x => {
         allNestedSelectedOptionsPrice += x?.modifierCategoryOptionsPrice || 0
         allNestedSelectedOptionsPriceWithDiscount +=
            getPriceWithDiscount(
               x?.modifierCategoryOptionsPrice,
               x?.modifierCategoryOptionsDiscount
            ) || 0
      })
      const totalBaseProductPriceWithDiscount = getPriceWithDiscount(
         productData.price,
         productData.discount
      )
      const totalProductionOptionsPriceWithDiscount = getPriceWithDiscount(
         productOptionPrice,
         productOption.discount
      )
      const totalWithoutDiscount =
         productData.price +
         productOptionPrice +
         allSelectedOptionsPrice +
         allNestedSelectedOptionsPrice
      const totalPrice =
         totalBaseProductPriceWithDiscount +
         totalProductionOptionsPriceWithDiscount +
         allSelectedOptionsPriceWithDiscount +
         allNestedSelectedOptionsPriceWithDiscount

      return {
         total: totalPrice * quantity,
         totalWithoutDiscount: totalWithoutDiscount * quantity,
         totalDiscount: (totalWithoutDiscount - totalPrice) * quantity,
      }
   }
   const { total, totalWithoutDiscount, totalDiscount } = totalAmount()
   //increment click
   const incrementClick = () => {
      setQuantity(quantity + 1)
   }

   //decrement click
   const decrementClick = () => {
      setQuantity(quantity - 1)
   }
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

   if (status === 'loading') {
      return <p>Loading</p>
   }

   const finalProductPrice = () => {
      // use for product card
      if (
         productData?.isPopupAllowed &&
         productData.productOptions.length > 0
      ) {
         return formatCurrency(
            getPriceWithDiscount(productData.price, productData.discount) +
               getPriceWithDiscount(
                  productData.productOptions[0]?.price || 0,
                  productData.productOptions[0]?.discount
               )
         )
      } else {
         return formatCurrency(
            getPriceWithDiscount(productData.price, productData.discount)
         )
      }
   }

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
            <div className="hern-product-options__custom-details__left">
               <div className="hern-product-options__custom-details__product-counter">
                  <CustomArea />
               </div>
               <div
                  className="hern-product-options__custom-details__product-price"
                  data-translation="true"
               >
                  {finalProductPrice()}
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
               {productOptionsGroupedByProductOptionType.length > 1 && (
                  <div>
                     <ul className="hern-modifier-pop-up-product-option-type-list">
                        {productOptionsGroupedByProductOptionType.map(
                           (eachProductOptionType, index) => {
                              return (
                                 <li
                                    role="button"
                                    key={`${eachProductOptionType.type}-${index}`}
                                    className={classNames(
                                       'hern-modifier-pop-up-product-option-type',
                                       {
                                          'hern-modifier-pop-up-product-option-type--active':
                                             eachProductOptionType.type ==
                                             productOptionType,
                                       }
                                    )}
                                    onClick={() => {
                                       setProductOptionType(
                                          eachProductOptionType.type
                                       )
                                       setProductOption(
                                          eachProductOptionType.data.find(
                                             x =>
                                                x.id ===
                                                productData.defaultProductOptionId
                                          ) || eachProductOptionType.data[0]
                                       )
                                       if (isModifierOptionsViewOpen) {
                                          setIsModifierOptionsViewOpen(false)
                                       }
                                    }}
                                    data-translation="true"
                                 >
                                    {camelCaseToNormalText(
                                       eachProductOptionType.type == 'null'
                                          ? 'Others'
                                          : eachProductOptionType.type
                                    )}
                                 </li>
                              )
                           }
                        )}
                     </ul>
                  </div>
               )}
              {!isModifiersLoading && <div className="hern-product-modifier-pop-up-content-container">
                  <div
                     className={classNames(
                        'hern-product-modifier-pop-up-product-option-list',
                        {
                           'hern-product-modifier-pop-up-product-option-list--with-modifiers':
                              showModifiers &&
                              productOption.modifier &&
                              !showStepViewProductOptionAndModifiers,
                           'hern-product-modifier-pop-up-product-option-list--with-modifiers-in-viewport':
                              showModifiers &&
                              productOption.modifier &&
                              showStepViewProductOptionAndModifiers &&
                              isModifierOptionsViewOpen,
                           'hern-product-modifier-pop-up-product-option-list--with-modifiers-not-in-viewport':
                              showModifiers &&
                              productOption.modifier &&
                              showStepViewProductOptionAndModifiers &&
                              isModifierOptionsViewOpen,
                        }
                     )}
                  >
                     <label htmlFor="products">
                        {productData.productionOptionSelectionStatement ? (
                           <span data-translation="true">
                              {productData.productionOptionSelectionStatement}
                           </span>
                        ) : (
                           t('Available Options')
                        )}
                     </label>
                     <br />
                     <ul
                        className={classNames(
                           'hern-product-modifier-pop-up-product-option-and-modifier',
                           {
                              'hern-product-modifier-pop-up-product-option-and-modifier--without-popup':
                                 modifierWithoutPopup,
                           }
                        )}
                     >
                        {productOptionsGroupedByProductOptionType
                           .find(eachType => eachType.type == productOptionType)
                           .data.map(eachOption => {
                              if (!eachOption.isPublished) {
                                 return null
                              }

                              const hasRecipe =
                                 eachOption?.simpleRecipeYield?.simpleRecipe

                              return (
                                 <div
                                    key={eachOption.id}
                                    style={{
                                       border: `${
                                          productOption.id === eachOption.id
                                             ? '1px solid var(--hern-accent)'
                                             : '1px solid #e4e4e4'
                                       }`,
                                       padding: '16px',
                                       display: 'flex',
                                       justifyContent: 'space-between',
                                       marginBottom: '8px',
                                       cursor: `${
                                          !eachOption.isAvailable
                                             ? 'not-allowed'
                                             : 'pointer'
                                       }`,
                                       opacity: `${
                                          !eachOption.isAvailable ? 0.6 : 1
                                       }`,
                                    }}
                                    onClick={e => {
                                       if (eachOption.isAvailable) {
                                          setProductOption(eachOption)
                                          if (
                                             showModifiers &&
                                             productOption.modifier
                                          ) {
                                             setIsModifierOptionsViewOpen(true)
                                          }
                                       }
                                    }}
                                 >
                                    <li data-translation="true">
                                       {eachOption.label}

                                       {' (+ '}
                                       {eachOption.discount > 0 && (
                                          <del
                                             style={{
                                                display: 'inline-block',
                                                padding: '0 6px',
                                             }}
                                          >
                                             {formatCurrency(eachOption.price)}
                                          </del>
                                       )}
                                       {formatCurrency(
                                          getPriceWithDiscount(
                                             eachOption.price,
                                             eachOption.discount
                                          )
                                       )}
                                       {')'}
                                    </li>
                                    {recipeButton.show && hasRecipe && (
                                       <div>
                                          <Link
                                             href={getRoute(
                                                '/recipes/' + eachOption.id
                                             )}
                                          >
                                             <a>{recipeButton.label}</a>
                                          </Link>
                                       </div>
                                    )}
                                 </div>
                              )
                           })}
                     </ul>
                  </div>

                  {showModifiers && productOption.modifier && (
                     <div
                        // className="hern-product-modifier-pop-up-modifier-list"
                        className={classNames(
                           'hern-product-modifier-pop-up-modifier-list',
                           {
                              'hern-product-modifier-pop-up-modifier-list-in-view-port':
                                 showStepViewProductOptionAndModifiers &&
                                 isModifierOptionsViewOpen,
                              'hern-product-modifier-pop-up-modifier-list-not-in-view-port':
                                 showStepViewProductOptionAndModifiers &&
                                 !isModifierOptionsViewOpen,
                           }
                        )}
                     >
                        {showStepViewProductOptionAndModifiers && (
                           <div
                              style={{
                                 display: 'flex',
                                 alignItems: 'center',
                                 marginBottom: '4px',
                              }}
                           >
                              <ArrowLeftIconBG
                                 size={18}
                                 bgColor={'#404040'}
                                 onClick={() => {
                                    setIsModifierOptionsViewOpen(false)
                                 }}
                              />
                              <span
                                 style={{
                                    fontSize: '16px',
                                    marginLeft: '10px',
                                 }}
                                 data-translation="true"
                              >
                                 {productOption.label}
                              </span>
                           </div>
                        )}
                        <label
                           htmlFor="products"
                           className="hern-product-modifier-pop-up-add-on"
                        >
                           {t('Add on')}:
                        </label>
                        {!isModifiersLoading && productOption.additionalModifiers.length > 0 &&
                           productOption.additionalModifiers.map(
                              eachAdditionalModifier => {
                                 return (
                                    <AdditionalModifiers
                                       key={`${eachAdditionalModifier.productOptionId} - ${eachAdditionalModifier.modifierId}`}
                                       eachAdditionalModifier={
                                          eachAdditionalModifier
                                       }
                                       selectedOptions={selectedModifierOptions}
                                       setSelectedOptions={
                                          setSelectedModifierOptions
                                       }
                                       config={config}
                                       errorCategories={errorCategories}
                                       nestedSelectedModifierOptions={
                                          nestedSelectedModifierOptions
                                       }
                                       nestedSetSelectedModifierOptions={
                                          nestedSetSelectedModifierOptions
                                       }
                                       nestedErrorCategories={
                                          nestedErrorCategories
                                       }
                                    />
                                 )
                              }
                           )}
                        {!isModifiersLoading && productOption.modifier.categories.map(eachCategory => {
                           return (
                              <ModifierCategory
                                 key={eachCategory.id}
                                 eachCategory={eachCategory}
                                 selectedOptions={selectedModifierOptions}
                                 setSelectedOptions={setSelectedModifierOptions}
                                 config={config}
                                 errorCategories={errorCategories}
                                 nestedSelectedModifierOptions={
                                    nestedSelectedModifierOptions
                                 }
                                 nestedSetSelectedModifierOptions={
                                    nestedSetSelectedModifierOptions
                                 }
                                 nestedErrorCategories={nestedErrorCategories}
                              />
                           )
                        })}
                     </div>
                  )}
               </div>}
               <div
                  style={{ padding: '0 32px' }}
                  className="hern-modifier-popup-add-to-cart-btn-parent-div"
               >
                  {showCounterBtn && counterButtonPosition == 'BOTTOM' && (
                     <div className="hern-modifier-pop-bottom-counter-btn-div">
                        <CounterButton
                           count={quantity}
                           incrementClick={incrementClick}
                           decrementClick={decrementClick}
                        />
                     </div>
                  )}
                  {!isModifiersLoading && <Button
                     className="hern-product-modifier-pop-up-add-to-cart-btn"
                     onClick={() => {
                        if (
                           showModifiers &&
                           productOption.modifier &&
                           showStepViewProductOptionAndModifiers
                        ) {
                           if (isModifierOptionsViewOpen) {
                              setTimeout(handleAddOnCartOn, 500)
                           } else {
                              setIsModifierOptionsViewOpen(true)
                           }
                        } else {
                           setTimeout(handleAddOnCartOn, 500)
                        }
                     }}
                     style={{ padding: '16px 0px 34px 0px' }}
                     disabled={
                        locationId ? (storeStatus.status ? false : true) : true
                     }
                  >
                     {showModifiers && productOption.modifier ? (
                        showStepViewProductOptionAndModifiers ? (
                           !isModifierOptionsViewOpen ? (
                              t('PROCEED')
                           ) : (
                              <span>
                                 {t('ADD TO CART')}&nbsp;
                                 <span>
                                    {formatCurrency(total)}
                                    {totalDiscount > 0 && (
                                       <del
                                          style={{
                                             display: 'inline-block',
                                             padding: '0 6px',
                                          }}
                                       >
                                          {formatCurrency(totalWithoutDiscount)}
                                       </del>
                                    )}
                                 </span>
                              </span>
                           )
                        ) : (
                           <span>
                              {t('ADD TO CART')}&nbsp;
                              <span>
                                 {formatCurrency(total)}
                                 {totalDiscount > 0 && (
                                    <del
                                       style={{
                                          display: 'inline-block',
                                          padding: '0 6px',
                                       }}
                                    >
                                       {formatCurrency(totalWithoutDiscount)}
                                    </del>
                                 )}
                              </span>
                           </span>
                        )
                     ) : (
                        <span>
                           {t('ADD TO CART')}&nbsp;
                           <span>
                              {formatCurrency(total)}&nbsp;
                              {totalDiscount > 0 && (
                                 <del
                                    style={{
                                       display: 'inline-block',
                                       padding: '0 6px',
                                    }}
                                 >
                                    {formatCurrency(totalWithoutDiscount)}&nbsp;
                                 </del>
                              )}
                           </span>
                        </span>
                     )}
                  </Button>}
               </div>
            </div>
            {/* <div
               className="hern-product-modifier-pop-up-close-icon"
               onClick={closeModifier}
            >
               <CloseIcon size={20} stroke="currentColor" />
            </div> */}
            {/* <Button
               className="hern-product-modifier-pop-up-add-to-cart-btn"
               onClick={handleAddOnCartOn}
            >
               ADD TO CART {total}
            </Button> */}
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

const AdditionalModifiers = forwardRef(
   ({
      eachAdditionalModifier,
      config,
      selectedOptions,
      setSelectedOptions,
      errorCategories,
      nestedSelectedModifierOptions,
      nestedSetSelectedModifierOptions,
      nestedErrorCategories,
   }) => {
      const additionalModifiersType = React.useMemo(
         () => eachAdditionalModifier.type == 'hidden',
         [eachAdditionalModifier]
      )
      const [showCustomize, setShowCustomize] = useState(
         !Boolean(additionalModifiersType)
      )

      return (
         <>
            <div className="">
               <div
                  className=""
                  onClick={() => setShowCustomize(prev => !prev)}
                  style={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                     cursor: 'pointer',
                  }}
               >
                  <span className="" data-translation="true">
                     {eachAdditionalModifier.label}
                  </span>
                  {showCustomize ? (
                     <UpVector size={18} />
                  ) : (
                     <DownVector size={18} />
                  )}
               </div>
               {showCustomize &&
                  eachAdditionalModifier.modifier &&
                  eachAdditionalModifier.modifier.categories.map(
                     (eachModifierCategory, index) => {
                        return (
                           <ModifierCategory
                              key={eachModifierCategory.id}
                              eachCategory={eachModifierCategory}
                              selectedOptions={selectedOptions}
                              setSelectedOptions={setSelectedOptions}
                              config={config}
                              errorCategories={errorCategories}
                              nestedSelectedModifierOptions={
                                 nestedSelectedModifierOptions
                              }
                              nestedSetSelectedModifierOptions={
                                 nestedSetSelectedModifierOptions
                              }
                              nestedErrorCategories={nestedErrorCategories}
                           />
                        )
                     }
                  )}
            </div>
         </>
      )
   }
)
