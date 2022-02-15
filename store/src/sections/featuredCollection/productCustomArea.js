import { Modal } from 'antd'
import React, { useState } from 'react'
import { Button, CounterButton, ModifierPopup } from '../../components'
import { CartContext } from '../../context'
import { useConfig } from '../../lib'
import { getCartItemWithModifiers } from '../../utils'

export const CustomArea = props => {
   const { data, setProductModifier } = props
   const { addToCart, combinedCartItems, methods, cartState } =
      React.useContext(CartContext)
   const { locationId, storeStatus, configOf } = useConfig()
   const theme = configOf('theme-color', 'Visual')?.themeColor
   const themeColor = theme?.accent?.value
      ? theme?.accent?.value
      : 'rgba(5, 150, 105, 1)'

   const [availableQuantityInCart, setAvailableQuantityInCart] = useState(0)
   const [productCartItemIds, setProductCartItemIds] = React.useState([])
   const [showChooseIncreaseType, setShowChooseIncreaseType] = useState(false)
   const [showModifierPopup, setShowModifierPopup] = React.useState(false)
   React.useEffect(() => {
      if (combinedCartItems) {
         const allCartItemsIdsForThisProducts = combinedCartItems
            .filter(x => x.productId === data.id)
            .map(x => x.ids)
            .flat()
         setProductCartItemIds(allCartItemsIdsForThisProducts)
         setAvailableQuantityInCart(allCartItemsIdsForThisProducts.length)
      }
   }, [combinedCartItems])
   const removeCartItems = cartItemIds => {
      console.log('removed id', cartItemIds)
      methods.cartItems.delete({
         variables: {
            where: {
               id: {
                  _in: cartItemIds,
               },
            },
         },
      })
   }

   const closeModifier = () => {
      setShowModifierPopup(false)
   }

   const repeatLastOne = productData => {
      const cartDetailSelectedProduct = cartState.cartItems
         .filter(x => x.productId === productData.id)
         .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
         .pop()
      if (cartDetailSelectedProduct.childs.length === 0) {
         addToCart(productData.defaultCartItem, 1)
         setShowChooseIncreaseType(false)
         return
      }
      const productOptionId =
         cartDetailSelectedProduct.childs[0].productOption.id
      const selectedProductOption = productData.productOptions.find(
         eachProductOption => eachProductOption.id === productOptionId
      )
      if (
         selectedProductOption.additionalModifiers.length === 0 &&
         selectedProductOption.modifier === null
      ) {
         addToCart(selectedProductOption.cartItem, 1)
         closeModifier()
         return
      }
      const modifierCategoryOptionsIds =
         cartDetailSelectedProduct.childs[0].childs.map(
            x => x?.modifierOption?.id
         )

      // select all modifier option id which has modifier option ( parent modifier option id)
      const modifierOptionsConsistAdditionalModifiers =
         cartDetailSelectedProduct.childs[0].childs
            .map(eachModifierOption => {
               if (eachModifierOption.childs.length > 0) {
                  return {
                     parentModifierOptionId:
                        eachModifierOption.modifierOption.id,
                     selectedModifierOptionIds: eachModifierOption.childs.map(
                        x => x.modifierOption.id
                     ),
                  }
               } else {
                  return null
               }
            })
            .filter(eachId => eachId !== null)

      //selected modifiers
      let singleModifier = []
      let multipleModifier = []
      let singleAdditionalModifier = []
      let multipleAdditionalModifier = []
      if (productOptionInCart.modifier) {
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
                     multipleModifier = multipleModifier.concat(selectedOption)
                  }
               }
            })
         })
      }
      const allSelectedOptions = [...singleModifier, ...multipleModifier]
      if (additionalModifierTemplateIds) {
         productOptionInCart.additionalModifiers.forEach(option => {
            option.modifier.categories.forEach(category => {
               category.options.forEach(option => {
                  const selectedOption = {
                     modifierCategoryID: category.id,
                     modifierCategoryOptionsID: option.id,
                     modifierCategoryOptionsPrice: option.price,
                     cartItem: option.cartItem,
                  }
                  if (category.type === 'single') {
                     if (modifierCategoryOptionsIds.includes(option.id)) {
                        singleAdditionalModifier =
                           singleAdditionalModifier.concat(selectedOption)
                     }
                  }
                  if (category.type === 'multiple') {
                     if (modifierCategoryOptionsIds.includes(option.id)) {
                        multipleAdditionalModifier =
                           multipleAdditionalModifier.concat(selectedOption)
                     }
                  }
               })
            })
         })
         const modifierOptionsConsistAdditionalModifiersWithData =
            modifierOptionsConsistAdditionalModifiers.map(
               eachModifierOptionsConsistAdditionalModifiers => {
                  let additionalModifierOptions = []
                  let additionalModifierTemplates = []
                  selectedProductOption.additionalModifiers.forEach(
                     additionalModifier => {
                        if (additionalModifier.modifier) {
                           additionalModifier.modifier.categories.forEach(
                              eachCategory => {
                                 eachCategory.options.forEach(eachOption => {
                                    if (
                                       eachOption.additionalModifierTemplateId
                                    ) {
                                       additionalModifierTemplates.push(
                                          eachOption.additionalModifierTemplate
                                       )
                                    }
                                 })
                              }
                           )
                        }
                     }
                  )
                  additionalModifierTemplates.modifiers.forEach(
                     eachModifier => {
                        eachModifier.categories.forEach(eachCategory => {
                           additionalModifierOptions.push(
                              ...eachCategory.options.map(eachOption => ({
                                 ...eachOption,
                                 categoryId: eachCategory.id,
                              }))
                           )
                        })
                     }
                  )
                  const mapedModifierOptions =
                     eachModifierOptionsConsistAdditionalModifiers.selectedModifierOptionIds.map(
                        eachId => {
                           const additionalModifierOption =
                              additionalModifierOptions.find(
                                 x => x.id === eachId
                              )
                           const selectedOption = {
                              modifierCategoryID:
                                 additionalModifierOption.categoryId,
                              modifierCategoryOptionsID:
                                 additionalModifierOption.id,
                              modifierCategoryOptionsPrice:
                                 additionalModifierOption.price,
                              cartItem: additionalModifierOption.cartItem,
                           }
                           return selectedOption
                        }
                     )
                  return {
                     ...eachModifierOptionsConsistAdditionalModifiers,
                     data: mapedModifierOptions,
                  }
               }
            )

         // root modifiers options + additional modifier's modifier options
         const resultSelectedModifier = [
            ...allSelectedOptions,
            ...singleAdditionalModifier,
            ...multipleAdditionalModifier,
         ]
         const cartItem = getCartItemWithModifiers(
            selectedProductOption.cartItem,
            resultSelectedModifier.map(x => x.cartItem),
            modifierOptionsConsistAdditionalModifiersWithData
         )

         addToCart(cartItem, 1)
         setShowChooseIncreaseType(false)
         return
      }
      const cartItem = getCartItemWithModifiers(
         selectedProductOption.cartItem,
         allSelectedOptions.map(x => x.cartItem)
      )

      addToCart(cartItem, 1)
      setShowChooseIncreaseType(false)
   }
   return (
      <div className="hern-on-demand-product-custom-area">
         <Modal
            title={'Repeat last used customization'}
            visible={showChooseIncreaseType}
            centered={true}
            onCancel={() => {
               setShowChooseIncreaseType(false)
            }}
            closable={false}
            footer={null}
         >
            <div
               style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
               }}
            >
               <Button
                  onClick={() => {
                     setShowModifierPopup(true)
                     setShowChooseIncreaseType(false)
                  }}
                  style={{
                     border: `2px solid ${themeColor}`,
                     background: 'transparent',
                     padding: '1.4px 28px',
                     color: themeColor,
                  }}
               >
                  {"I'LL CHOOSE"}
               </Button>
               <Button
                  style={{ padding: '.1em 2em' }}
                  onClick={() => {
                     repeatLastOne(data)
                  }}
               >
                  {'REPEAT LAST ONE'}
               </Button>
            </div>
         </Modal>
         {showModifierPopup && (
            <ModifierPopup
               productData={data}
               closeModifier={closeModifier}
               modifierWithoutPopup={false}
            />
         )}
         {availableQuantityInCart === 0 ? (
            <Button
               className="hern-custom-area-add-btn"
               type="outline"
               onClick={() => {
                  if (data.productOptions.length > 0) {
                     setProductModifier(data)
                  } else {
                     addToCart({ productId: data.id }, 1)
                  }
               }}
               disabled={
                  locationId ? (storeStatus.status ? false : true) : true
               }
            >
               {locationId
                  ? storeStatus.status
                     ? 'ADD'
                     : 'COMING SOON'
                  : 'COMING SOON'}
            </Button>
         ) : (
            <CounterButton
               count={availableQuantityInCart}
               incrementClick={() => {
                  console.log('hello bro')
                  setShowChooseIncreaseType(true)
               }}
               decrementClick={() => {
                  console.log(
                     'ids',
                     productCartItemIds[availableQuantityInCart - 1]
                  )
                  removeCartItems([
                     productCartItemIds[availableQuantityInCart - 1],
                  ])
               }}
               showDeleteButton
            />
         )}
         {data.productOptions.length > 0 && <span>Customizable</span>}
      </div>
   )
}
