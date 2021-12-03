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
const productData = {
   id: 1080,
   name: "Adrish's Special",
   type: 'simple',
   assets: {
      images: [
         'https://storage.eu.content-cdn.io/cdn-cgi/image/height=170,width=180,quality=100/https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/ProductImages/Large/NewBeefMudabal.png',
         'https://storage.eu.content-cdn.io/cdn-cgi/image/height=170,width=180,quality=100/https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/ProductImages/Large/250x250pix-ckn-tortilla-jalapeno-meal-with-NEW-icon.png',
         'https://storage.eu.content-cdn.io/cdn-cgi/image/height=170,width=180,quality=100/https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/ProductImages/Large/NewSuper-HERFYcopy.png',
      ],
      videos: [],
   },
   tags: ['Hot', 'New', 'Trending', 'Trending', 'Final'],
   additionalText: 'comes with Ketchup',
   description: 'SLdhasldha',
   price: 5,
   discount: 50,
   isPopupAllowed: true,
   isPublished: true,
   defaultProductOptionId: null,
   productOptions: [
      {
         id: 1203,
         position: 1000000,
         type: 'readyToEat',
         label: 'Regular',
         price: 10,
         discount: 0,
         cartItem: {
            childs: {
               data: [
                  {
                     childs: {
                        data: [],
                     },
                     unitPrice: 10,
                     productOptionId: 1203,
                  },
               ],
            },
            productId: 1080,
            unitPrice: 2.5,
         },
         modifier: {
            id: 1003,
            name: 'modifier-sGh3i',
            categories: [
               {
                  id: 1003,
                  name: 'category-IOSqx',
                  isRequired: true,
                  type: 'single',
                  limits: {
                     max: null,
                     min: 1,
                  },
                  options: [],
                  __typename: 'onDemand_modifierCategory',
               },
            ],
            __typename: 'onDemand_modifier',
         },
         __typename: 'products_productOption',
      },
      {
         id: 1206,
         position: 500000,
         type: 'mealKit',
         label: 'Medium',
         price: 20,
         discount: 0,
         cartItem: {
            childs: {
               data: [
                  {
                     childs: {
                        data: [
                           {
                              simpleRecipeYieldId: 1025,
                           },
                           {
                              simpleRecipeYieldId: 1025,
                           },
                           {
                              simpleRecipeYieldId: 1025,
                           },
                           {
                              simpleRecipeYieldId: 1025,
                           },
                           {
                              simpleRecipeYieldId: 1025,
                           },
                           {
                              simpleRecipeYieldId: 1025,
                           },
                        ],
                     },
                     unitPrice: 20,
                     productOptionId: 1206,
                  },
               ],
            },
            productId: 1080,
            unitPrice: 2.5,
         },
         modifier: null,
         __typename: 'products_productOption',
      },
      {
         id: 1237,
         position: 0,
         type: null,
         label: 'Large',
         price: 5,
         discount: 0,
         cartItem: {
            childs: {
               data: [
                  {
                     childs: {
                        data: [],
                     },
                     unitPrice: 5,
                     productOptionId: 1237,
                  },
               ],
            },
            productId: 1080,
            unitPrice: 2.5,
         },
         modifier: {
            id: 1002,
            name: 'Pizza options',
            categories: [
               {
                  id: 1002,
                  name: 'choose your crust',
                  isRequired: true,
                  type: 'multiple',
                  limits: {
                     max: 2,
                     min: 1,
                  },
                  options: [
                     {
                        id: 1004,
                        name: 'Cheese burst',
                        price: 100,
                        discount: 0,
                        quantity: 1,
                        image: 'https://storage.eu.content-cdn.io/cdn-cgi/image/height=92,quality=100/https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/ProductImages/Large/sideFriesReg.png',
                        isActive: true,
                        sachetItemId: null,
                        ingredientSachetId: null,
                        cartItem: {
                           data: [
                              {
                                 unitPrice: 100,
                                 modifierOptionId: 1004,
                              },
                           ],
                        },
                        __typename: 'onDemand_modifierCategoryOption',
                     },
                     {
                        id: 1016,
                        name: 'Mushroom Soba Noodles - 2 servings',
                        price: 0,
                        discount: 0,
                        quantity: 1,
                        image: 'https://storage.eu.content-cdn.io/cdn-cgi/image/height=92,quality=100/https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/ProductImages/Large/sideFriesReg.png',
                        isActive: false,
                        sachetItemId: null,
                        ingredientSachetId: null,
                        cartItem: {
                           data: [
                              {
                                 unitPrice: 0,
                                 modifierOptionId: 1016,
                              },
                           ],
                        },
                        __typename: 'onDemand_modifierCategoryOption',
                     },
                     {
                        id: 1021,
                        name: 'option-UzL0q',
                        price: 0,
                        discount: 0,
                        quantity: 1,
                        image: 'https://storage.eu.content-cdn.io/cdn-cgi/image/height=92,quality=100/https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/ProductImages/Large/sideFriesReg.png',
                        isActive: true,
                        sachetItemId: null,
                        ingredientSachetId: null,
                        cartItem: {
                           data: [
                              {
                                 unitPrice: 0,
                                 modifierOptionId: 1021,
                              },
                           ],
                        },
                        __typename: 'onDemand_modifierCategoryOption',
                     },
                  ],
                  __typename: 'onDemand_modifierCategory',
               },
               {
                  id: 1022,
                  name: 'Another one',
                  isRequired: true,
                  type: 'single',
                  limits: {
                     max: 1,
                     min: 1,
                  },
                  options: [
                     {
                        id: 1017,
                        name: 'Beans',
                        price: 1,
                        discount: 50,
                        quantity: 1,
                        image: 'https://dailykit-133-test.s3.amazonaws.com/images/21814-mac-cheese.jpg',
                        isActive: true,
                        sachetItemId: null,
                        ingredientSachetId: null,
                        cartItem: {
                           data: [
                              {
                                 unitPrice: 0.5,
                                 modifierOptionId: 1017,
                              },
                           ],
                        },
                        __typename: 'onDemand_modifierCategoryOption',
                     },
                     {
                        id: 10171,
                        name: 'Beans Return',
                        price: 1,
                        discount: 50,
                        quantity: 1,
                        image: 'https://dailykit-133-test.s3.amazonaws.com/images/21814-mac-cheese.jpg',
                        isActive: true,
                        sachetItemId: null,
                        ingredientSachetId: null,
                        cartItem: {
                           data: [
                              {
                                 unitPrice: 0.5,
                                 modifierOptionId: 1017,
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
         __typename: 'products_productOption',
      },
   ],
   __typename: 'products_product',
}
export const KioskModifier = props => {
   const { config, setShowModifier, productData, edit = false } = props
   const { t } = useTranslation()
   //context
   const { addToCart, methods } = React.useContext(CartContext)
   console.log('productData', productData)
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
                  style={{ color: '#ffffff' }}
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
            <div className="hern-kiosk__menu-product-modifier-brief"></div>
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
                                    style={{ color: '#ffffff' }}
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
