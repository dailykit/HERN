import React, { useEffect, useState } from 'react'
import { Modal } from 'antd'
import isEmpty from 'lodash/isEmpty'
import { useIntl } from 'react-intl'

import { DeleteIcon, EditIcon, ChevronIcon } from '../assets/icons'
import { useTranslation, CartContext } from '../context'
import {
   formatCurrency,
   getCartItemWithModifiers,
   nestedModifierTemplateIds,
} from '../utils'
import { PRODUCTS, GET_MODIFIER_BY_ID, PRODUCT_ONE } from '../graphql'
import { useConfig } from '../lib'
import { ModifierPopup } from '.'
import { useQuery } from '@apollo/react-hooks'
import { Button } from './button'
import { CounterButton } from '.'
import { HernLazyImage } from '../utils/hernImage'

const CartCard = props => {
   // productData --> product data from cart
   const { productData, removeCartItems, quantity = 0 } = props

   const { brand, locationId, isConfigLoading, brandLocation } = useConfig()
   const { addToCart, cartState } = React.useContext(CartContext)
   const { t, dynamicTrans, locale } = useTranslation()
   const { formatMessage } = useIntl()

   const [modifyProductId, setModifyProductId] = useState(null)
   const [modifyProduct, setModifyProduct] = useState(null)
   const [modifierType, setModifierType] = useState(null)
   const [cartDetailSelectedProduct, setCartDetailSelectedProduct] =
      useState(null)
   const [showAdditionalDetailsOnCard, setShowAdditionalDetailsOnCard] =
      useState(false) // show modifier and product options details
   const [showChooseIncreaseType, setShowChooseIncreaseType] = useState(false) // show I'll choose or repeat last one popup
   const [showModifier, setShowModifier] = useState(false) // show modifier popup
   const [forRepeatLastOne, setForRepeatLastOne] = useState(false) // to run repeatLastOne fn in PRODUCTS query

   let totalPrice = 0
   let totalDiscount = 0
   const price = product => {
      if (!isEmpty(product)) {
         totalPrice += product.price
         totalDiscount += product.discount
         if (!isEmpty(product.childs)) {
            product.childs.forEach(product => {
               price(product)
            })
         }
         return {
            totalPrice: totalPrice * quantity,
            totalDiscount: totalDiscount * quantity,
         }
      }
   }
   const getTotalPrice = React.useMemo(() => price(productData), [productData])
   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )

   //fetch product detail which to be increase or edit
   const { data: repeatLastOneData } = useQuery(PRODUCT_ONE, {
      skip: !modifyProductId,
      variables: {
         id: modifyProductId,
         params: argsForByLocation,
      },
      onCompleted: data => {
         // use for repeat last one order
         if (forRepeatLastOne) {
            if (data) {
               return
            }
         }
         if (data) {
            setModifyProduct(data.products[0])
         }
      },
   })

   const additionalModifierTemplateIds = React.useMemo(() => {
      if (repeatLastOneData) {
         return nestedModifierTemplateIds(repeatLastOneData?.product)
      }
   }, [repeatLastOneData])

   // const {
   //    data: additionalModifierTemplates,
   //    loading: additionalModifiersLoading,
   // } = useQuery(GET_MODIFIER_BY_ID, {
   //    variables: {
   //       priceArgs: argsForByLocation,
   //       discountArgs: argsForByLocation,
   //       modifierCategoryOptionCartItemArgs: argsForByLocation,
   //       id: additionalModifierTemplateIds,
   //    },
   //    skip:
   //       isConfigLoading ||
   //       !brand?.id ||
   //       !(
   //          additionalModifierTemplateIds &&
   //          additionalModifierTemplateIds.length > 0
   //       ),
   // })

   useEffect(() => {
      if (repeatLastOneData && forRepeatLastOne) {
         repeatLastOne(repeatLastOneData.product)
      }
   }, [repeatLastOneData, forRepeatLastOne])

   const repeatLastOne = productData => {
      if (cartDetailSelectedProduct.childs.length === 0) {
         addToCart(productData.defaultCartItem, 1)
         setForRepeatLastOne(false)
         setModifyProduct(null)
         setModifyProductId(null)
         setCartDetailSelectedProduct(null)
         setShowChooseIncreaseType(false)
         return
      }

      const productOptionId =
         cartDetailSelectedProduct.childs[0].productOption.id
      const modifierCategoryOptionsIds =
         cartDetailSelectedProduct.childs[0].childs.map(
            x => x?.modifierOption?.id
         )

      //selected product option
      const selectedProductOption = productData.productOptions?.find(
         x => x.id == productOptionId
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
                     multipleModifier = multipleModifier.concat(selectedOption)
                  }
               }
            })
         })
      }

      const allSelectedOptions = [...singleModifier, ...multipleModifier]

      if (selectedProductOption.additionalModifiers) {
         selectedProductOption.additionalModifiers.forEach(option => {
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
                  selectedProductOption.additionalModifiers.forEach(
                     additionalModifier => {
                        if (additionalModifier.modifier) {
                           additionalModifier.modifier.categories.forEach(
                              eachCategory => {
                                 eachCategory.options.forEach(eachOption => {
                                    if (eachOption.additionalModifierTemplate) {
                                       eachOption.additionalModifierTemplate.categories.forEach(
                                          eachCategory => {
                                             additionalModifierOptions.push(
                                                ...eachCategory.options.map(
                                                   eachOptionTemp => ({
                                                      ...eachOptionTemp,
                                                      categoryId:
                                                         eachCategory.id,
                                                   })
                                                )
                                             )
                                          }
                                       )
                                    }
                                 })
                              }
                           )
                        }
                     }
                  )
                  // for single modifiers
                  if (selectedProductOption.modifier) {
                     selectedProductOption.modifier.categories.forEach(
                        eachCategory => {
                           eachCategory.options.forEach(eachOption => {
                              if (eachOption.additionalModifierTemplateId) {
                                 if (eachOption.additionalModifierTemplate) {
                                    eachOption.additionalModifierTemplate.categories.forEach(
                                       eachCategory => {
                                          additionalModifierOptions.push(
                                             ...eachCategory.options.map(
                                                eachOptionTemp => ({
                                                   ...eachOptionTemp,
                                                   categoryId: eachCategory.id,
                                                })
                                             )
                                          )
                                       }
                                    )
                                 }
                              }
                           })
                        }
                     )
                  }

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
         setForRepeatLastOne(false)
         setModifyProduct(null)
         setModifyProductId(null)
         setCartDetailSelectedProduct(null)
         setShowChooseIncreaseType(false)
         return
      }

      const cartItem = getCartItemWithModifiers(
         selectedProductOption.cartItem,
         allSelectedOptions.map(x => x.cartItem)
      )

      addToCart(cartItem, 1)
      setForRepeatLastOne(false)
      setModifyProduct(null)
      setModifyProductId(null)
      setCartDetailSelectedProduct(null)
      setShowChooseIncreaseType(false)
   }

   const onCloseModifier = () => {
      setModifyProduct(null)
      setModifyProductId(null)
      setShowModifier(false)
      setModifierType(null)
   }

   useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [locale, showAdditionalDetailsOnCard])

   // check product and product option available in cart are valid or not by there isPublished and  isAvailability
   const isProductAvailable = product => {
      const selectedProductOption = product.product.productOptions.find(
         option => option.id === product.childs[0]?.productOption?.id
      )
      if (!isEmpty(selectedProductOption)) {
         return (
            product.product.isAvailable &&
            product.product.isPublished &&
            selectedProductOption.isAvailable &&
            selectedProductOption.isPublished
         )
      } else {
         return product.product.isAvailable && product.product.isPublished
      }
   }

   return (
      <div className="hern-cart-card">
         <div className="hern-cart-card__img">
            <HernLazyImage
               dataSrc={productData.image}
               alt="p-image"
               width={300}
               height={300}
            />
         </div>
         <div className="hern-cart-card__details">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <div>
                  <div>
                     <div style={{ display: 'flex', gap: '12px' }}>
                        <span
                           data-translation="true"
                           className="hern-cart-card__title"
                        >
                           {productData.name}
                        </span>
                        &nbsp;
                        {productData.childs.length > 0 && (
                           <button
                              className="hern-cart-card__show-modifier-btn"
                              onClick={() =>
                                 setShowAdditionalDetailsOnCard(
                                    !showAdditionalDetailsOnCard
                                 )
                              }
                           >
                              {showAdditionalDetailsOnCard ? (
                                 <ChevronIcon direction="up" width={5} />
                              ) : (
                                 <ChevronIcon direction="down" />
                              )}
                           </button>
                        )}
                     </div>
                     {showAdditionalDetailsOnCard && (
                        <div className="hern-cart-card-modifiers">
                           <div className="hern-cart-card-modifiers__product-option">
                              <span data-translation="true">
                                 {productData.childs[0].productOption.label ||
                                    'N/A'}
                              </span>{' '}
                              {productData.childs[0].price !== 0 && (
                                 <div>
                                    {
                                       <>
                                          {productData.childs[0].discount >
                                             0 && (
                                             <span
                                                style={{
                                                   textDecoration:
                                                      'line-through',
                                                }}
                                             >
                                                {formatCurrency(
                                                   productData.childs[0].price
                                                )}
                                             </span>
                                          )}
                                          <span style={{ marginLeft: '6px' }}>
                                             {formatCurrency(
                                                productData.childs[0].price -
                                                   productData.childs[0]
                                                      .discount
                                             )}
                                          </span>
                                       </>
                                    }
                                 </div>
                              )}
                           </div>
                           <div className="hern-cart-card-modifiers__list">
                              {productData.childs[0].childs.some(
                                 each => each.modifierOption
                              ) && (
                                 <>
                                    <ul>
                                       {productData.childs.length > 0 &&
                                          productData.childs[0].childs.map(
                                             (modifier, index) =>
                                                modifier.modifierOption ? (
                                                   <li
                                                      key={index}
                                                      className="hern-cart-card-modifiers__list__parent"
                                                   >
                                                      <div className="hern-cart-card-modifiers__list__details">
                                                         <span data-translation="true">
                                                            {
                                                               modifier
                                                                  .modifierOption
                                                                  .name
                                                            }
                                                         </span>

                                                         {modifier.price !==
                                                            0 && (
                                                            <div>
                                                               {
                                                                  <>
                                                                     {modifier.discount >
                                                                        0 && (
                                                                        <span
                                                                           style={{
                                                                              textDecoration:
                                                                                 'line-through',
                                                                           }}
                                                                        >
                                                                           {formatCurrency(
                                                                              modifier.price
                                                                           )}
                                                                        </span>
                                                                     )}
                                                                     <span
                                                                        style={{
                                                                           marginLeft:
                                                                              '6px',
                                                                        }}
                                                                     >
                                                                        {formatCurrency(
                                                                           modifier.price -
                                                                              modifier.discount
                                                                        )}
                                                                     </span>
                                                                  </>
                                                               }
                                                            </div>
                                                         )}
                                                      </div>
                                                      {modifier.childs.length >
                                                         0 && (
                                                         <ul>
                                                            {modifier.childs.map(
                                                               (
                                                                  eachNestedModifier,
                                                                  index
                                                               ) => {
                                                                  return (
                                                                     <li
                                                                        key={
                                                                           index
                                                                        }
                                                                     >
                                                                        <span data-translation="true">
                                                                           {
                                                                              eachNestedModifier
                                                                                 .modifierOption
                                                                                 .name
                                                                           }
                                                                        </span>
                                                                        {eachNestedModifier.price !==
                                                                           0 && (
                                                                           <div>
                                                                              {
                                                                                 <>
                                                                                    {eachNestedModifier.discount >
                                                                                       0 && (
                                                                                       <span
                                                                                          style={{
                                                                                             textDecoration:
                                                                                                'line-through',
                                                                                          }}
                                                                                       >
                                                                                          {formatCurrency(
                                                                                             eachNestedModifier.price
                                                                                          )}
                                                                                       </span>
                                                                                    )}
                                                                                    <span
                                                                                       style={{
                                                                                          marginLeft:
                                                                                             '6px',
                                                                                       }}
                                                                                    >
                                                                                       {formatCurrency(
                                                                                          eachNestedModifier.price -
                                                                                             eachNestedModifier.discount
                                                                                       )}
                                                                                    </span>
                                                                                 </>
                                                                              }
                                                                           </div>
                                                                        )}
                                                                     </li>
                                                                  )
                                                               }
                                                            )}
                                                         </ul>
                                                      )}
                                                   </li>
                                                ) : null
                                          )}
                                    </ul>
                                 </>
                              )}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
               <div className="hern-cart-card__edit-area">
                  {productData.childs.length > 0 && (
                     <EditIcon
                        fill="var(--hern-accent)"
                        title="Edit"
                        onClick={() => {
                           setModifierType('edit')
                           setCartDetailSelectedProduct(productData)
                           setModifyProductId(productData.productId)
                           setShowModifier(true)
                        }}
                     />
                  )}
                  <DeleteIcon
                     stroke={'#40404099'}
                     title="Delete"
                     onClick={() => removeCartItems(productData.ids)}
                  />
               </div>
            </div>

            <div className="hern-cart-card__bottom">
               {isProductAvailable(productData) ? (
                  <CounterButton
                     count={productData.ids.length}
                     incrementClick={() => {
                        if (productData.childs.length > 0) {
                           setShowChooseIncreaseType(true)
                        } else {
                           setCartDetailSelectedProduct(productData)
                           setModifyProductId(productData.productId)
                           setForRepeatLastOne(true)
                        }
                     }}
                     decrementClick={() =>
                        removeCartItems([
                           productData.ids[productData.ids.length - 1],
                        ])
                     }
                     showDeleteButton
                  />
               ) : (
                  <span
                     style={{
                        color: '#f33737',
                        fontWeight: '500',
                        fontSize: '13px',
                     }}
                  >
                     This product is not available
                  </span>
               )}
               <div className="hern-cart-card__price">
                  {getTotalPrice.totalDiscount > 0 && (
                     <span className="hern-cart-card__price__discount">
                        &nbsp;{formatCurrency(getTotalPrice.totalPrice)}
                     </span>
                  )}
                  <span>
                     {getTotalPrice.totalPrice !== 0
                        ? formatCurrency(
                             getTotalPrice.totalPrice -
                                getTotalPrice.totalDiscount
                          )
                        : null}
                  </span>
               </div>
            </div>
         </div>
         {modifyProduct && showModifier && (
            <ModifierPopup
               forNewItem={Boolean(modifierType === 'newItem')}
               edit={Boolean(modifierType === 'edit')}
               productData={modifyProduct}
               closeModifier={onCloseModifier}
               productCartDetail={cartDetailSelectedProduct}
            />
         )}
         <Modal
            title={formatMessage({ id: 'Repeat last used customization' })}
            visible={showChooseIncreaseType}
            centered={true}
            onCancel={() => {
               setShowChooseIncreaseType(false)
            }}
            closable={false}
            footer={null}
         >
            <div>
               <Button
                  variant="outline"
                  onClick={() => {
                     setModifierType('newItem')
                     setCartDetailSelectedProduct(productData)
                     setModifyProductId(productData.productId)
                     setShowChooseIncreaseType(false)
                     setShowModifier(true)
                  }}
                  style={{ marginRight: '8px' }}
               >
                  {t(`I'LL CHOOSE`)}
               </Button>
               <Button
                  onClick={() => {
                     setCartDetailSelectedProduct(productData)
                     setModifyProductId(productData.productId)
                     setForRepeatLastOne(true)
                  }}
               >
                  {t('REPEAT LAST ONE')}
               </Button>
            </div>
         </Modal>
      </div>
   )
}
export { CartCard }
