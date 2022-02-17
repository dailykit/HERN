import React, {
   useState,
   useEffect,
   forwardRef,
   useRef,
   useImperativeHandle,
} from 'react'
import { Badge, Carousel, Radio, Modal } from 'antd'
import { KioskCounterButton } from '.'
import { CartContext, useTranslation } from '../../../context'
import {
   CheckBoxIcon,
   CloseIcon,
   DownVector,
   NoTickRoundCheckBoxIcon,
   RoundCheckBoxIcon,
   UpVector,
} from '../../../assets/icons'
import KioskButton from './button'
import {
   formatCurrency,
   getCartItemWithModifiers,
   useOnClickOutside,
} from '../../../utils'
import { GET_MODIFIER_BY_ID } from '../../../graphql'
import { useQuery } from '@apollo/react-hooks'
import { useConfig } from '../../../lib'
import { Loader } from '../..'
import classNames from 'classnames'

export const KioskModifier = props => {
   const {
      config,
      onCloseModifier,
      productData,
      edit = false,
      forNewItem = false,
      productCartDetail,
      setCurrentPage,
   } = props
   const { t, dynamicTrans, locale, direction } = useTranslation()
   //context
   const { addToCart, methods } = React.useContext(CartContext)

   // component state
   const [selectedProductOption, setSelectedProductOption] = useState(
      productData.productOptions.find(
         x => x.id === productData.defaultProductOptionId
      ) || productData.productOptions[0]
   )
   const [quantity, setQuantity] = useState(1)
   const [selectedOptions, setSelectedOptions] = useState({
      single: [],
      multiple: [],
   })
   const [status, setStatus] = useState('loading')
   const [errorCategories, setErrorCategories] = useState([])
   const [showProceedPopup, setShowProceedPopup] = useState(false)
   const currentLang = React.useMemo(() => locale, [locale])
   const nestedModifierRef = React.useRef()
   const additionalModifierRef = React.useRef()
   const [showNestedModifierOptions, setShowNestedModifierOptions] =
      useState(false)
   const [childChangingToggle, setChildChangingToggle] = useState(false) // use for reflect changes from child so that parent can re render

   const modifierPopRef = React.useRef()
   useOnClickOutside(modifierPopRef, () => onCloseModifier())

   // increase product by one
   const onPlusClick = () => {
      setQuantity(quantity + 1)
   }

   // decrease product by one
   const onMinusClick = () => {
      if (quantity > 1) {
         setQuantity(quantity - 1)
      }
   }

   // on check click
   const onCheckClick = (eachOption, eachModifierCategory) => {
      //selected option
      const selectedOption = {
         modifierCategoryID: eachModifierCategory.id,
         modifierCategoryOptionsID: eachOption.id,
         modifierCategoryOptionsPrice: eachOption.price,
         modifierCategoryOptionsDiscount: eachOption.discount,
         cartItem: eachOption.cartItem,
      }
      //modifierCategoryOptionID
      //modifierCategoryID
      if (eachModifierCategory.type === 'single') {
         const existCategoryIndex = selectedOptions.single.findIndex(
            x => x.modifierCategoryID == eachModifierCategory.id
         )
         //single-->already exist category
         if (existCategoryIndex !== -1) {
            //for uncheck the option
            if (
               selectedOptions.single[existCategoryIndex][
                  'modifierCategoryOptionsID'
               ] === eachOption.id &&
               !eachModifierCategory.isRequired
            ) {
               const newSelectedOptions = selectedOptions.single.filter(
                  x =>
                     x.modifierCategoryID !== eachModifierCategory.id &&
                     x.modifierCategoryOptionsID !== eachOption.id
               )
               setSelectedOptions({
                  ...selectedOptions,
                  single: newSelectedOptions,
               })
               return
            }
            const newSelectedOptions = selectedOptions.single
            newSelectedOptions[existCategoryIndex] = selectedOption
            setSelectedOptions({
               ...selectedOptions,
               single: newSelectedOptions,
            })
            return
         } else {
            //single--> already not exist
            setSelectedOptions({
               ...selectedOptions,
               single: [...selectedOptions.single, selectedOption],
            })
            return
         }
      }
      if (eachModifierCategory.type === 'multiple') {
         const existOptionIndex = selectedOptions.multiple.findIndex(
            x => x.modifierCategoryOptionsID == eachOption.id
         )

         //already exist option
         if (existOptionIndex !== -1) {
            const newSelectedOptions = selectedOptions.multiple.filter(
               x => x.modifierCategoryOptionsID !== eachOption.id
            )
            setSelectedOptions({
               ...selectedOptions,
               multiple: newSelectedOptions,
            })
            return
         }
         //new option select
         else {
            setSelectedOptions({
               ...selectedOptions,
               multiple: [...selectedOptions.multiple, selectedOption],
            })
         }
      }
   }
   // add product(s) to cartItem
   const handleAddOnCart = () => {
      //check category fulfillment conditions
      const allSelectedOptions = [
         ...selectedOptions.single,
         ...selectedOptions.multiple,
      ]
      //no modifier available in product options
      if (!selectedProductOption.modifier) {
         // addToCart({ ...productOption, quantity })
         const cartItem = getCartItemWithModifiers(
            selectedProductOption.cartItem,
            allSelectedOptions.map(x => x.cartItem)
         )

         addToCart(cartItem, quantity)
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
         if (edit || forNewItem) {
            onCloseModifier()
            return
         }

         // not open GO TO MENU - CHECKOUT popup
         if (
            !config.kioskSettings.popupSettings.showGoToMenuCheckoutPopup.value
         ) {
            onCloseModifier()
            return
         }

         setShowProceedPopup(true)
         return
      }

      let allCatagories = selectedProductOption.modifier?.categories || []

      let errorState = []
      for (let i = 0; i < allCatagories.length; i++) {
         const allFoundedOptionsLength = allSelectedOptions.filter(
            x => x.modifierCategoryID === allCatagories[i].id
         ).length

         if (
            allCatagories[i]['isRequired'] &&
            allCatagories[i]['type'] === 'multiple'
         ) {
            const min = allCatagories[i]['limits']['min']
            const max = allCatagories[i]['limits']['max']
            if (
               allFoundedOptionsLength > 0 &&
               min <= allFoundedOptionsLength &&
               (max
                  ? allFoundedOptionsLength <= max
                  : allFoundedOptionsLength <= allCatagories[i].options.length)
            ) {
            } else {
               errorState.push(allCatagories[i].id)
               // setErrorCategories([...errorCategories, allCatagories[i].id])
            }
         }
      }
      setErrorCategories(errorState)
      if (errorState.length > 0) {
         console.log('FAIL')
         return
      } else {
         console.log('PASS')
         let cartItem
         const idNestedVerify = nestedModifierRef?.current?.modifierValidation()
         const additionalNestedVerify =
            additionalModifierRef?.current?.additionalModifiersValidation()
         const additionalModifierVerify =
            additionalModifierRef?.current?.additionalModifiersSelfValidation()

         if (
            (idNestedVerify && idNestedVerify.status == false) ||
            (additionalNestedVerify &&
               additionalNestedVerify.status == false) ||
            (additionalModifierVerify &&
               additionalModifierVerify.status == false)
         ) {
            return
         } else if (
            (idNestedVerify && idNestedVerify.status) ||
            (additionalNestedVerify && additionalNestedVerify.status) ||
            (additionalModifierVerify && additionalModifierVerify.status)
         ) {
            let resultantNested = []
            let resultantParentModifier = [
               ...allSelectedOptions.map(x => x.cartItem),
               ...additionalModifierVerify.data.map(x => x.cartItem),
            ]
            if (additionalNestedVerify && additionalNestedVerify.status) {
               resultantNested = [...resultantNested, additionalNestedVerify]
            }
            if (idNestedVerify && idNestedVerify.status) {
               resultantNested = [...resultantNested, idNestedVerify]
            }

            cartItem = getCartItemWithModifiers(
               selectedProductOption.cartItem,
               resultantParentModifier,
               resultantNested
            )
         } else {
            cartItem = getCartItemWithModifiers(
               selectedProductOption.cartItem,
               allSelectedOptions.map(x => x.cartItem)
            )
         }

         addToCart(cartItem, quantity)
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

         if (edit || forNewItem) {
            onCloseModifier()
            return
         }
         // not open GO TO MENU - CHECKOUT popup
         if (
            !config.kioskSettings.popupSettings.showGoToMenuCheckoutPopup.value
         ) {
            onCloseModifier()
            return
         }
         setShowProceedPopup(true)
         return
      }
   }

   //render conditional text
   const renderConditionText = category => {
      if (category.type === 'single') {
         return locale == 'ar' ? 'إختر واحد*' : 'CHOOSE ONE*'
      } else {
         if (category.isRequired) {
            if (category.limits.min) {
               if (category.limits.max) {
                  return `(CHOOSE AT LEAST ${category.limits.min} AND AT MOST ${category.limits.max})*`
               } else {
                  return `(CHOOSE AT LEAST ${category.limits.min})*`
               }
            } else {
               if (category.limits.max) {
                  return `(CHOOSE AT LEAST 1 AND AT MOST ${category.limits.max})*`
               } else {
                  return locale == 'ar'
                     ? 'إختر خيار واحد على الأقل'
                     : `(CHOOSE AT LEAST 1)*`
               }
            }
         } else {
            if (category.limits.max) {
               return `(CHOOSE AS MANY AS YOU LIKE UPTO ${category.limits.max})`
            } else {
               return locale == 'ar'
                  ? 'إختر زي ما تحب'
                  : '(CHOOSE AS MANY AS YOU LIKE)'
            }
         }
      }
   }

   const totalAmount = () => {
      const productOptionPrice = selectedProductOption.price
      const productOptionDiscount = selectedProductOption.discount
      let allSelectedOptions = [
         ...selectedOptions.single,
         ...selectedOptions.multiple,
      ]
      const nestedSelectedOptions =
         nestedModifierRef?.current?.nestedSelectedModifiers()
      const additionalNestedSelectedOptions =
         additionalModifierRef?.current?.additionalNestedModifiers()

      if (nestedSelectedOptions) {
         allSelectedOptions = [
            ...allSelectedOptions,
            ...nestedSelectedOptions.single,
            ...nestedSelectedOptions.multiple,
         ]
      }
      if (additionalNestedSelectedOptions) {
         allSelectedOptions = [
            ...allSelectedOptions,
            ...additionalNestedSelectedOptions.single,
            ...additionalNestedSelectedOptions.multiple,
         ]
      }
      let allSelectedOptionsPrice = 0
      allSelectedOptions.forEach(
         x =>
            (allSelectedOptionsPrice =
               allSelectedOptionsPrice +
               (x?.modifierCategoryOptionsPrice || 0) -
               (x?.modifierCategoryOptionsDiscount || 0))
      )

      const totalPrice =
         productOptionPrice +
         allSelectedOptionsPrice +
         productData.price -
         productData.discount -
         productOptionDiscount
      return totalPrice * quantity
   }

   // used for add new product or edit product
   useEffect(() => {
      if (forNewItem || edit) {
         const productOptionId = productCartDetail.childs[0].productOption.id
         const modifierCategoryOptionsIds =
            productCartDetail.childs[0].childs.map(x => x?.modifierOption?.id)

         //selected product option
         const selectedProductOption = productData.productOptions.find(
            x => x.id == productOptionId
         )

         //selected modifiers
         let singleModifier = []
         let multipleModifier = []
         if (selectedProductOption.modifier) {
            selectedProductOption.modifier.categories.forEach(category => {
               category.options.forEach(option => {
                  const selectedOption = {
                     modifierCategoryID: category.id,
                     modifierCategoryOptionsID: option.id,
                     modifierCategoryOptionsPrice: option.price,
                     cartItem: option.cartItem,
                  }
                  if (category.type === 'single') {
                     if (modifierCategoryOptionsIds.includes(option.id)) {
                        singleModifier = singleModifier.concat(selectedOption)
                     }
                  }
                  if (category.type === 'multiple') {
                     if (modifierCategoryOptionsIds.includes(option.id)) {
                        multipleModifier =
                           multipleModifier.concat(selectedOption)
                     }
                  }
               })
            })
         }

         setSelectedProductOption(selectedProductOption)
         setSelectedOptions(prevState => ({
            ...prevState,
            single: singleModifier,
            multiple: multipleModifier,
         }))
         if (edit) {
            setQuantity(productCartDetail.ids.length)
         }
         setStatus('success')
      }
   }, [])

   useEffect(() => {
      // default selected modifiers
      if (!(forNewItem || edit)) {
         let singleModifier = []
         let multipleModifier = []
         if (selectedProductOption.modifier) {
            selectedProductOption.modifier.categories.forEach(eachCategory => {
               if (eachCategory.type === 'single' && eachCategory.isRequired) {
                  // default selected modifier option
                  // select first option which has zero price

                  const firstOptionWithZeroPrice = eachCategory.options.find(
                     option => option.price === 0
                  )
                     ? eachCategory.options.find(option => option.price === 0)
                     : eachCategory.options[0]

                  const defaultModifierSelectedOption = {
                     modifierCategoryID: eachCategory.id,
                     modifierCategoryOptionsID: firstOptionWithZeroPrice.id,
                     modifierCategoryOptionsPrice:
                        firstOptionWithZeroPrice.price,
                     modifierCategoryOptionsDiscount:
                        firstOptionWithZeroPrice.discount,
                     cartItem: firstOptionWithZeroPrice.cartItem,
                  }
                  singleModifier = [
                     ...singleModifier,
                     defaultModifierSelectedOption,
                  ]
               } else if (
                  eachCategory.type === 'multiple' &&
                  eachCategory.isRequired
               ) {
                  // select options which has price zero
                  const optionsWithZeroPrice = eachCategory.options.filter(
                     option => option.price === 0
                  )
                  const optionsWithOutZeroPrice = eachCategory.options.filter(
                     option => option.price !== 0
                  )
                  const defaultMultiSelectedOptions =
                     optionsWithZeroPrice.length >= eachCategory.limits.min
                        ? optionsWithZeroPrice.slice(0, eachCategory.limits.min)
                        : [
                             ...optionsWithZeroPrice,
                             ...optionsWithOutZeroPrice.slice(
                                0,
                                eachCategory.limits.min -
                                   optionsWithZeroPrice.length
                             ),
                          ]

                  defaultMultiSelectedOptions.forEach(eachModifierOption => {
                     // default selected modifier option
                     const defaultModifierSelectedOption = {
                        modifierCategoryID: eachCategory.id,
                        modifierCategoryOptionsID: eachModifierOption.id,
                        modifierCategoryOptionsPrice: eachModifierOption.price,
                        modifierCategoryOptionsDiscount:
                           eachModifierOption.discount,
                        cartItem: eachModifierOption.cartItem,
                     }
                     multipleModifier = [
                        ...multipleModifier,
                        defaultModifierSelectedOption,
                     ]
                  })
               }
            })
         }
         setSelectedOptions(prevState => ({
            ...prevState,
            single: singleModifier,
            multiple: multipleModifier,
         }))
      }
   }, [selectedProductOption])

   useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [selectedProductOption])

   if (showProceedPopup) {
      return (
         <Modal
            visible={showProceedPopup}
            centered={true}
            closable={false}
            footer={null}
            onCancel={() => {
               onCloseModifier()
               setShowProceedPopup(false)
            }}
            zIndex={'100000000000000000000'}
         >
            <div
               style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
               }}
            >
               <KioskButton
                  onClick={() => {
                     onCloseModifier()
                     setShowProceedPopup(false)
                  }}
                  style={{
                     border: `2px solid ${config.kioskSettings.theme.secondaryColor.value}`,
                     background: 'transparent',
                     padding: '.1em 2em',
                  }}
               >
                  {t('GO TO MENU')}
               </KioskButton>
               <KioskButton
                  style={{ padding: '.1em 2em' }}
                  onClick={() => {
                     setCurrentPage('cartPage')
                  }}
               >
                  {t('CHECKOUT')}
               </KioskButton>
            </div>
         </Modal>
      )
   }
   return (
      <div className="hern-kiosk__menu-product-modifier-popup">
         <div className="hern-kiosk__menu-product-modifier-popup--bg"></div>

         <div
            className="hern-kiosk__menu-product-modifier-pop-up-container"
            style={{ background: '#0F6BB1' }}
            ref={modifierPopRef}
         >
            <div
               onClick={() => {
                  onCloseModifier()
               }}
               style={{
                  position: 'absolute',
                  right: '2em',
                  top: '2em',
                  background: `${config.kioskSettings.theme.primaryColorDark.value}}`,
                  borderRadius: '50%',
                  padding: '.5em',
               }}
            >
               <CloseIcon
                  size={50}
                  stroke={'#fffffF'}
                  style={{
                     position: 'fixed',
                     right: '8em',
                     top: '12em',
                     zIndex: '2',
                     padding: '0.4em',
                     borderRadius: '50%',
                     backgroundColor: `#022d4a`,
                  }}
               />
            </div>
            <div
               style={{
                  backgroundColor: `${config.kioskSettings.theme.primaryColorLight.value}99`,
               }}
               className="hern-kiosk__menu-product-modifier-header"
            >
               {/* <div
                  className="hern-kiosk__menu-product-modifier-customize-text"
                  style={{
                     BackgroundColor: `${config.kioskSettings.theme.primaryColorLight.value}99`,
                  }}
               >
                  {t('Customize')}
               </div> */}
               {productData.assets.images.length === 0 ? (
                  <img
                     src={config.productSettings.defaultImage.value}
                     style={{ height: '680px' }}
                  />
               ) : (
                  <Carousel style={{ height: '20em', width: '20em' }}>
                     {productData.assets.images.map((eachImage, index) => (
                        <img
                           src={eachImage}
                           key={index}
                           style={{ height: '680px', width: '100%' }}
                           className="hern-kiosk__menu-product-modifier-header-image"
                        />
                     ))}
                  </Carousel>
               )}
               {/* <KioskCounterButton
                  config={config}
                  quantity={quantity}
                  onPlusClick={onPlusClick}
                  onMinusClick={onMinusClick}
                  style={{ margin: '2em 0 0 0' }}
               /> */}
            </div>
            <div
               className="hern-kiosk__menu-product-modifier-brief"
               style={{
                  backgroundColor: `${config.kioskSettings.theme.primaryColor.value}`,
               }}
            >
               <span
                  className="hern-kiosk__menu-product-modifier-p-name"
                  style={{
                     color: `${config.kioskSettings.theme.modifierTextColor.value}`,
                  }}
                  data-translation="true"
                  data-original-value={productData.name}
               >
                  {productData.name}
               </span>
               <span
                  className="hern-kiosk__menu-product-modifier-p-price"
                  style={{
                     color: `${config.kioskSettings.theme.modifierTextColor.value}`,
                  }}
               >
                  {productData.price > 0 &&
                     formatCurrency(productData.price - productData.discount)}
               </span>
            </div>
            {productData.productOptions.length === 1 ? (
               config.productSettings.showSingleProductOption.value ? (
                  <div
                     className="hern-kiosk__modifier-popup-product-options"
                     style={{
                        backgroundColor: `${config.kioskSettings.theme.primaryColor.value}`,
                     }}
                  >
                     {productData.productOptions.map((eachOption, index) => (
                        <button
                           value={eachOption.id}
                           key={eachOption.id}
                           className="hern-kiosk__modifier-product-option"
                           style={{
                              backgroundColor:
                                 selectedProductOption.id === eachOption.id
                                    ? config.kioskSettings.theme
                                         .primaryColorDark.value
                                    : 'transparent',
                              color: '#ffffff',
                              border:
                                 selectedProductOption.id === eachOption.id
                                    ? `2px solid ${config.kioskSettings.theme.successColor.value}`
                                    : `2px solid ${config.kioskSettings.theme.primaryColorDark.value}`,
                           }}
                           onClick={() => {
                              const productOption =
                                 productData.productOptions.find(
                                    x => x.id == eachOption.id
                                 )
                              // when changing product option previous selected should be removed
                              setSelectedOptions({ single: [], multiple: [] })
                              setSelectedProductOption(productOption)
                           }}
                        >
                           <span
                              data-name={eachOption.label}
                              data-translation="true"
                              data-original-value={eachOption.label}
                           >
                              {eachOption.label}
                           </span>
                           {' (+ '}
                           {formatCurrency(
                              eachOption.price - eachOption.discount
                           )}
                           {')'}
                        </button>
                     ))}
                  </div>
               ) : null
            ) : (
               <div
                  className="hern-kiosk__modifier-popup-product-options"
                  style={{
                     backgroundColor: `${config.kioskSettings.theme.primaryColor.value}`,
                  }}
               >
                  {productData.productOptions.map((eachOption, index) => (
                     <button
                        value={eachOption.id}
                        key={eachOption.id}
                        className="hern-kiosk__modifier-product-option"
                        style={{
                           backgroundColor:
                              selectedProductOption.id === eachOption.id
                                 ? config.kioskSettings.theme.primaryColorDark
                                      .value
                                 : 'transparent',
                           color: '#ffffff',
                           border:
                              selectedProductOption.id === eachOption.id
                                 ? `2px solid ${config.kioskSettings.theme.successColor.value}`
                                 : `2px solid ${config.kioskSettings.theme.primaryColorDark.value}`,
                        }}
                        onClick={() => {
                           const productOption =
                              productData.productOptions.find(
                                 x => x.id == eachOption.id
                              )
                           // when changing product option previous selected should be removed
                           setSelectedOptions({ single: [], multiple: [] })
                           setSelectedProductOption(productOption)
                        }}
                     >
                        <span
                           data-name={eachOption.label}
                           data-translation="true"
                           data-original-value={eachOption.label}
                        >
                           {eachOption.label}
                        </span>
                        {' (+ '}
                        {formatCurrency(eachOption.price - eachOption.discount)}
                        {')'}
                     </button>
                  ))}
               </div>
            )}

            {productData.additionalText && (
               <div className="hern-kiosk__product-modifier-p-additional-text">
                  <span
                     style={{
                        color: `${config.kioskSettings.theme.modifierTextColor.value}`,
                     }}
                     data-translation="true"
                     data-original-value={productData.additionalText}
                  >
                     {productData.additionalText}
                  </span>
               </div>
            )}
            {/* <div className="hern-kiosk__modifier-popup-modifiers-list"> */}
            {selectedProductOption.additionalModifiers.length > 0 &&
               selectedProductOption.additionalModifiers.map(
                  (eachAdditionalModifier, index) => (
                     <AdditionalModifiers
                        ref={additionalModifierRef}
                        eachAdditionalModifier={eachAdditionalModifier}
                        selectedProductOption={selectedProductOption}
                        onCheckClick={onCheckClick}
                        config={config}
                        key={`${eachAdditionalModifier.modifierId}-${eachAdditionalModifier.productOption}`}
                        renderConditionText={renderConditionText}
                        errorCategories={errorCategories}
                        selectedOptions={selectedOptions}
                        edit={edit}
                        forNewItem={forNewItem}
                        productCartDetail={productCartDetail}
                        setChildChangingToggle={setChildChangingToggle}
                     />
                  )
               )}

            {selectedProductOption.modifier &&
               selectedProductOption.modifier.categories.map(
                  (eachModifierCategory, index) => {
                     return (
                        <div
                           className="hern-kiosk__modifier-popup-modifier-category"
                           style={{
                              backgroundColor: `${config.kioskSettings.theme.primaryColorDark.value}`,
                           }}
                           key={eachModifierCategory.id}
                        >
                           <label className="hern-kiosk__modifier-category-label">
                              <Badge
                                 count={index + 1}
                                 style={{
                                    backgroundColor: '#ffffff',
                                    color: `${config.kioskSettings.theme.primaryColor.value}`,
                                    fontWeight: '600',
                                 }}
                              />
                              <span
                                 className="hern-kiosk__modifier-category-label-text"
                                 style={{
                                    color: `${config.kioskSettings.theme.modifierTextColor.value}`,
                                 }}
                                 data-translation="true"
                                 data-original-value={eachModifierCategory.name}
                              >
                                 {eachModifierCategory.name}
                              </span>
                              <span className="hern-kiosk__modifier-category-selection-condition">
                                 {'('}
                                 {renderConditionText(eachModifierCategory)}
                                 {')'}
                              </span>
                           </label>
                           {errorCategories.includes(
                              eachModifierCategory.id
                           ) && (
                              <>
                                 <span
                                    style={{
                                       fontStyle: 'italic',
                                       fontSize: '1.7em',
                                       color: `${config.kioskSettings.theme.categorySelectionWarningColor.value}`,
                                    }}
                                 >
                                    {'('}
                                    {t(`You have to choose this category`)}
                                    {')'}
                                 </span>
                              </>
                           )}
                           <div className="hern-kiosk__modifier-category-options">
                              {eachModifierCategory.options.map(
                                 (eachOption, index) => {
                                    const isModifierOptionInProduct = () => {
                                       const isOptionSelected = selectedOptions[
                                          eachModifierCategory.type
                                       ].find(
                                          x =>
                                             x.modifierCategoryID ===
                                                eachModifierCategory.id &&
                                             x.modifierCategoryOptionsID ===
                                                eachOption.id
                                       )
                                       return Boolean(isOptionSelected)
                                    }

                                    return (
                                       <>
                                          <div
                                             key={eachOption.id}
                                             className="hern-kiosk__modifier-category-option"
                                             onClick={() => {
                                                onCheckClick(
                                                   eachOption,
                                                   eachModifierCategory
                                                )
                                             }}
                                          >
                                             <div className="hern-kiosk__modifier-category-right">
                                                <img
                                                   className="hern-kiosk__modifier-category-option-image"
                                                   alt="modifier image"
                                                   src={
                                                      eachOption.image ||
                                                      config.productSettings
                                                         .defaultImage.value
                                                   }
                                                />

                                                <span className="hern-kiosk__modifier--option-name">
                                                   <span
                                                      data-translation="true"
                                                      data-original-value={
                                                         eachOption.name
                                                      }
                                                   >
                                                      {eachOption.name}
                                                   </span>
                                                   {eachOption.price > 0 && (
                                                      <>
                                                         {' ('}
                                                         {formatCurrency(
                                                            eachOption.price -
                                                               eachOption.discount
                                                         )}
                                                         {')'}
                                                      </>
                                                   )}
                                                </span>
                                             </div>
                                             {isModifierOptionInProduct() ? (
                                                <RoundCheckBoxIcon
                                                   fill={
                                                      config.kioskSettings
                                                         .tickBox
                                                         .tickBoxBGonCheck.value
                                                   }
                                                   tickFill={
                                                      config.kioskSettings
                                                         .tickBox.tickColor
                                                         .value
                                                   }
                                                   size={50}
                                                />
                                             ) : (
                                                <NoTickRoundCheckBoxIcon
                                                   fill={
                                                      config.kioskSettings.theme
                                                         .primaryColor.value
                                                   }
                                                   size={50}
                                                   onClick={() => {
                                                      onCheckClick(
                                                         eachOption,
                                                         eachModifierCategory
                                                      )
                                                   }}
                                                />
                                             )}
                                             {eachOption.additionalModifierTemplateId && (
                                                <span
                                                   className={classNames(
                                                      'hern-kiosk__modifier-option-customize',
                                                      {
                                                         'hern-kiosk__modifier-option-customize-rtl':
                                                            direction == 'rtl',
                                                         'hern-kiosk__modifier-option-customize-ltr':
                                                            direction == 'ltr',
                                                      }
                                                   )}
                                                   onClick={() => {
                                                      setShowNestedModifierOptions(
                                                         prev => !prev
                                                      )
                                                   }}
                                                   style={{
                                                      color: config
                                                         .kioskSettings.theme
                                                         .modifierTextColor
                                                         .value,
                                                   }}
                                                >
                                                   {t('Customize')}
                                                </span>
                                             )}
                                          </div>
                                          {showNestedModifierOptions &&
                                             eachOption.additionalModifierTemplateId && (
                                                <ModifierOptionsList
                                                   ref={nestedModifierRef}
                                                   nestedModifierTemplateId={
                                                      eachOption.additionalModifierTemplateId
                                                   }
                                                   modifierOptionId={
                                                      eachOption.id
                                                   }
                                                   nestedModifierTemplateRequired={
                                                      eachOption.isAdditionalModifierRequired
                                                   }
                                                   selectedOptions={
                                                      selectedOptions
                                                   }
                                                   config={config}
                                                   onCheckClick={onCheckClick}
                                                   errorCategories={
                                                      errorCategories
                                                   }
                                                   renderConditionText={
                                                      renderConditionText
                                                   }
                                                   edit={edit}
                                                   forNewItem={forNewItem}
                                                   productCartDetail={
                                                      productCartDetail
                                                   }
                                                   setChildChangingToggle={
                                                      setChildChangingToggle
                                                   }
                                                />
                                             )}
                                       </>
                                    )
                                 }
                              )}
                           </div>
                        </div>
                     )
                  }
               )}
            {/* </div> */}
            <div
               className="hern-kiosk__modifier-popup-footer"
               style={{
                  backgroundColor: `${config.kioskSettings.theme.primaryColor.value}`,
               }}
            >
               <div>
                  <span
                     className="hern-kiosk__modifier-total-label"
                     style={{
                        color: `${config.kioskSettings.theme.secondaryColor.value}`,
                     }}
                  >
                     {t('Total')}
                  </span>
                  <span className="hern-kiosk__modifier-total-price">
                     {formatCurrency(totalAmount())}
                  </span>
               </div>
               <KioskButton
                  onClick={handleAddOnCart}
                  customClass="hern-kiosk__modifier-add-to-cart"
               >
                  {t('Add To Cart')}
               </KioskButton>
            </div>
         </div>
      </div>
   )
}
const AdditionalModifiers = forwardRef(
   (
      {
         eachAdditionalModifier,
         config,
         renderConditionText,
         forNewItem,
         edit,
         productCartDetail,
         setChildChangingToggle,
      },
      ref
   ) => {
      const additionalModifiersType = React.useMemo(
         () => eachAdditionalModifier.type == 'hidden',
         [eachAdditionalModifier]
      )
      const [showCustomize, setShowCustomize] = useState(
         !Boolean(additionalModifiersType)
      )
      const [additionalModifierOptions, setAdditionalModifierOptions] =
         useState({
            single: [],
            multiple: [],
         })

      const [showNestedModifierOptions, setShowNestedModifierOptions] =
         useState(false)
      const [errorCategories, setErrorCategories] = useState([])

      const { t, dynamicTrans, direction } = useTranslation()
      useEffect(() => {
         const languageTags = document.querySelectorAll(
            '[data-translation="true"]'
         )
         dynamicTrans(languageTags)
      }, [showCustomize])
      const nestedModifierRef = React.useRef()

      // for edit aur new item
      useEffect(() => {
         if (forNewItem || edit) {
            const modifierCategoryOptionsIds =
               productCartDetail.childs[0].childs.map(
                  x => x?.modifierOption?.id
               )

            //selected modifiers
            let singleModifier = []
            let multipleModifier = []
            if (eachAdditionalModifier) {
               eachAdditionalModifier.modifier.categories.forEach(category => {
                  category.options.forEach(option => {
                     const selectedOption = {
                        modifierCategoryID: category.id,
                        modifierCategoryOptionsID: option.id,
                        modifierCategoryOptionsPrice: option.price,
                        cartItem: option.cartItem,
                     }
                     if (category.type === 'single') {
                        if (modifierCategoryOptionsIds.includes(option.id)) {
                           singleModifier =
                              singleModifier.concat(selectedOption)
                        }
                     }
                     if (category.type === 'multiple') {
                        if (modifierCategoryOptionsIds.includes(option.id)) {
                           multipleModifier =
                              multipleModifier.concat(selectedOption)
                        }
                     }
                  })
               })
            }
            setAdditionalModifierOptions(prevState => ({
               ...prevState,
               single: singleModifier,
               multiple: multipleModifier,
            }))
         }
      }, [])

      useEffect(() => {
         setChildChangingToggle(prev => !prev)
      }, [additionalModifierOptions])

      // initial default selection
      useEffect(() => {
         if (!(forNewItem || edit)) {
            let singleModifier = []
            let multipleModifier = []
            eachAdditionalModifier.modifier.categories.forEach(eachCategory => {
               if (eachCategory.type === 'single' && eachCategory.isRequired) {
                  // default selected modifier option
                  const defaultModifierSelectedOption = {
                     modifierCategoryID: eachCategory.id,
                     modifierCategoryOptionsID: eachCategory.options[0].id,
                     modifierCategoryOptionsPrice:
                        eachCategory.options[0].price,
                     modifierCategoryOptionsDiscount:
                        eachCategory.options[0].discount,
                     cartItem: eachCategory.options[0].cartItem,
                  }
                  singleModifier = [
                     ...singleModifier,
                     defaultModifierSelectedOption,
                  ]
               } else if (
                  eachCategory.type === 'multiple' &&
                  eachCategory.isRequired
               ) {
                  const defaultSelectedOptions = eachCategory.options.slice(
                     0,
                     eachCategory.limits.min
                  )
                  defaultSelectedOptions.forEach(eachModifierOption => {
                     // default selected modifier option
                     const defaultModifierSelectedOption = {
                        modifierCategoryID: eachCategory.id,
                        modifierCategoryOptionsID: eachModifierOption.id,
                        modifierCategoryOptionsPrice: eachModifierOption.price,
                        modifierCategoryOptionsDiscount:
                           eachModifierOption.discount,
                        cartItem: eachModifierOption.cartItem,
                     }
                     multipleModifier = [
                        ...multipleModifier,
                        defaultModifierSelectedOption,
                     ]
                  })
               }
            })
            setAdditionalModifierOptions(prevState => ({
               ...prevState,
               single: singleModifier,
               multiple: multipleModifier,
            }))
         }
      }, [])

      useImperativeHandle(ref, () => ({
         // validation for additional modifier option it self
         additionalModifiersSelfValidation() {
            const allSelectedOptions = [
               ...additionalModifierOptions.single,
               ...additionalModifierOptions.multiple,
            ]
            let allCatagories = eachAdditionalModifier.modifier.categories || []

            let errorState = []
            for (let i = 0; i < allCatagories.length; i++) {
               const allFoundedOptionsLength = allSelectedOptions.filter(
                  x => x.modifierCategoryID === allCatagories[i].id
               ).length

               if (
                  allCatagories[i]['isRequired'] &&
                  allCatagories[i]['type'] === 'multiple'
               ) {
                  const min = allCatagories[i]['limits']['min']
                  const max = allCatagories[i]['limits']['max']
                  if (
                     allFoundedOptionsLength > 0 &&
                     min <= allFoundedOptionsLength &&
                     (max
                        ? allFoundedOptionsLength <= max
                        : allFoundedOptionsLength <=
                          allCatagories[i].options.length)
                  ) {
                  } else {
                     errorState.push(allCatagories[i].id)
                     // setErrorCategories([...errorCategories, allCatagories[i].id])
                  }
               }
            }
            setErrorCategories(errorState)
            if (errorState.length > 0) {
               return { status: false }
            } else {
               return { status: true, data: allSelectedOptions }
            }
         },

         // selected additional modifiers
         additionalSelfModifiers() {
            return additionalModifierOptions
         },

         // additional modifier's childs validation
         additionalModifiersValidation() {
            return nestedModifierRef?.current?.modifierValidation()
         },

         // additional modifier option's modifiers options
         additionalNestedModifiers() {
            return nestedModifierRef?.current?.nestedSelectedModifiers()
         },
      }))
      // on check click
      const onCheckClick = (eachOption, eachModifierCategory) => {
         //selected option
         const selectedOption = {
            modifierCategoryID: eachModifierCategory.id,
            modifierCategoryOptionsID: eachOption.id,
            modifierCategoryOptionsPrice: eachOption.price,
            modifierCategoryOptionsDiscount: eachOption.discount,
            cartItem: eachOption.cartItem,
         }
         //modifierCategoryOptionID
         //modifierCategoryID
         if (eachModifierCategory.type === 'single') {
            const existCategoryIndex =
               additionalModifierOptions.single.findIndex(
                  x => x.modifierCategoryID == eachModifierCategory.id
               )
            //single-->already exist category
            if (existCategoryIndex !== -1) {
               //for uncheck the option
               if (
                  additionalModifierOptions.single[existCategoryIndex][
                     'modifierCategoryOptionsID'
                  ] === eachOption.id &&
                  !eachModifierCategory.isRequired
               ) {
                  const newSelectedOptions =
                     additionalModifierOptions.single.filter(
                        x =>
                           x.modifierCategoryID !== eachModifierCategory.id &&
                           x.modifierCategoryOptionsID !== eachOption.id
                     )
                  setAdditionalModifierOptions({
                     ...additionalModifierOptions,
                     single: newSelectedOptions,
                  })
                  return
               }
               const newSelectedOptions = additionalModifierOptions.single
               additionalModifierOptions[existCategoryIndex] = selectedOption
               setAdditionalModifierOptions({
                  ...additionalModifierOptions,
                  single: newSelectedOptions,
               })
               return
            } else {
               //single--> already not exist
               setAdditionalModifierOptions({
                  ...additionalModifierOptions,
                  single: [...additionalModifierOptions.single, selectedOption],
               })
               return
            }
         }
         if (eachModifierCategory.type === 'multiple') {
            const existOptionIndex =
               additionalModifierOptions.multiple.findIndex(
                  x => x.modifierCategoryOptionsID == eachOption.id
               )

            //already exist option
            if (existOptionIndex !== -1) {
               const newSelectedOptions =
                  additionalModifierOptions.multiple.filter(
                     x => x.modifierCategoryOptionsID !== eachOption.id
                  )
               setAdditionalModifierOptions({
                  ...additionalModifierOptions,
                  multiple: newSelectedOptions,
               })
               return
            }
            //new option select
            else {
               setAdditionalModifierOptions({
                  ...additionalModifierOptions,
                  multiple: [
                     ...additionalModifierOptions.multiple,
                     selectedOption,
                  ],
               })
            }
         }
      }
      return (
         <>
            <div
               className="hern-kiosk__additional-modifier"
               style={{
                  backgroundColor: `${config.kioskSettings.theme.primaryColorDark.value}`,
               }}
            >
               <div
                  className="hern-kiosk__additional-modifier-header"
                  onClick={() => setShowCustomize(prev => !prev)}
               >
                  <span
                     className="hern-kiosk__additional-modifier-label"
                     style={{ color: '#ffffff' }}
                     data-translation="true"
                     data-original-value={eachAdditionalModifier.label}
                  >
                     {eachAdditionalModifier.label}
                  </span>
                  {/* {additionalModifiersType && (
                              <span
                                 className="hern-kiosk__additional-modifier-customize"
                                 style={{ color: '#ffffff' }}
                              >
                                 {t('Customize')}
                              </span>
                           )} */}
                  {showCustomize ? (
                     <UpVector stroke="#ffffff" />
                  ) : (
                     <DownVector stroke="#ffffff" />
                  )}
               </div>
               {showCustomize &&
                  eachAdditionalModifier.modifier &&
                  eachAdditionalModifier.modifier.categories.map(
                     (eachModifierCategory, index) => {
                        eachModifierCategory.options.length = 1
                        return (
                           <div
                              className="hern-kiosk__modifier-popup-modifier-category hern-kiosk__modifier-popup-modifier-category--nested"
                              style={{
                                 backgroundColor: `${config.kioskSettings.theme.primaryColorDark.value}`,
                              }}
                           >
                              <label className="hern-kiosk__modifier-category-label">
                                 <Badge
                                    count={index + 1}
                                    style={{
                                       backgroundColor: '#ffffff',
                                       color: `${config.kioskSettings.theme.primaryColor.value}`,
                                       fontWeight: '600',
                                    }}
                                 />
                                 <span
                                    className="hern-kiosk__modifier-category-label-text"
                                    style={{
                                       color: `${config.kioskSettings.theme.modifierTextColor.value}`,
                                    }}
                                    data-translation="true"
                                    data-original-value={
                                       eachModifierCategory.name
                                    }
                                 >
                                    {eachModifierCategory.name}
                                 </span>
                                 <span className="hern-kiosk__modifier-category-selection-condition">
                                    {'('}
                                    {renderConditionText(eachModifierCategory)}
                                    {')'}
                                 </span>
                                 {errorCategories.includes(
                                    eachModifierCategory.id
                                 ) && (
                                    <>
                                       <br />
                                       <span
                                          style={{
                                             fontStyle: 'italic',
                                             fontSize: '1em',
                                             color: `${config.kioskSettings.theme.categorySelectionWarningColor.value}`,
                                          }}
                                       >
                                          {'('}
                                          {t(`You have to choose
                                                      this category`)}
                                          {')'}
                                       </span>
                                    </>
                                 )}
                              </label>
                              <div className="hern-kiosk__modifier-category-options">
                                 {eachModifierCategory.options.map(
                                    (eachOption, index) => {
                                       const isModifierOptionInProduct = () => {
                                          const isOptionSelected =
                                             additionalModifierOptions[
                                                eachModifierCategory.type
                                             ].find(
                                                x =>
                                                   x.modifierCategoryID ===
                                                      eachModifierCategory.id &&
                                                   x.modifierCategoryOptionsID ===
                                                      eachOption.id
                                             )
                                          return Boolean(isOptionSelected)
                                       }
                                       return (
                                          <>
                                             <div
                                                key={index}
                                                className="hern-kiosk__modifier-category-option"
                                                onClick={() => {
                                                   onCheckClick(
                                                      eachOption,
                                                      eachModifierCategory
                                                   )
                                                }}
                                             >
                                                <div className="hern-kiosk__modifier-category-right">
                                                   <img
                                                      className="hern-kiosk__modifier-category-option-image"
                                                      alt="modifier image"
                                                      src={
                                                         eachOption.image ||
                                                         config.productSettings
                                                            .defaultImage.value
                                                      }
                                                   />

                                                   <span className="hern-kiosk__modifier--option-name">
                                                      <span
                                                         data-translation="true"
                                                         data-original-value={
                                                            eachOption.name
                                                         }
                                                      >
                                                         {eachOption.name}
                                                      </span>
                                                      {eachOption.price > 0 && (
                                                         <>
                                                            {' ('}
                                                            {formatCurrency(
                                                               eachOption.price -
                                                                  eachOption.discount
                                                            )}
                                                            {')'}
                                                         </>
                                                      )}
                                                   </span>
                                                </div>
                                                {isModifierOptionInProduct() ? (
                                                   <RoundCheckBoxIcon
                                                      fill={
                                                         config.kioskSettings
                                                            .tickBox
                                                            .tickBoxBGonCheck
                                                            .value
                                                      }
                                                      tickFill={
                                                         config.kioskSettings
                                                            .tickBox.tickColor
                                                            .value
                                                      }
                                                      size={50}
                                                   />
                                                ) : (
                                                   <NoTickRoundCheckBoxIcon
                                                      fill={
                                                         config.kioskSettings
                                                            .theme.primaryColor
                                                            .value
                                                      }
                                                      size={50}
                                                      onClick={() => {
                                                         onCheckClick(
                                                            eachOption,
                                                            eachModifierCategory
                                                         )
                                                      }}
                                                   />
                                                )}
                                                {eachOption.additionalModifierTemplateId && (
                                                   <span
                                                      className={classNames(
                                                         'hern-kiosk__modifier-option-customize',
                                                         {
                                                            'hern-kiosk__modifier-option-customize-rtl':
                                                               direction ==
                                                               'rtl',
                                                            'hern-kiosk__modifier-option-customize-ltr':
                                                               direction ==
                                                               'ltr',
                                                         }
                                                      )}
                                                      onClick={() => {
                                                         setShowNestedModifierOptions(
                                                            prev => !prev
                                                         )
                                                      }}
                                                      style={{
                                                         color: config
                                                            .kioskSettings.theme
                                                            .modifierTextColor
                                                            .value,
                                                      }}
                                                   >
                                                      {t('Customize')}
                                                   </span>
                                                )}
                                             </div>
                                             {showNestedModifierOptions &&
                                                eachOption.additionalModifierTemplateId && (
                                                   <ModifierOptionsList
                                                      ref={nestedModifierRef}
                                                      nestedModifierTemplateId={
                                                         eachOption.additionalModifierTemplateId
                                                      }
                                                      modifierOptionId={
                                                         eachOption.id
                                                      }
                                                      nestedModifierTemplateRequired={
                                                         eachOption.isAdditionalModifierRequired
                                                      }
                                                      config={config}
                                                      onCheckClick={
                                                         onCheckClick
                                                      }
                                                      errorCategories={
                                                         errorCategories
                                                      }
                                                      renderConditionText={
                                                         renderConditionText
                                                      }
                                                      edit={edit}
                                                      forNewItem={forNewItem}
                                                      productCartDetail={
                                                         productCartDetail
                                                      }
                                                      setChildChangingToggle={
                                                         setChildChangingToggle
                                                      }
                                                   />
                                                )}
                                          </>
                                       )
                                    }
                                 )}
                              </div>
                           </div>
                        )
                     }
                  )}
            </div>
         </>
      )
   }
)

