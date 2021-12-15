import { each } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Button, ProductCard } from '.'
import { RadioIcon, ShowImageIcon } from '../assets/icons'
import { formatCurrency, getRoute } from '../utils'
import { CloseIcon, CheckBoxIcon } from '../assets/icons'
import { useOnClickOutside } from '../utils/useOnClickOutisde'
import { CartContext } from '../context'
import { CounterButton } from './counterBtn'
import classNames from 'classnames'
import Link from 'next/link'

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
   } = props
   //context
   const { addToCart, methods } = React.useContext(CartContext)
   console.log('productData', productData)
   const [productOption, setProductOption] = useState(
      productData.productOptions[0]
   ) // for by default choose one product option
   const [quantity, setQuantity] = useState(1)
   const [selectedOptions, setSelectedOptions] = useState({
      single: [],
      multiple: [],
   })
   const [status, setStatus] = useState('loading')
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
            productOption.cartItem,
            allSelectedOptions.map(x => x.cartItem)
         )
         // const objects = new Array(quantity).fill({ ...cartItem })
         // console.log('cartItem', objects)

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
         closeModifier()
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
            {showCounterBtn && (
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

         setProductOption(selectedProductOption)
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
         setProductOption(null)
      }
   }, [])

   useEffect(() => {
      if (productData) {
         document.querySelector('body').style.overflowY = 'hidden'
      }
      return () => {
         document.querySelector('body').style.overflowY = 'auto'
      }
   }, [productData])
   if (status === 'loading') {
      return <p>Loading</p>
   }
   return (
      <>
         <div
            className={classNames('hern-product-modifier-pop-up-container', {
               'hern-product-modifier-pop-up-container--show-modifier-pop-up':
                  productData,
            })}
         >
            <div className="hern-product-modifier-pop-up-product">
               <div
                  className="hern-product-modifier-pop-up-close-icon"
                  onClick={closeModifier}
               >
                  <CloseIcon size={20} stroke="currentColor" />
               </div>
               <div className="hern-product-modifier-pop-up-product-details">
                  <ProductCard
                     data={productData}
                     showImage={false}
                     showCustomText={false}
                     customAreaComponent={CustomArea}
                     showModifier={false}
                     useForThirdParty={true}
                  />
               </div>
               <div className="hern-product-modifier-pop-up-product-option-list">
                  <label htmlFor="products">Available Options:</label>
                  <br />
                  <ul>
                     {productData.productOptions.map(eachOption => {
                        return (
                           <div
                              key={eachOption.id}
                              style={{
                                 border: `${
                                    productOption.id === eachOption.id
                                       ? '1px solid #75b1da'
                                       : '1px solid #e4e4e4'
                                 }`,
                                 padding: '16px',
                                 display: 'flex',
                                 justifyContent: 'space-between',
                                 marginBottom: '8px',
                              }}
                           >
                              <li onClick={e => setProductOption(eachOption)}>
                                 {eachOption.label}

                                 {' (+ '}
                                 {formatCurrency(
                                    eachOption.price - eachOption.discount
                                 )}
                                 {')'}
                              </li>
                              <div>
                                 <Link
                                    href={getRoute('/recipes/' + eachOption.id)}
                                 >
                                    View recipe
                                 </Link>
                              </div>
                           </div>
                        )
                     })}
                  </ul>
                  {/* <select
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
                  </select> */}
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
                                                eachOption.image &&
                                                showModifierImage
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
               <div style={{ padding: '0 32px' }}>
                  <Button
                     className="hern-product-modifier-pop-up-add-to-cart-btn"
                     onClick={handleAddOnCartOn}
                  >
                     ADD TO CART {totalAmount()}
                  </Button>
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
               ADD TO CART {totalAmount()}
            </Button> */}
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
   console.log('combineMOdifiers', combinedModifiers)
   const dataArr = finalCartItem?.childs?.data[0]?.childs?.data
   const dataArrLength = dataArr.length

   console.log('finalCartItemBefore', finalCartItem)
   finalCartItem.childs.data[0].childs.data = combinedModifiers

   return finalCartItem
   // if (dataArrLength === 0) {
   //    // finalCartItem.childs.data[0].childs.data = combinedModifiers
   //    // return finalCartItem
   // } else {
   //    for (let i = 0; i < dataArrLength; i++) {
   //       const objWithModifiers = {
   //          ...dataArr[i],
   //          childs: {
   //             data: combinedModifiers,
   //          },
   //       }
   //       finalCartItem.childs.data[0].childs.data[i] = objWithModifiers
   //    }
   //    console.log('finalcartItems', finalCartItem)
   //    return finalCartItem
   // }
}
