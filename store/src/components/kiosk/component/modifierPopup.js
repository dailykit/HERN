import React, { useState } from 'react'
import { Badge, Carousel, Radio } from 'antd'
import { KioskCounterButton } from '.'
import { CartContext, useTranslation } from '../../../context'
import {
   CheckBoxIcon,
   CloseIcon,
   NoTickRoundCheckBoxIcon,
   RoundCheckBoxIcon,
} from '../../../assets/icons'
import KioskButton from './button'
import { formatCurrency } from '../../../utils'

export const KioskModifier = props => {
   const { config, setShowModifier, productData, edit = false } = props
   const { t } = useTranslation()
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
         setShowModifier(false)
         return
      }

      let allCatagories = selectedProductOption.modifier?.categories || []

      let errorState = []
      for (let i = 0; i < allCatagories.length; i++) {
         console.log('Helloworld', allCatagories[i])
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
         setShowModifier(false)
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
               return '(CHOOSE AS MANY AS YOU LIKE)'
            } else {
               return `(CHOOSE AS MANY AS YOU LIKE UPTO ${category.limits.max})`
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
   return (
      <div className="hern-kiosk__menu-product-modifier-popup">
         <div className="hern-kiosk__menu-product-modifier-popup--bg"></div>

         <div
            className="hern-kiosk__menu-product-modifier-pop-up-container"
            style={{ background: '#0F6BB1' }}
         >
            <div
               onClick={() => {
                  setShowModifier(false)
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
               <CloseIcon size={30} stroke={'#fffffF'} />
            </div>
            <div className="hern-kiosk__menu-product-modifier-header">
               <span
                  className="hern-kiosk__menu-product-modifier-customize-text"
                  style={{
                     color: `${config.kioskSettings.theme.modifierTextColor.value}`,
                  }}
               >
                  {t('Customize')}
               </span>
               {productData.assets.images.length === 0 ? (
                  <img src={config.productSettings.defaultImage.value} />
               ) : (
                  <Carousel style={{ height: '20em', width: '20em' }}>
                     {productData.assets.images.map((eachImage, index) => (
                        <img
                           src={eachImage}
                           key={index}
                           style={{ height: '100%', width: '100%' }}
                        />
                     ))}
                  </Carousel>
               )}
               <KioskCounterButton
                  config={config}
                  quantity={quantity}
                  onPlusClick={onPlusClick}
                  onMinusClick={onMinusClick}
                  style={{ margin: '2em 0 0 0' }}
               />
            </div>
            <div className="hern-kiosk__menu-product-modifier-brief">
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
                  {formatCurrency(productData.price - productData.discount)}
               </span>
            </div>
            <div className="hern-kiosk__modifier-popup-product-options">
               <Radio.Group
                  defaultValue={productData.productOptions[0].id}
                  buttonStyle="solid"
                  onChange={e => {
                     const productOption = productData.productOptions.find(
                        x => x.id == e.target.value
                     )
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
                              border: `2px solid ${config.kioskSettings.theme.primaryColorDark.value}`,
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
            <div className="hern-kiosk__modifier-popup-modifiers-list">
               {selectedProductOption.modifier &&
                  selectedProductOption.modifier.categories.map(
                     (eachModifierCategory, index) => {
                        return (
                           <div className="hern-kiosk__modifier-popup-modifier-category">
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
                                          {'('}You have to choose this category.
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
                                             selectedOptions[
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
                                                   {' ('}
                                                   {formatCurrency(
                                                      eachOption.price -
                                                         eachOption.discount
                                                   )}
                                                   {')'}
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
                                                   onClick={() => {
                                                      onCheckClick(
                                                         eachOption,
                                                         eachModifierCategory
                                                      )
                                                   }}
                                                />
                                             ) : (
                                                <NoTickRoundCheckBoxIcon
                                                   fill={
                                                      config.kioskSettings.theme
                                                         .primaryColorDark.value
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
            </div>
            <div className="hern-kiosk__modifier-popup-footer">
               <div>
                  <span
                     className="hern-kiosk__modifier-total-label"
                     style={{
                        color: `${config.kioskSettings.theme.secondaryColor.value}`,
                     }}
                  >
                     Total
                  </span>
                  <span className="hern-kiosk__modifier-total-price">
                     {formatCurrency(totalAmount())}
                  </span>
               </div>
               <KioskButton
                  onClick={handleAddOnCart}
                  customClass="hern-kiosk__modifier-add-to-cart"
               >
                  Add to cart
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