const ModifierOptionsList = forwardRef((props, ref) => {
   const {
      nestedModifierTemplateId,
      config,
      renderConditionText,
      forNewItem,
      edit,
      productCartDetail,
      modifierOptionId,
      setChildChangingToggle,
   } = props
   const { brand, isConfigLoading, kioskDetails } = useConfig()
   const [errorCategories, setErrorCategories] = useState([])
   const [nestedSelectedOptions, setNestedSelectedOptions] = useState({
      single: [],
      multiple: [],
   })
   const { t, dynamicTrans } = useTranslation()

   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: kioskDetails?.locationId,
         },
      }),
      [brand]
   )
   const {
      loading: templateLoading,
      error: TemplateError,
      data,
   } = useQuery(GET_MODIFIER_BY_ID, {
      variables: {
         priceArgs: argsForByLocation,
         discountArgs: argsForByLocation,
         modifierCategoryOptionCartItemArgs: argsForByLocation,
         id: [nestedModifierTemplateId],
      },
      skip: isConfigLoading || !brand?.id,
   })

   useEffect(() => {
      setChildChangingToggle(prev => !prev)
   }, [nestedSelectedOptions])
   // default selected modifiers
   useEffect(() => {
      if (!data) {
         return
      }
      if (!(forNewItem || edit)) {
         let singleModifier = []
         let multipleModifier = []
         data.modifiers[0].categories.forEach(eachCategory => {
            if (eachCategory.type === 'single' && eachCategory.isRequired) {
               // default selected modifier option
               const defaultModifierSelectedOption = {
                  modifierCategoryID: eachCategory.id,
                  modifierCategoryOptionsID: eachCategory.options[0].id,
                  modifierCategoryOptionsPrice: eachCategory.options[0].price,
                  modifierCategoryOptionsDiscount:
                     eachCategory.options[0].discount,
                  cartItem: eachCategory.options[0].cartItem,
               }
               singleModifier = [
                  ...singleModifier,
                  defaultModifierSelectedOption,
               ]
            } else if (
               eachCategory.type === 'multiple' &&
               eachCategory.isRequired
            ) {
               const defaultSelectedOptions = eachCategory.options.slice(
                  0,
                  eachCategory.limits.min
               )
               defaultSelectedOptions.forEach(eachModifierOption => {
                  // default selected modifier option
                  const defaultModifierSelectedOption = {
                     modifierCategoryID: eachCategory.id,
                     modifierCategoryOptionsID: eachModifierOption.id,
                     modifierCategoryOptionsPrice: eachModifierOption.price,
                     modifierCategoryOptionsDiscount:
                        eachModifierOption.discount,
                     cartItem: eachModifierOption.cartItem,
                  }
                  multipleModifier = [
                     ...multipleModifier,
                     defaultModifierSelectedOption,
                  ]
               })
            }
         })
         setNestedSelectedOptions(prevState => ({
            ...prevState,
            single: singleModifier,
            multiple: multipleModifier,
         }))
      }
   }, [data])

   useImperativeHandle(ref, () => ({
      modifierValidation() {
         const allSelectedOptions = [
            ...nestedSelectedOptions.single,
            ...nestedSelectedOptions.multiple,
         ]
         let allCatagories = data.modifiers[0].categories || []

         let errorState = []
         for (let i = 0; i < allCatagories.length; i++) {
            const allFoundedOptionsLength = allSelectedOptions.filter(
               x => x.modifierCategoryID === allCatagories[i].id
            ).length

            if (
               allCatagories[i]['isRequired'] &&
               allCatagories[i]['type'] === 'multiple'
            ) {
               const min = allCatagories[i]['limits']['min']
               const max = allCatagories[i]['limits']['max']
               if (
                  allFoundedOptionsLength > 0 &&
                  min <= allFoundedOptionsLength &&
                  (max
                     ? allFoundedOptionsLength <= max
                     : allFoundedOptionsLength <=
                       allCatagories[i].options.length)
               ) {
               } else {
                  errorState.push(allCatagories[i].id)
                  // setErrorCategories([...errorCategories, allCatagories[i].id])
               }
            }
         }
         setErrorCategories(errorState)
         if (errorState.length > 0) {
            return { status: false }
         } else {
            return {
               status: true,
               data: allSelectedOptions,
               parentModifierOptionId: modifierOptionId,
            }
         }
      },
      nestedSelectedModifiers() {
         return nestedSelectedOptions
      },
   }))

   // on check click
   const onCheckClick = (eachOption, eachModifierCategory) => {
      //selected option
      const selectedOption = {
         modifierCategoryID: eachModifierCategory.id,
         modifierCategoryOptionsID: eachOption.id,
         modifierCategoryOptionsPrice: eachOption.price,
         modifierCategoryOptionsDiscount: eachOption.discount,
         cartItem: eachOption.cartItem,
      }
      //modifierCategoryOptionID
      //modifierCategoryID
      if (eachModifierCategory.type === 'single') {
         const existCategoryIndex = nestedSelectedOptions.single.findIndex(
            x => x.modifierCategoryID == eachModifierCategory.id
         )
         //single-->already exist category
         if (existCategoryIndex !== -1) {
            //for uncheck the option
            if (
               nestedSelectedOptions.single[existCategoryIndex][
                  'modifierCategoryOptionsID'
               ] === eachOption.id &&
               !eachModifierCategory.isRequired
            ) {
               const newSelectedOptions = nestedSelectedOptions.single.filter(
                  x =>
                     x.modifierCategoryID !== eachModifierCategory.id &&
                     x.modifierCategoryOptionsID !== eachOption.id
               )
               setNestedSelectedOptions({
                  ...nestedSelectedOptions,
                  single: newSelectedOptions,
               })
               return
            }
            const newSelectedOptions = nestedSelectedOptions.single
            newSelectedOptions[existCategoryIndex] = selectedOption
            setNestedSelectedOptions({
               ...nestedSelectedOptions,
               single: newSelectedOptions,
            })
            return
         } else {
            //single--> already not exist
            setNestedSelectedOptions({
               ...nestedSelectedOptions,
               single: [...nestedSelectedOptions.single, selectedOption],
            })
            return
         }
      }
      if (eachModifierCategory.type === 'multiple') {
         const existOptionIndex = nestedSelectedOptions.multiple.findIndex(
            x => x.modifierCategoryOptionsID == eachOption.id
         )

         //already exist option
         if (existOptionIndex !== -1) {
            const newSelectedOptions = nestedSelectedOptions.multiple.filter(
               x => x.modifierCategoryOptionsID !== eachOption.id
            )
            setNestedSelectedOptions({
               ...nestedSelectedOptions,
               multiple: newSelectedOptions,
            })
            return
         }
         //new option select
         else {
            setNestedSelectedOptions({
               ...nestedSelectedOptions,
               multiple: [...nestedSelectedOptions.multiple, selectedOption],
            })
         }
      }
   }

   // selection when modifier is in newItem or edit mode
   useEffect(() => {
      if (!data) {
         return
      }
      if (forNewItem || edit) {
         const modifierCategoryOptionsIds = productCartDetail.childs[0].childs
            .reduce((acc, obj) => [...acc, ...obj.childs], [])
            .map(x => x?.modifierOption?.id)

         //selected modifiers
         let singleModifier = []
         let multipleModifier = []
         if (data.modifiers[0]) {
            data.modifiers[0].categories.forEach(category => {
               category.options.forEach(option => {
                  const selectedOption = {
                     modifierCategoryID: category.id,
                     modifierCategoryOptionsID: option.id,
                     modifierCategoryOptionsPrice: option.price,
                     cartItem: option.cartItem,
                  }
                  if (category.type === 'single') {
                     if (modifierCategoryOptionsIds.includes(option.id)) {
                        singleModifier = singleModifier.concat(selectedOption)
                     }
                  }
                  if (category.type === 'multiple') {
                     if (modifierCategoryOptionsIds.includes(option.id)) {
                        multipleModifier =
                           multipleModifier.concat(selectedOption)
                     }
                  }
               })
            })
         }

         setNestedSelectedOptions(prevState => ({
            ...prevState,
            single: singleModifier,
            multiple: multipleModifier,
         }))
      }
   }, [data])

   useEffect(() => {
      if (!templateLoading) {
         const languageTags = document.querySelectorAll(
            '[data-translation="true"]'
         )
         dynamicTrans(languageTags)
      }
   }, [templateLoading])

   if (templateLoading) {
      return <Loader inline />
   }

   if (data.modifiers[0].categories.length === 0) {
      return null
   }
   return (
      <>
         {data.modifiers[0].categories.map((eachModifierCategory, index) => {
            return (
               <div
                  className="hern-kiosk__modifier-popup-modifier-category"
                  style={{
                     backgroundColor: `${config.kioskSettings.theme.primaryColorDark.value}`,
                  }}
               >
                  <label className="hern-kiosk__modifier-category-label">
                     <Badge
                        count={index + 1}
                        style={{
                           backgroundColor: '#ffffff',
                           color: `${config.kioskSettings.theme.primaryColor.value}`,
                           fontWeight: '600',
                        }}
                     />
                     <span
                        className="hern-kiosk__modifier-category-label-text"
                        style={{
                           color: `${config.kioskSettings.theme.modifierTextColor.value}`,
                        }}
                        data-translation="true"
                        data-original-value={eachModifierCategory.name}
                     >
                        {eachModifierCategory.name}
                     </span>
                     <span className="hern-kiosk__modifier-category-selection-condition">
                        {'('}
                        {renderConditionText(eachModifierCategory)}
                        {')'}
                     </span>
                  </label>
                  {errorCategories.includes(eachModifierCategory.id) && (
                     <>
                        <span
                           style={{
                              fontStyle: 'italic',
                              fontSize: '1.7em',
                              color: `${config.kioskSettings.theme.categorySelectionWarningColor.value}`,
                              margin: '0 .5em',
                           }}
                        >
                           {'('}
                           {t(`You have to choose this category`)}
                           {')'}
                        </span>
                     </>
                  )}
                  <div className="hern-kiosk__modifier-category-options">
                     {eachModifierCategory.options.map((eachOption, index) => {
                        const isModifierOptionInProduct = () => {
                           const isOptionSelected = nestedSelectedOptions[
                              eachModifierCategory.type
                           ].find(
                              x =>
                                 x.modifierCategoryID ===
                                    eachModifierCategory.id &&
                                 x.modifierCategoryOptionsID === eachOption.id
                           )
                           return Boolean(isOptionSelected)
                        }
                        return (
                           <>
                              <div
                                 key={eachOption.id}
                                 className="hern-kiosk__modifier-category-option"
                                 onClick={() => {
                                    onCheckClick(
                                       eachOption,
                                       eachModifierCategory
                                    )
                                 }}
                              >
                                 <div className="hern-kiosk__modifier-category-right">
                                    <img
                                       className="hern-kiosk__modifier-category-option-image"
                                       alt="modifier image"
                                       src={
                                          eachOption.image ||
                                          config.productSettings.defaultImage
                                             .value
                                       }
                                    />

                                    <span className="hern-kiosk__modifier--option-name">
                                       <span
                                          data-translation="true"
                                          data-original-value={eachOption.name}
                                       >
                                          {eachOption.name}
                                       </span>
                                       {eachOption.price > 0 && (
                                          <>
                                             {' ('}
                                             {formatCurrency(
                                                eachOption.price -
                                                   eachOption.discount
                                             )}
                                             {')'}
                                          </>
                                       )}
                                    </span>
                                 </div>
                                 {isModifierOptionInProduct() ? (
                                    <RoundCheckBoxIcon
                                       fill={
                                          config.kioskSettings.tickBox
                                             .tickBoxBGonCheck.value
                                       }
                                       tickFill={
                                          config.kioskSettings.tickBox.tickColor
                                             .value
                                       }
                                       size={50}
                                    />
                                 ) : (
                                    <NoTickRoundCheckBoxIcon
                                       fill={
                                          config.kioskSettings.theme
                                             .primaryColor.value
                                       }
                                       size={50}
                                    />
                                 )}
                              </div>
                              {/* {eachOption.additionalModifierTemplateId && (
                           <ModifierOptionsList
                              eachModifierCategory={
                                 selectedProductOption.additionalModifiers[0]
                                    .modifier.categories
                              }
                              selectedOptions={selectedOptions}
                              config={config}
                              onCheckClick={onCheckClick}
                           />
                        )} */}
                           </>
                        )
                     })}
                  </div>
               </div>
            )
         })}
      </>
   )
})
