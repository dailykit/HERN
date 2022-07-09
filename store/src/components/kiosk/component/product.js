import React, { useEffect, useState } from 'react'
import { Carousel, Layout, Modal } from 'antd'
import KioskButton from './button'
import { CartContext, useTranslation } from '../../../context'
import {
   combineCartItems,
   formatCurrency,
   getCartItemWithModifiers,
   nestedModifierTemplateIds,
} from '../../../utils'
import { KioskModifier, KioskCounterButton } from '.'
import { GET_MODIFIER_BY_ID, PRODUCT_ONE } from '../../../graphql'
import { useQuery } from '@apollo/react-hooks'
import { useConfig, graphQLClientSide } from '../../../lib'
import { HernLazyImage } from '../../../utils/hernImage'
import { getPriceWithDiscount } from '../../../utils'
import moment from 'moment'
import classNames from 'classnames'
import isNull from 'lodash/isNull'
import isEmpty from 'lodash/isEmpty'
import { useIntl } from 'react-intl'
import { BiPlus } from 'react-icons/bi'
import { RoundedCloseIcon } from '../../../assets/icons/RoundedCloseIcon'
const { Header, Content, Footer } = Layout

export const KioskProduct = props => {
   // context
   const { cartState, methods, addToCart, combinedCartItems } =
      React.useContext(CartContext)
   const {
      brand,
      isConfigLoading,
      kioskDetails,
      isStoreAvailable,
      brandLocation,
   } = useConfig()

   const { config, productData, setCurrentPage } = props
   const { t, locale, dynamicTrans } = useTranslation()
   const { formatMessage } = useIntl()
   const [showModifier, setShowModifier] = useState(false)
   const [availableQuantityInCart, setAvailableQuantityInCart] = useState(0)
   const currentLang = React.useMemo(() => locale, [locale])

   // Related products to cart
   const addRelatedProductToCart =
      config?.relatedProducts?.addRelatedProductToCart?.value || false

   // const [combinedCartItems, setCombinedCartData] = useState(null)
   const [showChooseIncreaseType, setShowChooseIncreaseType] = useState(false) // show I'll choose or repeat last one popup

   useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   useEffect(() => {
      if (combinedCartItems) {
         const allCartItemsIdsForThisProducts = combinedCartItems
            .filter(x => x.productId === productData.id)
            .map(x => x.ids)
            .flat().length
         setAvailableQuantityInCart(allCartItemsIdsForThisProducts)
      }
   }, [combinedCartItems])
   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: kioskDetails?.locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, kioskDetails?.locationId, brandLocation?.id]
   )

   // const { data: additionalModifierTemplates } = useQuery(GET_MODIFIER_BY_ID, {
   //    variables: {
   //       priceArgs: argsForByLocation,
   //       discountArgs: argsForByLocation,
   //       modifierCategoryOptionCartItemArgs: argsForByLocation,
   //       id: additionalModifierTemplateIds,
   //    },
   //    skip:
   //       isConfigLoading ||
   //       !brand?.id ||
   //       !(additionalModifierTemplateIds.length > 0),
   // })

   // counter button (-) delete last cartItem
   const onMinusClick = cartItemIds => {
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

   // repeat last order
   const repeatLastOne = async productData => {
      const { product: productCompleteData } = await graphQLClientSide.request(
         PRODUCT_ONE,
         {
            id: productData.id,
            params: argsForByLocation,
         }
      )
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
      const modifierCategoryOptionsIds =
         cartDetailSelectedProduct.childs[0].childs.map(
            x => x?.modifierOption?.id
         )

      //selected product option
      const selectedProductOption = productCompleteData.productOptions.find(
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
      if (selectedProductOption.additionalModifiers.length) {
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
   const showAddToCartButton = React.useMemo(() => {
      // if product has modifier option then add to cart handle by modifier
      if (productData.productOptions.length > 0 && productData.isPopupAllowed) {
         return true
      } else {
         // else we will hide add to cart button
         if (isStoreAvailable) {
            return true
         } else {
            return false
         }
      }
   }, [isStoreAvailable])

   const isProductOutOfStock = React.useMemo(() => {
      if (productData.isAvailable) {
         if (
            productData.productOptions.length > 0 &&
            productData.isPopupAllowed
         ) {
            const availableProductOptions = productData.productOptions.filter(
               option => option.isPublished && option.isAvailable
            ).length
            if (availableProductOptions > 0) {
               return false
            } else {
               return true
            }
         } else {
            return false
         }
      }
      return true
   }, [productData])

   const defaultProductOption = React.useMemo(() => {
      if (productData.productOptions.length === 0) {
         return {}
      }
      if (isProductOutOfStock) {
         return productData.productOptions[0]
      }
      return (
         productData.productOptions.find(
            x =>
               x.id === productData.defaultProductOptionId &&
               x.isPublished &&
               x.isAvailable
         ) ||
         productData.productOptions.find(x => x.isPublished && x.isAvailable)
      )
   }, [productData, isProductOutOfStock])

   const handelAddToCartClick = () => {
      // product availability
      if (productData.isAvailable) {
         if (showAddToCartButton) {
            if (
               (productData.productOptions.length > 0 &&
                  productData.isPopupAllowed) ||
               (addRelatedProductToCart &&
                  productData?.relatedProductIds?.ids.length > 0)
            ) {
               const availableProductOptions =
                  productData.productOptions.filter(
                     option => option.isAvailable && option.isPublished
                  ).length
               if (availableProductOptions > 0 || addRelatedProductToCart) {
                  setShowModifier(true)
               }
            } else {
               addToCart(productData.defaultCartItem, 1)
            }
         }
      }
   }

   return (
      <>
         <div
            className="hern-kiosk__menu-product"
            style={{
               ...(!config.productSettings.showProductCardFullView.value && {
                  filter:
                     'drop-shadow(0px 0.64912px 3.2456px rgba(0, 107, 177, 0.4))',
               }),
               ...(config?.productSettings?.shadowOnProductCard?.value && {
                  boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.1)',
               }),
               ...(config?.productSettings?.squareCorner?.value && {
                  borderRadius: '0',
               }),
            }}
         >
            <Layout style={{ height: '100%' }}>
               <Header
                  className={classNames('hern-kiosk__menu-product-header', {
                     'hern-kiosk__menu-product-header--full-view':
                        config.productSettings.showProductCardFullView.value,
                  })}
               >
                  {!config.productSettings.showProductCardFullView.value && (
                     <div className="hern-kiosk__menu-product-background-shadow"></div>
                  )}

                  {productData.assets.images.length === 0 ? (
                     <img src={config.productSettings.defaultImage.value} />
                  ) : (
                     <Carousel>
                        {productData.assets.images.map((eachImage, index) => {
                           return (
                              <div
                                 className="product_image"
                                 style={{
                                    height: '20em !important',
                                    width: '20em !important',
                                 }}
                                 key={eachImage}
                              >
                                 {isNull(eachImage) || isEmpty(eachImage) ? (
                                    <img
                                       src={
                                          config.productSettings.defaultImage
                                             .value
                                       }
                                       style={{
                                          width: `${
                                             config.productSettings
                                                .showProductCardFullView.value
                                                ? '240px'
                                                : '187px'
                                          }`,
                                          height: `${
                                             config.productSettings
                                                .showProductCardFullView.value
                                                ? '240px'
                                                : '187px'
                                          }`,
                                       }}
                                    />
                                 ) : (
                                    <HernLazyImage
                                       // src={eachImage}
                                       // key={index}
                                       dataSrc={eachImage}
                                       width={
                                          config.productSettings
                                             .showProductCardFullView.value
                                             ? 240
                                             : 187
                                       }
                                       height={
                                          config.productSettings
                                             .showProductCardFullView.value
                                             ? 240
                                             : 187
                                       }
                                       style={{
                                          ...(config.kioskSettings.allowTilt
                                             .value && {
                                             clipPath:
                                                'polygon(0 0, 100% 0, 100% 100%, 0 97%)',
                                          }),
                                       }}
                                       onClick={() => {
                                          handelAddToCartClick()
                                       }}
                                    />
                                 )}
                              </div>
                           )
                        })}
                     </Carousel>
                  )}
               </Header>
               <Content
                  style={{
                     display: 'flex',
                     flexDirection: 'column',
                     backgroundColor: '#ffffff',
                     justifyContent: 'space-between',
                  }}
               >
                  <div className="hern-kiosk__menu-product-content">
                     <span
                        className="hern-kiosk__menu-product-name"
                        data-translation="true"
                     >
                        {config.menuSettings?.showVegToggle?.value &&
                           productData.VegNonVegType !== null && (
                              <KioskVegNonVegTypeIcon
                                 type={productData.VegNonVegType}
                              />
                           )}

                        {productData.name}
                     </span>
                     {productData.additionalText && (
                        <span
                           className="hern-kiosk__menu-product-description"
                           data-translation="true"
                        >
                           {productData.additionalText}
                        </span>
                     )}
                     <span className="hern-kiosk__menu-product-price">
                        {/* <sup></sup> */}
                        {formatCurrency(
                           getPriceWithDiscount(
                              productData.price,
                              productData.discount
                           ) +
                              getPriceWithDiscount(
                                 defaultProductOption?.price || 0,
                                 defaultProductOption?.discount || 0
                              )
                        )}
                     </span>
                  </div>
                  {availableQuantityInCart === 0 ? (
                     showAddToCartButton ? (
                        <KioskButton
                           onClick={() => {
                              // setShowModifier(true)
                              handelAddToCartClick()
                           }}
                           disabled={isProductOutOfStock}
                           buttonConfig={config.kioskSettings.buttonSettings}
                        >
                           <span
                              style={{
                                 ...(config?.menuSettings
                                    ?.productAddToCartButton?.fontWeight
                                    ?.value && {
                                    fontWeight:
                                       config?.menuSettings
                                          ?.productAddToCartButton?.fontWeight
                                          ?.value,
                                 }),
                                 ...(config?.menuSettings
                                    ?.productAddToCartButton?.fontSize
                                    ?.value && {
                                    fontSize:
                                       config?.menuSettings
                                          ?.productAddToCartButton?.fontSize
                                          ?.value,
                                 }),
                              }}
                           >
                              {isStoreAvailable ? (
                                 isProductOutOfStock ? (
                                    t(
                                       config?.menuSettings
                                          ?.productAddToCartButton
                                          ?.outOfStockLabel?.value ||
                                          'Out Of Stock'
                                    )
                                 ) : (
                                    <div
                                       style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                       }}
                                    >
                                       <span>
                                          {t(
                                             config?.menuSettings
                                                ?.productAddToCartButton
                                                ?.addToCartLabel?.value ||
                                                'Add To Cart'
                                          )}
                                       </span>

                                       {config?.menuSettings
                                          ?.productAddToCartButton?.showIcon
                                          ?.value && (
                                          <>
                                             &nbsp;
                                             <BiPlus size={16} />
                                          </>
                                       )}
                                    </div>
                                 )
                              ) : (
                                 t(
                                    config?.menuSettings?.productAddToCartButton
                                       ?.viewProductLabel?.value ||
                                       'View Product'
                                 )
                              )}
                           </span>
                        </KioskButton>
                     ) : null
                  ) : (
                     <KioskCounterButton
                        config={config}
                        onMinusClick={() => {
                           const idsAv = combinedCartItems
                              .filter(x => x.productId === productData.id)
                              .map(x => x.ids)
                              .flat()
                           onMinusClick([idsAv[idsAv.length - 1]])
                        }}
                        onPlusClick={() => {
                           if (
                              productData.productOptions.length > 0 &&
                              productData.isPopupAllowed
                           ) {
                              setShowChooseIncreaseType(true)
                           } else {
                              if (
                                 addRelatedProductToCart &&
                                 productData?.relatedProductIds?.ids.length > 0
                              ) {
                                 setShowModifier(true)
                              } else {
                                 addToCart(productData.defaultCartItem, 1)
                              }
                           }
                        }}
                        quantity={availableQuantityInCart}
                     />
                  )}
               </Content>
            </Layout>
         </div>
         <Modal
            title={formatMessage({ id: 'Repeat last used customization' })}
            visible={showChooseIncreaseType}
            centered={true}
            onCancel={() => {
               setShowChooseIncreaseType(false)
            }}
            closable={
               config?.productSettings?.repeatLastOne?.showCloseIcon?.value
                  ? config?.productSettings?.repeatLastOne?.showCloseIcon?.value
                  : false
            }
            footer={null}
            width={
               config?.productSettings?.repeatLastOne?.variant?.value?.value ===
               'large'
                  ? 800
                  : 520
            }
            className={classNames({
               'hern-kiosk__increase-type-modal':
                  config?.productSettings?.repeatLastOne?.variant?.value
                     ?.value === 'large',
            })}
            closeIcon={<RoundedCloseIcon />}
         >
            {config?.productSettings?.repeatLastOne?.showProductName?.value && (
               <span
                  className="hern-kiosk__product-type-mods__menu-product-name"
                  data-translation="true"
               >
                  {productData.name}
               </span>
            )}
            <div
               style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
               }}
            >
               <KioskButton
                  onClick={() => {
                     setShowModifier(true)
                     setShowChooseIncreaseType(false)
                  }}
                  style={{
                     border: `2px solid ${config.kioskSettings.theme.secondaryColor.value}`,
                     background: 'transparent !important',
                     padding: '.1em 2em',
                     color: `${config.kioskSettings.theme.primaryColor.value}`,
                  }}
                  buttonConfig={config.kioskSettings.buttonSettings}
               >
                  {t("I'LL CHOOSE")}
               </KioskButton>
               <KioskButton
                  style={{ padding: '.1em 2em' }}
                  onClick={() => {
                     repeatLastOne(productData)
                  }}
                  buttonConfig={config.kioskSettings.buttonSettings}
               >
                  {t(
                     config?.productSettings?.repeatLastOne
                        ?.labelForRepeatLastOneButton?.value ||
                        'REPEAT LAST ONE'
                  )}
               </KioskButton>
            </div>
         </Modal>
         {showModifier && (
            <KioskModifier
               config={config}
               onCloseModifier={() => {
                  setShowModifier(false)
               }}
               productData={productData}
               setCurrentPage={setCurrentPage}
               key={productData.id}
            />
         )}
      </>
   )
}
const KioskVegNonVegTypeIcon = ({ type }) => {
   const isVeg = type === 'veg' || type === 'vegetarian'
   if (type == null) return <></>
   if (isVeg) {
      return (
         <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <rect
               x="0.757812"
               y="1.11987"
               width="15"
               height="15"
               stroke="#4E9914"
            />
            <circle cx="8.25781" cy="8.61987" r="4" fill="#4E9914" />
         </svg>
      )
   }
   return (
      <svg
         width="17"
         height="17"
         viewBox="0 0 17 17"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <rect
            x="1.25781"
            y="1.11993"
            width="15"
            height="15"
            stroke="#D53440"
         />
         <path
            d="M8.75781 4.61993L12.7578 11.0199H4.75781L8.75781 4.61993Z"
            fill="#D53440"
         />
      </svg>
   )
}
