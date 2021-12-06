import { Col, Layout, Row } from 'antd'
import React, { useState } from 'react'
import {
   ArrowLeftIconBG,
   DeleteIcon,
   DownVector,
   EditIcon,
   EmptyCart,
   UpVector,
} from '../../assets/icons'
import { useTranslation, CartContext } from '../../context'
import { KioskCounterButton } from './component'
import { formatCurrency } from '../../utils'
import { PRODUCTS } from '../../graphql'
import { useConfig } from '../../lib'
import { KioskModifier } from './component'
import { useLazyQuery, useQuery } from '@apollo/react-hooks'

const { Header, Content, Footer } = Layout

export const KioskCart = props => {
   //context
   const { cartState, methods, addToCart } = React.useContext(CartContext)
   const { cart } = cartState
   const { config, combinedCartItems, setCurrentPage } = props
   const { t } = useTranslation()

   console.log('combinedCartItems', combinedCartItems)

   //remove cartItem or cartItems
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
   if (combinedCartItems === null || combinedCartItems.length === 0) {
      return <p>No cart available</p>
   }
   return (
      <Layout style={{ height: '100%' }}>
         <Header className="hern-kiosk__cart-section-header">
            <Row className="hern-kiosk__cart-section-header-row">
               <Col span={4}>
                  <ArrowLeftIconBG
                     bgColor={config.kioskSettings.theme.primaryColor.value}
                     onClick={() => {
                        setCurrentPage('menuPage')
                     }}
                  />
               </Col>
               <Col
                  span={16}
                  className="hern-kiosk__cart-section-checkout-text"
               >
                  <span>{t('CHECKOUT')}</span>
               </Col>
               <Col
                  span={4}
                  className="hern-kiosk__cart-section-see-more-text"
                  style={{
                     color: config.kioskSettings.theme.primaryColor.value,
                  }}
               >
                  <span>{t('SEE MENU')}</span>
               </Col>
            </Row>
         </Header>
         {combinedCartItems.length === 0 && (
            <div className="hern-cart-empty-cart">
               <EmptyCart width={558} height={480} />
               <span>{t('Oops! Your cart is empty')} </span>
               <span
                  onClick={() => {
                     setCurrentPage('menuPage')
                  }}
                  style={{
                     color: `${config.kioskSettings.theme.primaryColor.value}`,
                  }}
               >
                  {t('GO TO MENU')}
               </span>
            </div>
         )}
         {combinedCartItems.length > 0 && (
            <>
               <Content style={{ backgroundColor: '#ffffff' }}>
                  <div className="hern-kiosk__cart-cards-container">
                     <div className="hern-kiosk__cart-cards-container-header">
                        <span>{t('REVIEW ORDER')}</span>
                        <span
                           style={{
                              color: `${config.kioskSettings.theme.primaryColor.value}`,
                              cursor: 'pointer',
                           }}
                           onClick={() => {
                              const cartItemsIds = combinedCartItems
                                 .map(each => each.ids)
                                 .flat()
                              removeCartItems(cartItemsIds)
                           }}
                        >
                           {t('CLEAR CART')}
                        </span>
                     </div>
                     <div className="hern-kiosk__cart-cards">
                        {combinedCartItems.map((product, index) => {
                           return (
                              <CartCard
                                 config={config}
                                 productData={product}
                                 removeCartItems={removeCartItems}
                              />
                           )
                        })}
                     </div>
                  </div>
               </Content>
               <Footer className="hern-kiosk__cart-page-footer">
                  <Layout>
                     <Header className="hern-kiosk__cart-page-offer">
                        Offers
                     </Header>
                     <Content className="hern-kiosk__cart-page-price-detail">
                        <div className="hern-kiosk-cart-bill-details">
                           <span>BILL DETAILS</span>
                           <ul className="hern-kiosk-cart-bill-details-list">
                              <li>
                                 <span style={{ fontWeight: 'bold' }}>
                                    {cart.billing.itemTotal.label}
                                 </span>
                                 <span style={{ fontWeight: 'bold' }}>
                                    {formatCurrency(
                                       cart.billing.itemTotal.value || 0
                                    )}
                                 </span>
                              </li>
                              <li>
                                 <span>{cart.billing.deliveryPrice.label}</span>
                                 <span>
                                    {formatCurrency(
                                       cart.billing.deliveryPrice.value || 0
                                    )}
                                 </span>
                              </li>
                              <li>
                                 <span>{cart.billing.tax.label}</span>
                                 <span>
                                    {formatCurrency(
                                       cart.billing.tax.value || 0
                                    )}
                                 </span>
                              </li>
                              <li>
                                 <span>{cart.billing.discount.label}</span>
                                 <span>
                                    {formatCurrency(
                                       cart.billing.discount.value || 0
                                    )}
                                 </span>
                              </li>
                           </ul>
                        </div>
                     </Content>
                     <Footer className="hern-kiosk__cart-page-proceed-to-checkout">
                        Procced
                     </Footer>
                  </Layout>
               </Footer>
            </>
         )}
      </Layout>
   )
}

