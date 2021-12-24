import React, { useState, useEffect } from 'react'
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
import { formatCurrency, useOnClickOutside } from '../../../utils'

const addModifier = [
   {
      label: 'Customize',
      type: 'hidden',
      modifier: {
         id: 1073,
         name: 'Herfy Original Tortilla-Regular',
         categories: [
            {
               id: 1042,
               name: 'Sandwich',
               isRequired: true,
               type: 'single',
               limits: {
                  max: null,
                  min: 1,
               },
               options: [
                  {
                     id: 1070,
                     name: 'Chicken Tortilla',
                     price: 0,
                     discount: 0,
                     quantity: 1,
                     image: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/30665-Chicken%20TORTILLA.png',
                     isActive: true,
                     sachetItemId: null,
                     ingredientSachetId: null,
                     cartItem: {
                        data: [
                           {
                              discount: 0,
                              unitPrice: 0,
                              modifierOptionId: 1070,
                           },
                        ],
                     },
                     __typename: 'onDemand_modifierCategoryOption',
                  },
               ],
               __typename: 'onDemand_modifierCategory',
            },
            {
               id: 1043,
               name: 'Sides',
               isRequired: true,
               type: 'single',
               limits: {
                  max: null,
                  min: 1,
               },
               options: [
                  {
                     id: 1071,
                     name: 'Regular Fries',
                     price: 0,
                     discount: 0,
                     quantity: 1,
                     image: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/97788-sideFriesReg.png',
                     isActive: true,
                     sachetItemId: null,
                     ingredientSachetId: null,
                     cartItem: {
                        data: [
                           {
                              discount: 0,
                              unitPrice: 0,
                              modifierOptionId: 1071,
                           },
                        ],
                     },
                     __typename: 'onDemand_modifierCategoryOption',
                  },
                  {
                     id: 1072,
                     name: 'Onion Rings Regular',
                     price: 0,
                     discount: 0,
                     quantity: 1,
                     image: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/12587-ONION-RINGS-1.png',
                     isActive: true,
                     sachetItemId: null,
                     ingredientSachetId: null,
                     cartItem: {
                        data: [
                           {
                              discount: 0,
                              unitPrice: 0,
                              modifierOptionId: 1072,
                           },
                        ],
                     },
                     __typename: 'onDemand_modifierCategoryOption',
                  },
               ],
               __typename: 'onDemand_modifierCategory',
            },
            {
               id: 1044,
               name: 'Drinks',
               isRequired: true,
               type: 'single',
               limits: {
                  max: null,
                  min: 1,
               },
               options: [
                  {
                     id: 1073,
                     name: 'Pepsi regular',
                     price: 0,
                     discount: 0,
                     quantity: 1,
                     image: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/60364-Pepsi.png',
                     isActive: true,
                     sachetItemId: null,
                     ingredientSachetId: null,
                     cartItem: {
                        data: [
                           {
                              discount: 0,
                              unitPrice: 0,
                              modifierOptionId: 1073,
                           },
                        ],
                     },
                     __typename: 'onDemand_modifierCategoryOption',
                  },
                  {
                     id: 1074,
                     name: 'Diet Pepsi Regular',
                     price: 0,
                     discount: 0,
                     quantity: 1,
                     image: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/84875-Diet%20Pepsi.png',
                     isActive: true,
                     sachetItemId: null,
                     ingredientSachetId: null,
                     cartItem: {
                        data: [
                           {
                              discount: 0,
                              unitPrice: 0,
                              modifierOptionId: 1074,
                           },
                        ],
                     },
                     __typename: 'onDemand_modifierCategoryOption',
                  },
                  {
                     id: 1075,
                     name: 'Mirinda Regular',
                     price: 0,
                     discount: 0,
                     quantity: 1,
                     image: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/13743-Mirinda.png',
                     isActive: true,
                     sachetItemId: null,
                     ingredientSachetId: null,
                     cartItem: {
                        data: [
                           {
                              discount: 0,
                              unitPrice: 0,
                              modifierOptionId: 1075,
                           },
                        ],
                     },
                     __typename: 'onDemand_modifierCategoryOption',
                  },
                  {
                     id: 1076,
                     name: 'Mt. Dew Regular',
                     price: 0,
                     discount: 0,
                     quantity: 1,
                     image: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/39316-Mt.%20Dew.png',
                     isActive: true,
                     sachetItemId: null,
                     ingredientSachetId: null,
                     cartItem: {
                        data: [
                           {
                              discount: 0,
                              unitPrice: 0,
                              modifierOptionId: 1076,
                           },
                        ],
                     },
                     __typename: 'onDemand_modifierCategoryOption',
                  },
                  {
                     id: 1077,
                     name: '7up Regular',
                     price: 0,
                     discount: 0,
                     quantity: 1,
                     image: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/65607-7up.png',
                     isActive: true,
                     sachetItemId: null,
                     ingredientSachetId: null,
                     cartItem: {
                        data: [
                           {
                              discount: 0,
                              unitPrice: 0,
                              modifierOptionId: 1077,
                           },
                        ],
                     },
                     __typename: 'onDemand_modifierCategoryOption',
                  },
                  {
                     id: 1078,
                     name: 'Water 500ml',
                     price: 0,
                     discount: 0,
                     quantity: 1,
                     image: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/87435-Water-HR.png',
                     isActive: true,
                     sachetItemId: null,
                     ingredientSachetId: null,
                     cartItem: {
                        data: [
                           {
                              discount: 0,
                              unitPrice: 0,
                              modifierOptionId: 1078,
                           },
                        ],
                     },
                     __typename: 'onDemand_modifierCategoryOption',
                  },
                  {
                     id: 1079,
                     name: '7up can',
                     price: 1,
                     discount: 0,
                     quantity: 1,
                     image: null,
                     isActive: true,
                     sachetItemId: null,
                     ingredientSachetId: null,
                     cartItem: {
                        data: [
                           {
                              discount: 0,
                              unitPrice: 1,
                              modifierOptionId: 1079,
                           },
                        ],
                     },
                     __typename: 'onDemand_modifierCategoryOption',
                  },
                  {
                     id: 1080,
                     name: 'Pepsi can',
                     price: 1,
                     discount: 0,
                     quantity: 1,
                     image: null,
                     isActive: true,
                     sachetItemId: null,
                     ingredientSachetId: null,
                     cartItem: {
                        data: [
                           {
                              discount: 0,
                              unitPrice: 1,
                              modifierOptionId: 1080,
                           },
                        ],
                     },
                     __typename: 'onDemand_modifierCategoryOption',
                  },
                  {
                     id: 1081,
                     name: 'Diet Pepsi can',
                     price: 1,
                     discount: 0,
                     quantity: 1,
                     image: null,
                     isActive: true,
                     sachetItemId: null,
                     ingredientSachetId: null,
                     cartItem: {
                        data: [
                           {
                              discount: 0,
                              unitPrice: 1,
                              modifierOptionId: 1081,
                           },
                        ],
                     },
                     __typename: 'onDemand_modifierCategoryOption',
                  },
                  {
                     id: 1082,
                     name: 'Mirinda can',
                     price: 1,
                     discount: 0,
                     quantity: 1,
                     image: null,
                     isActive: true,
                     sachetItemId: null,
                     ingredientSachetId: null,
                     cartItem: {
                        data: [
                           {
                              discount: 0,
                              unitPrice: 1,
                              modifierOptionId: 1082,
                           },
                        ],
                     },
                     __typename: 'onDemand_modifierCategoryOption',
                  },
               ],
               __typename: 'onDemand_modifierCategory',
            },
         ],
         __typename: 'onDemand_modifier',
      },
   },
]

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
   const { t, dynamicTrans, locale } = useTranslation()
   //context
   const { addToCart, methods } = React.useContext(CartContext)

   // component state
   const [selectedProductOption, setSelectedProductOption] = useState(
      productData.productOptions[0]
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
               ] === eachOption.id
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
         setShowProceedPopup(true)
         return
      }

      let allCatagories = selectedProductOption.modifier?.categories || []

      let errorState = []
      for (let i = 0; i < allCatagories.length; i++) {
         const min = allCatagories[i]['limits']['min']
         const max = allCatagories[i]['limits']['max']
         const allFoundedOptionsLength = allSelectedOptions.filter(
            x => x.modifierCategoryID === allCatagories[i].id
         ).length

         if (allCatagories[i]['isRequired']) {
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
         setShowProceedPopup(true)
         return
      }
   }

   //render conditional text
   const renderConditionText = category => {
      if (category.type === 'single') {
         return 'CHOOSE ONE*'
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
                  return `(CHOOSE AT LEAST 1)*`
               }
            }
         } else {
            if (category.limits.max) {
               return `(CHOOSE AS MANY AS YOU LIKE UPTO ${category.limits.max})`
            } else {
               return '(CHOOSE AS MANY AS YOU LIKE)'
            }
         }
      }
   }

   // total amount
   //total amount for this item
   const totalAmount = () => {
      const productOptionPrice = selectedProductOption.price
      const productOptionDiscount = selectedProductOption.discount
      const allSelectedOptions = [
         ...selectedOptions.single,
         ...selectedOptions.multiple,
      ]
      let allSelectedOptionsPrice = 0
      allSelectedOptions.forEach(
         x =>
            (allSelectedOptionsPrice =
               allSelectedOptionsPrice +
               (x?.modifierCategoryOptionsPrice || 0) -
               (x?.modifierCategoryOptionsDiscount || 0))
      )
      console.log(
         'totalPrice',
         productOptionPrice,
         allSelectedOptionsPrice,
         productData.price,
         productData.discount,
         productOptionDiscount
      )
      const totalPrice =
         productOptionPrice +
         allSelectedOptionsPrice +
         productData.price -
         productData.discount -
         productOptionDiscount
      return totalPrice * quantity
   }

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
      } else {
         setStatus('success')
      }
      return () => {
         setSelectedProductOption(null)
      }
   }, [])

   useEffect(() => {
      const translateStringSpan = document.querySelectorAll('span')
      const translateStringDiv = document.querySelectorAll('div')
      const translateStringP = document.querySelectorAll('p')
      const translateStringLi = document.querySelectorAll('li')
      dynamicTrans(translateStringSpan, currentLang)
      dynamicTrans(translateStringDiv, currentLang)
      dynamicTrans(translateStringP, currentLang)
      dynamicTrans(translateStringLi, currentLang)
   }, [currentLang])
   console.log('product_data -->', productData)
   if (showProceedPopup) {
      return (
         <Modal
            visible={showProceedPopup}
            centered={true}
            closable={false}
            footer={null}
            maskClosable={false}
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
            <div
               className="hern-kiosk__modifier-popup-product-options"
               style={{
                  backgroundColor: `${config.kioskSettings.theme.primaryColor.value}`,
               }}
            >
               <Radio.Group
                  defaultValue={productData.productOptions[0].id}
                  buttonStyle="solid"
                  onChange={e => {
                     const productOption = productData.productOptions.find(
                        x => x.id == e.target.value
                     )
                     // when changing product option previous selected should be removed
                     setSelectedOptions({ single: [], multiple: [] })
                     setSelectedProductOption(productOption)
                  }}
                  size="large"
                  style={{ margin: '.5em 0' }}
               >
                  {productData.productOptions.map((eachOption, index) => (
                     <Radio.Button
                        value={eachOption.id}
                        key={index}
                        className="hern-kiosk__modifier-product-option"
                        style={{
                           ...(selectedProductOption.id === eachOption.id && {
                              backgroundColor: 'transparent',
                              border: `2px solid ${config.kioskSettings.theme.successColor.value}`,
                           }),
                        }}
                     >
                        {eachOption.label}
                        {' (+ '}
                        {formatCurrency(eachOption.price - eachOption.discount)}
                        {')'}
                     </Radio.Button>
                  ))}
               </Radio.Group>
            </div>
            <div className="hern-kiosk__product-modifier-p-additional-text">
               <span
                  style={{
                     color: `${config.kioskSettings.theme.modifierTextColor.value}`,
                  }}
               >
                  {productData.additionalText}
               </span>
            </div>
            {/* <div className="hern-kiosk__modifier-popup-modifiers-list"> */}
            {selectedProductOption.additionalModifiers.length > 0 &&
               selectedProductOption.additionalModifiers.map(
                  (eachAdditionalModifier, addIndex) => {
                     const additionalModifiersType = React.useMemo(
                        () => eachAdditionalModifier.type == 'hidden',
                        [eachAdditionalModifier]
                     )
                     const [showCustomize, setShowCustomize] = useState(
                        !Boolean(additionalModifiersType)
                     )
                     return (
                        <div
                           className="hern-kiosk__additional-modifier"
                           style={{
                              backgroundColor: `${config.kioskSettings.theme.primaryColorDark.value}`,
                           }}
                           index={addIndex}
                        >
                           <div
                              className="hern-kiosk__additional-modifier-header"
                              onClick={() => setShowCustomize(prev => !prev)}
                           >
                              <span
                                 className="hern-kiosk__additional-modifier-label"
                                 style={{ color: '#ffffff' }}
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
                                             >
                                                {eachModifierCategory.name}
                                             </span>
                                             <span className="hern-kiosk__modifier-category-selection-condition">
                                                {'('}
                                                {renderConditionText(
                                                   eachModifierCategory
                                                )}
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
                                                   const isModifierOptionInProduct =
                                                      () => {
                                                         const isOptionSelected =
                                                            selectedOptions[
                                                               eachModifierCategory
                                                                  .type
                                                            ].find(
                                                               x =>
                                                                  x.modifierCategoryID ===
                                                                     eachModifierCategory.id &&
                                                                  x.modifierCategoryOptionsID ===
                                                                     eachOption.id
                                                            )
                                                         return Boolean(
                                                            isOptionSelected
                                                         )
                                                      }
                                                   return (
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
                                                                  config
                                                                     .productSettings
                                                                     .defaultImage
                                                                     .value
                                                               }
                                                            />

                                                            <span className="hern-kiosk__modifier--option-name">
                                                               {eachOption.name}
                                                               {eachOption.price >
                                                                  0 && (
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
                                                                  config
                                                                     .kioskSettings
                                                                     .tickBox
                                                                     .tickBoxBGonCheck
                                                                     .value
                                                               }
                                                               tickFill={
                                                                  config
                                                                     .kioskSettings
                                                                     .tickBox
                                                                     .tickColor
                                                                     .value
                                                               }
                                                               size={50}
                                                            />
                                                         ) : (
                                                            <NoTickRoundCheckBoxIcon
                                                               fill={
                                                                  config
                                                                     .kioskSettings
                                                                     .theme
                                                                     .primaryColor
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
                                                      </div>
                                                   )
                                                }
                                             )}
                                          </div>
                                       </div>
                                    )
                                 }
                              )}
                        </div>
                     )
                  }
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
                                       {t(`You have to choose this category`)}
                                       {')'}
                                    </span>
                                 </>
                              )}
                           </label>
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
                                                {eachOption.name}
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
                                                   config.kioskSettings.tickBox
                                                      .tickColor.value
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
                                          {/* <CheckBoxIcon
                                                showTick={isModifierOptionInProduct()}
                                                size={30}
                                                stroke={
                                                   config.kioskSettings.theme
                                                      .primaryColor.value
                                                }
                                                onClick={() => {
                                                   onCheckClick(
                                                      eachOption,
                                                      eachModifierCategory
                                                   )
                                                }}
                                             /> */}
                                       </div>
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
const getCartItemWithModifiers = (cartItemInput, selectedModifiersInput) => {
   const finalCartItem = { ...cartItemInput }

   const combinedModifiers = selectedModifiersInput.reduce(
      (acc, obj) => [...acc, ...obj.data],
      []
   )
   const dataArr = finalCartItem?.childs?.data[0]?.childs?.data
   const dataArrLength = dataArr.length

   finalCartItem.childs.data[0].childs.data = combinedModifiers

   return finalCartItem
}
