import React, { useEffect, useState } from 'react'
import { Carousel, Layout, Modal } from 'antd'
import KioskButton from './button'
import { CartContext, useTranslation } from '../../../context'
import {
   combineCartItems,
   formatCurrency,
   nestedModifierTemplateIds,
} from '../../../utils'
import { KioskModifier, KioskCounterButton } from '.'
import { GET_MODIFIER_BY_ID } from '../../../graphql'
import { useQuery } from '@apollo/react-hooks'
import { useConfig } from '../../../lib'

const { Header, Content, Footer } = Layout

export const KioskProduct = props => {
   // context
   const { cartState, methods, addToCart, combinedCartItems } =
      React.useContext(CartContext)
   const { brand, isConfigLoading, kioskDetails } = useConfig()

   const { config, productData, setCurrentPage } = props
   const { t, locale, dynamicTrans } = useTranslation()
   const [showModifier, setShowModifier] = useState(false)
   const [availableQuantityInCart, setAvailableQuantityInCart] = useState(0)
   const currentLang = React.useMemo(() => locale, [locale])

   // const [combinedCartItems, setCombinedCartData] = useState(null)
   const [showChooseIncreaseType, setShowChooseIncreaseType] = useState(false) // show I'll choose or repeat last one popup
   const additionalModifierTemplateIds = React.useMemo(() => {
      return nestedModifierTemplateIds(productData)
   }, [productData])

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
         params: {
            brandId: brand?.id,
            locationId: kioskDetails?.locationId,
         },
      }),
      [brand]
   )

   const { data: additionalModifierTemplates } = useQuery(GET_MODIFIER_BY_ID, {
      variables: {
         priceArgs: argsForByLocation,
         discountArgs: argsForByLocation,
         modifierCategoryOptionCartItemArgs: argsForByLocation,
         id: additionalModifierTemplateIds,
      },
      skip:
         isConfigLoading ||
         !brand?.id ||
         !(additionalModifierTemplateIds.length > 0),
   })
   console.log('additionalModifierTemplates', additionalModifierTemplates)
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
      const modifierCategoryOptionsIds =
         cartDetailSelectedProduct.childs[0].childs.map(
            x => x?.modifierOption?.id
         )

      //selected product option
      const selectedProductOption = productData.productOptions.find(
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
      if (additionalModifierTemplateIds) {
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
      <>
         <div className="hern-kiosk__menu-product">
            <Layout style={{ height: '100%' }}>
               <Header className="hern-kiosk__menu-product-header">
                  <div className="hern-kiosk__menu-product-background-shadow"></div>

                  {productData.assets.images.length === 0 ? (
                     <img src={config.productSettings.defaultImage.value} />
                  ) : (
                     <Carousel>
                        {productData.assets.images.map((eachImage, index) => (
                           <div
                              className="product_image"
                              style={{
                                 height: '20em !important',
                                 width: '20em !important',
                              }}
                           >
                              <img
                                 src={eachImage}
                                 key={index}
                                 // style={{ height: '100%', width: '100%' }}
                              />
                           </div>
                        ))}
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
                        data-original-value={productData.name}
                     >
                        {productData.name}
                     </span>
                     {productData.additionalText && (
                        <span
                           className="hern-kiosk__menu-product-description"
                           data-translation="true"
                           data-original-value={productData.additionalText}
                        >
                           {productData.additionalText}
                        </span>
                     )}
                  </div>
                  <span className="hern-kiosk__menu-product-price">
                     {/* <sup></sup> */}
                     {formatCurrency(
                        productData.price -
                           productData.discount +
                           (productData?.productOptions[0]?.price ||
                              0 - productData?.productOptions[0]?.discount ||
                              0)
                     )}
                  </span>
                  {availableQuantityInCart === 0 ? (
                     <KioskButton
                        onClick={() => {
                           // setShowModifier(true)
                           if (
                              productData.productOptions.length > 0 &&
                              productData.isPopupAllowed
                           ) {
                              setShowModifier(true)
                           } else {
                              addToCart(productData.defaultCartItem, 1)
                           }
                        }}
                     >
                        {t('Add To Cart')}
                     </KioskButton>
                  ) : (
                     <KioskCounterButton
                        config={config}
                        onMinusClick={() => {
                           console.log('combinedCartItems')
                           const idsAv = combinedCartItems
                              .filter(x => x.productId === productData.id)
                              .map(x => x.ids)
                              .flat()
                           onMinusClick([idsAv[idsAv.length - 1]])
                        }}
                        onPlusClick={() => {
                           setShowChooseIncreaseType(true)
                        }}
                        quantity={availableQuantityInCart}
                     />
                  )}
               </Content>
            </Layout>
         </div>
         <Modal
            title={t('Repeat last used customization')}
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
               <KioskButton
                  onClick={() => {
                     setShowModifier(true)
                     setShowChooseIncreaseType(false)
                  }}
                  style={{
                     border: `2px solid ${config.kioskSettings.theme.secondaryColor.value}`,
                     background: 'transparent',
                     padding: '.1em 2em',
                  }}
               >
                  {t("I'LL CHOOSE")}
               </KioskButton>
               <KioskButton
                  style={{ padding: '.1em 2em' }}
                  onClick={() => {
                     repeatLastOne(productData)
                  }}
               >
                  {t('REPEAT LAST ONE')}
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
            />
         )}
      </>
   )
}

const getCartItemWithModifiers = (
   cartItemInput,
   selectedModifiersInput,
   nestedModifiersInput = null
) => {
   // cartItemInput --> selectedProductOption.cartItem
   const finalCartItem = { ...cartItemInput }

   const combinedModifiers = selectedModifiersInput.reduce(
      (acc, obj) => [...acc, ...obj.data],
      []
   )
   const dataArr = finalCartItem?.childs?.data[0]?.childs?.data
   const dataArrLength = dataArr.length

   finalCartItem.childs.data[0].childs.data = [...combinedModifiers]

   if (nestedModifiersInput) {
      nestedModifiersInput.forEach(eachNestedModifierInput => {
         const foundModifierIndex =
            finalCartItem.childs.data[0].childs.data.findIndex(
               y =>
                  eachNestedModifierInput.parentModifierOptionId ==
                  y.modifierOptionId
            )
         const xCombinedModifier = eachNestedModifierInput.data
            .map(z => z.cartItem)
            .reduce((acc, obj) => [...acc, ...obj.data], [])
         finalCartItem.childs.data[0].childs.data[foundModifierIndex].childs =
            {}
         finalCartItem.childs.data[0].childs.data[foundModifierIndex].childs[
            'data'
         ] = xCombinedModifier
      })
   }

   return finalCartItem
}