const CartCard = props => {
   const { config, productData, removeCartItems } = props
   const { brand, isConfigLoading } = useConfig()

   const [modifyProductId, setModifyProductId] = useState(null)
   const [modifyProduct, setModifyProduct] = useState(null)
   const [modifierType, setModifierType] = useState(null)
   const [cartDetailSelectedProduct, setCartDetailSelectedProduct] =
      useState(null)
   const [showAdditionalDetailsOnCard, setShowAdditionalDetailsOnCard] =
      useState(false)

   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: 1000,
         },
      }),
      [brand]
   )

   //fetch product detail which to be increase or edit
   useQuery(PRODUCTS, {
      skip: !modifyProductId,
      variables: {
         ids: modifyProductId,
         priceArgs: argsForByLocation,
         discountArgs: argsForByLocation,
         defaultCartItemArgs: argsForByLocation,
         productOptionPriceArgs: argsForByLocation,
         productOptionDiscountArgs: argsForByLocation,
         productOptionCartItemArgs: argsForByLocation,
         modifierCategoryOptionPriceArgs: argsForByLocation,
         modifierCategoryOptionDiscountArgs: argsForByLocation,
         modifierCategoryOptionCartItemArgs: argsForByLocation,
      },
      onCompleted: data => {
         if (data) {
            setModifyProduct(data.products[0])
         }
      },
   })

   const onCloseModifier = () => {
      setModifyProduct(null)
      setModifyProductId(null)
   }
   return (
      <div className="hern-kiosk__cart-card">
         <img
            src={productData.image}
            alt="p-image"
            className="hern-kiosk__cart-card-p-image"
         />
         <div className="hern-kiosk__cart-card-p-mid">
            <div className="hern-kiosk__cart-card-p-details">
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span
                     className="hern-kiosk__cart-card-p-name"
                     style={{ color: '#5A5A5A' }}
                  >
                     {productData.name}
                  </span>{' '}
                  {showAdditionalDetailsOnCard ? (
                     <UpVector
                        style={{ marginLeft: '1em' }}
                        onClick={() => {
                           setShowAdditionalDetailsOnCard(
                              !showAdditionalDetailsOnCard
                           )
                        }}
                     />
                  ) : (
                     <DownVector
                        style={{ marginLeft: '1em' }}
                        onClick={() => {
                           setShowAdditionalDetailsOnCard(
                              !showAdditionalDetailsOnCard
                           )
                        }}
                     />
                  )}
               </div>
               {showAdditionalDetailsOnCard && (
                  <div className="hern-kiosk-cart-product-modifiers">
                     {/* <span className="hern-kiosk-cart-product-modifiers-heading">
                        Product Option:
                     </span> */}
                     <div className="hern-kiosk-cart-product-modifiers-product-option">
                        <span>
                           {productData.childs[0].productOption.label || 'N/A'}
                        </span>{' '}
                        <span>
                           {formatCurrency(productData.childs[0].price || 0)}
                        </span>
                     </div>
                     <div className="hern-kiosk-cart-product-modifiers-list">
                        {productData.childs[0].childs.some(
                           each => each.modifierOption
                        ) && (
                           <>
                              {/* <span className="hern-kiosk-cart-product-modifiers-heading">
                              Add ons:
                           </span> */}
                              <ul>
                                 {productData.childs.length > 0 &&
                                    productData.childs[0].childs.map(
                                       (modifier, index) =>
                                          modifier.modifierOption ? (
                                             <li key={index}>
                                                <span>
                                                   {
                                                      modifier.modifierOption
                                                         .name
                                                   }
                                                </span>
                                                <span>
                                                   {formatCurrency(
                                                      modifier.price || 0
                                                   )}
                                                </span>
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
            <KioskCounterButton
               config={config}
               quantity={productData.ids.length}
               onMinusClick={() => {
                  removeCartItems([productData.ids[productData.ids.length - 1]])
               }}
               onPlusClick={() => {
                  setModifierType('newItem')
                  setCartDetailSelectedProduct(productData)
                  setModifyProductId(productData.productId)
               }}
               style={{
                  border: '1px solid #0F6BB1',
                  width: '20em',
                  justifyContent: 'space-around',
               }}
            />
         </div>
         <div className="hern-kiosk__cart-card-actions">
            <div className="hern-kiosk__cart-card-action-buttons">
               <EditIcon
                  stroke={config.kioskSettings.theme.primaryColor.value}
                  style={{ cursor: 'pointer', margin: '0 .5em' }}
                  title="Edit"
                  size={50}
                  onClick={() => {
                     setModifierType('edit')
                     setCartDetailSelectedProduct(productData)
                     setModifyProductId(productData.productId)
                  }}
               />
               <DeleteIcon
                  stroke={config.kioskSettings.theme.primaryColor.value}
                  style={{ cursor: 'pointer', margin: '0 0 0 .5em' }}
                  title="Delete"
                  size={50}
                  onClick={() => {
                     removeCartItems(productData.ids)
                  }}
               />
            </div>
            <span
               className="hern-kiosk__cart-cards-price"
               style={{ color: '#5A5A5A' }}
            >
               {formatCurrency(productData.price)}
            </span>
         </div>
         {modifyProduct && (
            <KioskModifier
               config={config}
               onCloseModifier={onCloseModifier}
               productData={modifyProduct}
               forNewItem={Boolean(modifierType === 'newItem')}
               edit={Boolean(modifierType === 'edit')}
               productCartDetail={cartDetailSelectedProduct}
            />
         )}
      </div>
   )
}
