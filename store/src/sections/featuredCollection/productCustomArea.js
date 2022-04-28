import { Modal } from 'antd'
import classNames from 'classnames'
import React, { useState } from 'react'
import { Button, CounterButton, ModifierPopup } from '../../components'
import { CartContext, useTranslation } from '../../context'
import { useConfig } from '../../lib'
import { getCartItemWithModifiers } from '../../utils'

export const CustomArea = props => {
   const { data, setProductModifier, showAddToCartButtonFullWidth } = props
   const { addToCart, combinedCartItems, methods, cartState } =
      React.useContext(CartContext)
   const { locationId, storeStatus, configOf, setShowLocationSelectionPopup } =
      useConfig()
   const theme = configOf('theme-color', 'Visual')?.themeColor
   const addToCartButtonConfig = configOf('Add to cart button', 'Visual')?.[
      'Add to cart Button'
   ]
   const themeColor = theme?.accent?.value
      ? theme?.accent?.value
      : 'rgba(5, 150, 105, 1)'

   const [availableQuantityInCart, setAvailableQuantityInCart] = useState(0)
   const [productCartItemIds, setProductCartItemIds] = React.useState([])
   const [showChooseIncreaseType, setShowChooseIncreaseType] = useState(false)
   const [showModifierPopup, setShowModifierPopup] = React.useState(false)

   const { t } = useTranslation()

   React.useLayoutEffect(() => {
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

   const repeatLastOne = async productData => {
      // select latest added product
      const cartDetailSelectedOfLatestProduct = cartState.cartItems
         .filter(x => x.productId === productData.id)
         .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
         .pop()

      // if is there no  product option available in added product
      if (cartDetailSelectedOfLatestProduct.childs.length === 0) {
         addToCart(productData.defaultCartItem, 1)
         setShowChooseIncreaseType(false)
         return
      }

      const productOptionId =
         cartDetailSelectedOfLatestProduct.childs[0].productOption.id

      const selectedProductOption = productData.productOptions.find(
         eachProductOption => eachProductOption.id === productOptionId
      )

      // if there is product option then check is there any modifier available in product option

      // there is no modifier available in product option
      if (
         selectedProductOption.additionalModifiers.length === 0 &&
         selectedProductOption.modifier === null
      ) {
         addToCart(selectedProductOption.cartItem, 1)
         setShowChooseIncreaseType(false)
         return
      }

      const modifierCategoryOptionsIds =
         cartDetailSelectedOfLatestProduct.childs[0].childs.map(
            x => x?.modifierOption?.id
         )
      let nestedModifierCategoryOptionsIds = []
      cartDetailSelectedOfLatestProduct.childs[0].childs.forEach(eachOption => {
         if (eachOption.childs.length > 0) {
            eachOption.childs.forEach(nestedEachOption => {
               nestedModifierCategoryOptionsIds.push(
                  nestedEachOption.modifierOption.id
               )
            })
         }
      })
      console.log(
         'nestedModifierCategoryOptionsIds',
         nestedModifierCategoryOptionsIds
      )

      let allModifierOption = []
      let allNestedModifierOption = []
      // select all modifier options from modifier
      selectedProductOption.modifier.categories.forEach(category => {
         category.options.forEach(option => {
            const selectedOption = {
               modifierCategoryID: category.id,
               modifierCategoryOptionsID: option.id,
               modifierCategoryOptionsPrice: option.price,
               cartItem: option.cartItem,
            }
            if (modifierCategoryOptionsIds.includes(option.id)) {
               allModifierOption = allModifierOption.concat(selectedOption)
            }
         })
      })
      // select all modifier options from additionalModifiers
      if (selectedProductOption.additionalModifiers) {
         selectedProductOption.additionalModifiers.forEach(
            eachAdditionalModifier => {
               eachAdditionalModifier.modifier.categories.forEach(category => {
                  category.options.forEach(option => {
                     const selectedOption = {
                        modifierCategoryID: category.id,
                        modifierCategoryOptionsID: option.id,
                        modifierCategoryOptionsPrice: option.price,
                        cartItem: option.cartItem,
                     }
                     if (modifierCategoryOptionsIds.includes(option.id)) {
                        allModifierOption =
                           allModifierOption.concat(selectedOption)
                     }
                  })
               })
            }
         )
      }

      // select all select nested modifier option

      if (nestedModifierCategoryOptionsIds.length > 0) {
         let allAvailableModifiers = []
         if (!_.isEmpty(selectedProductOption.additionalModifiers)) {
            allAvailableModifiers = [
               ...allAvailableModifiers,
               ...selectedProductOption.additionalModifiers.map(
                  eachAdditionalModifier => eachAdditionalModifier.modifier
               ),
            ]
         }
         if (!_.isEmpty(selectedProductOption.modifier)) {
            allAvailableModifiers.push(selectedProductOption.modifier)
         }

         let allNestedModifiers = []
         console.log('allAvailableModifiers', allAvailableModifiers)
         allAvailableModifiers.forEach(eachModifier => {
            eachModifier.categories.forEach(eachCategory => {
               eachCategory.options.forEach(eachOption => {
                  if (eachOption.additionalModifierTemplateId) {
                     allNestedModifiers.push({
                        ...eachOption.additionalModifierTemplate,
                        parentModifierOptionId: eachOption.id,
                     })
                  }
               })
            })
         })
         console.log('allNestedModifiers', allNestedModifiers)
         allNestedModifiers.forEach(eachModifier => {
            eachModifier.categories.forEach(category => {
               category.options.forEach(option => {
                  const selectedOption = {
                     modifierCategoryID: category.id,
                     modifierCategoryOptionsID: option.id,
                     modifierCategoryOptionsPrice: option.price,
                     cartItem: option.cartItem,
                     parentModifierOptionId:
                        eachModifier.parentModifierOptionId,
                  }
                  if (nestedModifierCategoryOptionsIds.includes(option.id)) {
                     allNestedModifierOption =
                        allNestedModifierOption.concat(selectedOption)
                  }
               })
            })
         })
         console.log('allNestedModifierOption', allNestedModifierOption)
      }

      // no nested modifier option available
      if (allNestedModifierOption.length > 0) {
         const nestedModifierOptionsGroupByParentModifierOptionId = _.chain(
            allNestedModifierOption
         )
            .groupBy('parentModifierOptionId')
            .map((value, key) => ({
               parentModifierOptionId: +key,
               data: value,
            }))
            .value()
         const cartItem = getCartItemWithModifiers(
            selectedProductOption.cartItem,
            allModifierOption.map(x => x.cartItem),
            nestedModifierOptionsGroupByParentModifierOptionId
         )
         console.log('finalCartItem', cartItem)
         await addToCart(cartItem, 1)
         setShowChooseIncreaseType(false)
      } else {
         const cartItem = getCartItemWithModifiers(
            selectedProductOption.cartItem,
            allModifierOption.map(x => x.cartItem)
         )
         await addToCart(cartItem, 1)
         setShowChooseIncreaseType(false)
      }
   }

   return (
      <div
         className={classNames('hern-on-demand-product-custom-area', {
            'hern-on-demand-product-custom-area--no-full-width':
               !showAddToCartButtonFullWidth,
         })}
      >
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
                  gap: '8px',
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
                     whiteSpace: 'nowrap',
                     color: themeColor,
                  }}
               >
                  {t("I'LL CHOOSE")}
               </Button>
               <Button
                  style={{
                     padding: '.1em 2em',
                     whiteSpace: 'nowrap',
                     transform: 'translateY(0)',
                  }}
                  onClick={async () => {
                     await repeatLastOne(data)
                  }}
               >
                  {t('REPEAT LAST ONE')}
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
               className={classNames('hern-custom-area-add-btn', {
                  'hern-custom-area-add-btn--rounded':
                     addToCartButtonConfig?.variant?.value?.value === 'rounded',
               })}
               type="outline"
               onClick={async () => {
                  if (!locationId) {
                     setShowLocationSelectionPopup(true)
                  } else {
                     if (data.productOptions.length > 0) {
                        setProductModifier(data)
                        setShowModifierPopup(true)
                     } else {
                        await addToCart(data.defaultCartItem, 1)
                     }
                  }
               }}
            >
               {t(`${addToCartButtonConfig?.label?.value ?? 'ADD'}`)}
            </Button>
         ) : (
            <CounterButton
               count={availableQuantityInCart}
               incrementClick={async () => {
                  if (data.productOptions.length > 0 && data.isPopupAllowed) {
                     setShowChooseIncreaseType(true)
                  } else {
                     await addToCart(data.defaultCartItem, 1)
                  }
               }}
               decrementClick={() => {
                  removeCartItems([
                     productCartItemIds[availableQuantityInCart - 1],
                  ])
               }}
               showDeleteButton
            />
         )}
         {data.productOptions.length > 0 && <span>{t('Customizable')}</span>}
      </div>
   )
}
