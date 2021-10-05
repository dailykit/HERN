import { each } from 'lodash'
import React, { useState } from 'react'
import { Button, ProductCard } from '.'
import { RadioIcon, ShowImageIcon } from '../assets/icons'
import { formatCurrency } from '../utils'
import { CloseIcon, CheckBoxIcon } from '../assets/icons'
import { useOnClickOutside } from '../utils/useOnClickOutisde'
import { CartContext } from '../context'
import { CounterButton } from './counterBtn'

export const ModifierPopup = props => {
   const { productData, showModifiers = true, closeModifier, height } = props
   const [productOption, setProductOption] = useState(
      productData.productOptions[0]
   ) // for by default choose one product option
   const [quantity, setQuantity] = useState(1)
   const [selectedOptions, setSelectedOptions] = useState({
      single: [],
      multiple: [],
   })
   const { addToCart } = React.useContext(CartContext)
   const [errorCategories, setErrorCategories] = useState([])
   const imagePopUpRef = React.useRef()
   const [modifierImage, setModifierImage] = useState({
      showImage: false,
      src: null,
   })
   useOnClickOutside(imagePopUpRef, () =>
      setModifierImage({
         showImage: false,
         src: null,
      })
   )

   const onCheckClick = (eachOption, eachCategory) => {
      //selected option
      const selectedOption = {
         modifierCategoryID: eachCategory.id,
         modifierCategoryOptionsID: eachOption.id,
         modifierCategoryOptionsPrice: eachOption.price,
         cartItem: eachOption.cartItem,
      }
      //modifierCategoryOptionID
      //modifierCategoryID
      if (eachCategory.type === 'single') {
         const existCategoryIndex = selectedOptions.single.findIndex(
            x => x.modifierCategoryID == eachCategory.id
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
                     x.modifierCategoryID !== eachCategory.id &&
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
      if (eachCategory.type === 'multiple') {
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

   //add to cart
   const handleAddOnCartOn = () => {
      //check category fulfillment conditions
      const allSelectedOptions = [
         ...selectedOptions.single,
         ...selectedOptions.multiple,
      ]

      //no modifier available in product options
      if (!productOption.modifier) {
         console.log('PASS')
         // addToCart({ ...productOption, quantity })
         const cartItem = getCartItemWithModifiers(
            productOption.cartItem,
            allSelectedOptions.map(x => x.cartItem)
         )
         // const objects = new Array(quantity).fill({ ...cartItem })
         // console.log('cartItem', objects)
         addToCart(cartItem, quantity)
         return
      }

      let allCatagories = productOption.modifier?.categories || []

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
               console.log('hello')
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
            productOption.cartItem,
            allSelectedOptions.map(x => x.cartItem)
         )
         // const objects = new Array(quantity).fill({ ...cartItem })
         // console.log('cartItem', objects)
         addToCart(cartItem, quantity)
      }
   }

   //total amount for this item
   const totalAmount = () => {
      const productOptionPrice = productOption.price
      const allSelectedOptions = [
         ...selectedOptions.single,
         ...selectedOptions.multiple,
      ]
      let allSelectedOptionsPrice = 0
      allSelectedOptions.forEach(
         x => (allSelectedOptionsPrice += x?.modifierCategoryOptionsPrice || 0)
      )
      const totalPrice =
         productOptionPrice + allSelectedOptionsPrice + productData.price
      return formatCurrency(totalPrice * quantity)
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
            <CounterButton
               count={quantity}
               incrementClick={incrementClick}
               decrementClick={decrementClick}
            />
         </div>
      )
   }
   return (
      <>
         <div
            className="hern-product-modifier-pop-up-container"
            style={{ height: height }}
         >
            <div className="hern-product-modifier-pop-up-product">
               <div className="hern-product-modifier-pop-up-product-details">
                  <ProductCard
                     data={productData}
                     showImage={false}
                     showCustomText={false}
                     customAreaComponent={CustomArea}
                  />
               </div>
               <div className="hern-product-modifier-pop-up-product-option-list">
                  <label htmlFor="products">Available Options:</label>
                  <br />
                  <select
                     className="hern-product-modifier-pop-up-product-options"
                     name="product-options"
                     onChange={e => {
                        const selectedProductOption =
                           productData.productOptions.find(
                              x => x.id == e.target.value
                           )
                        setProductOption(selectedProductOption)
                     }}
                  >
                     {productData.productOptions.map(eachOption => {
                        return (
                           <option value={eachOption.id} key={eachOption.id}>
                              {eachOption.label}
                              {' (+ '}
                              {formatCurrency(eachOption.price)}
                              {')'}
                           </option>
                        )
                     })}
                  </select>
               </div>
               {showModifiers && productOption.modifier && (
                  <div className="hern-product-modifier-pop-up-modifier-list">
                     <label
                        htmlFor="products"
                        className="hern-product-modifier-pop-up-add-on"
                     >
                        Add on:
                     </label>
                     {productOption.modifier.categories.map(eachCategory => {
                        return (
                           <div
                              className="hern-product-modifier-pop-up-modifier-category-list"
                              key={eachCategory.id}
                           >
                              <span className="hern-product-modifier-pop-up-modifier-category__name">
                                 {eachCategory.name}
                              </span>
                              <br />
                              <span
                                 style={{
                                    fontStyle: 'italic',
                                    fontSize: '11px',
                                 }}
                              >
                                 {renderConditionText(eachCategory)}
                              </span>

                              {errorCategories.includes(eachCategory.id) && (
                                 <>
                                    <br />
                                    <span
                                       style={{
                                          fontStyle: 'italic',
                                          fontSize: '11px',
                                          color: 'red',
                                       }}
                                    >
                                       You have to choose this category.
                                    </span>
                                 </>
                              )}
                              <br />
                              <div className="hern-product-modifier-pop-up-modifier-category__options">
                                 {eachCategory.options.map(eachOption => {
                                    const foo = () => {
                                       const foo1 = () => {
                                          const isOptionSelected =
                                             selectedOptions[
                                                eachCategory.type
                                             ].find(
                                                x =>
                                                   x.modifierCategoryID ===
                                                      eachCategory.id &&
                                                   x.modifierCategoryOptionsID ===
                                                      eachOption.id
                                             )
                                          return eachCategory.type ===
                                             'single' ? (
                                             Boolean(isOptionSelected) ? (
                                                <RadioIcon showTick={true} />
                                             ) : (
                                                <RadioIcon />
                                             )
                                          ) : Boolean(isOptionSelected) ? (
                                             <CheckBoxIcon showTick={true} />
                                          ) : (
                                             <CheckBoxIcon />
                                          )
                                       }
                                       return foo1
                                    }
                                    return (
                                       <div
                                          className="hern-product-modifier-pop-up-add-on-list"
                                          key={eachOption.id}
                                       >
                                          <ProductCard
                                             data={eachOption}
                                             showImage={false}
                                             showCustomText={false}
                                             showImageIcon={
                                                eachOption.image
                                                   ? ShowImageIcon
                                                   : false
                                             }
                                             onShowImageIconClick={() => {
                                                setModifierImage({
                                                   ...modifierImage,
                                                   src: eachOption.image,
                                                   showImage: true,
                                                })
                                             }}
                                             additionalIcon={foo()}
                                             onAdditionalIconClick={() => {
                                                onCheckClick(
                                                   eachOption,
                                                   eachCategory
                                                )
                                             }}
                                          />
                                       </div>
                                    )
                                 })}
                              </div>
                           </div>
                        )
                     })}
                  </div>
               )}
            </div>
            <div
               className="hern-product-modifier-pop-up-close-icon"
               onClick={closeModifier}
            >
               <CloseIcon size={20} stroke="currentColor" />
            </div>
            <Button
               className="hern-product-modifier-pop-up-add-to-cart-btn"
               onClick={handleAddOnCartOn}
            >
               ADD TO CART {totalAmount()}
            </Button>
            {modifierImage.showImage && (
               <div className="hern-product-modifier-image-pop-up">
                  <div
                     className="hern-product-modifier-image-pop-up-content"
                     ref={imagePopUpRef}
                  >
                     <img src={modifierImage.src} />
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
const getCartItemWithModifiers = (cartItemInput, selectedModifiersInput) => {
   const finalCartItem = { ...cartItemInput }

   const combinedModifiers = selectedModifiersInput.reduce(
      (acc, obj) => [...acc, ...obj.data],
      []
   )

   const dataArr = finalCartItem?.childs?.data[0]?.childs?.data
   const dataArrLength = dataArr.length

   if (dataArrLength === 0) {
      finalCartItem.childs.data[0].childs.data = combinedModifiers
      return finalCartItem
   } else {
      for (let i = 0; i < dataArrLength; i++) {
         const objWithModifiers = {
            ...dataArr[i],
            childs: {
               data: combinedModifiers,
            },
         }
         finalCartItem.childs.data[0].childs.data[i] = objWithModifiers
      }
      return finalCartItem
   }
}
