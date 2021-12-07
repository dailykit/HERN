import { Button, Col, Layout, Modal, Row, Menu, Dropdown, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import {
   ArrowLeftIconBG,
   ArrowRightIcon,
   DeleteIcon,
   DownVector,
   EditIcon,
   EmptyCart,
   PaymentModeIcon,
   UpVector,
} from '../../assets/icons'
import { useTranslation, CartContext } from '../../context'
import { KioskCounterButton } from './component'
import { formatCurrency } from '../../utils'
import { PRODUCTS } from '../../graphql'
import { useConfig } from '../../lib'
import { KioskModifier } from './component'
import { useLazyQuery, useQuery } from '@apollo/react-hooks'
import KioskButton from './component/button'

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
   if (combinedCartItems === null) {
      return <p>No cart available</p>
   }
   return (
      <Layout style={{ height: '100%', overflowY: 'hidden' }}>
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
                  <span
                     onClick={() => {
                        setCurrentPage('menuPage')
                     }}
                  >
                     {t('SEE MENU')}
                  </span>
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
                        <CartPageFooter cart={cart} methods={methods} />
                        <KioskButton customClass="hern-kiosk__cart-place-order-btn">
                           <span className="hern-kiosk__cart-place-order-btn-total">
                              {formatCurrency(cart.billing.itemTotal.value)}
                           </span>
                           <span className="hern-kiosk__cart-place-order-btn-text">
                              {t('Place Order')}
                           </span>
                           <ArrowRightIcon
                              stroke={
                                 config.kioskSettings.theme.primaryColor.value
                              }
                           />
                        </KioskButton>
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
   const [showChooseIncreaseType, setShowChooseIncreaseType] = useState(false)

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
                  setShowChooseIncreaseType(true)
               }}
               style={{
                  border: '1px solid #0F6BB1',
                  width: '20em',
                  justifyContent: 'space-around',
               }}
            />
         </div>
         <Modal
            title="Repeat last used customization?"
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
                     setModifierType('newItem')
                     setCartDetailSelectedProduct(productData)
                     setModifyProductId(productData.productId)
                     setShowChooseIncreaseType(false)
                  }}
                  style={{
                     border: `2px solid ${config.kioskSettings.theme.secondaryColor.value}`,
                     background: 'transparent',
                     padding: '.1em 2em',
                  }}
               >
                  I'LL CHOOSE
               </KioskButton>
               <KioskButton style={{ padding: '.1em 2em' }}>
                  REPEAT LAST ONE
               </KioskButton>
            </div>
         </Modal>
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

const CartPageFooter = props => {
   const { cart, methods } = props
   const { t } = useTranslation()
   const [selectedMethod, setSelectedMethod] = useState(
      cart.paymentMethods.find(x => x.id === cart.toUseAvailablePaymentOptionId)
   )
   useEffect(() => {
      setSelectedMethod(
         cart.paymentMethods.find(
            x => x.id === cart.toUseAvailablePaymentOptionId
         )
      )
   }, [cart])
   const paymentMethods = (
      <Menu
         onClick={item => {
            const option = cart.paymentMethods.find(x => x.id === +item.key)
            // setSelectedMethod(option)
            methods.cart.update({
               variables: {
                  id: cart.id,
                  _set: {
                     toUseAvailablePaymentOptionId: option.id,
                  },
               },
            })
         }}
      >
         {cart.paymentMethods.map((eachMethod, index) => (
            <Menu.Item key={eachMethod.id}>
               <span>{eachMethod.label}</span>
            </Menu.Item>
         ))}
      </Menu>
   )
   return (
      <div className="hern-kiosk__cart-page-footer-footer">
         <Dropdown
            overlay={paymentMethods}
            trigger={['click']}
            placement="topCenter"
         >
            <div>
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PaymentModeIcon />
                  <span
                     style={{
                        margin: '0 .5em',
                        fontSize: '1.4em',
                        fontWeight: '500',
                     }}
                  >
                     {t('Payment Method')}
                  </span>
                  <UpVector size={20} />
               </div>
               <span className="hern-kiosk__cart-payment-method-label">
                  {selectedMethod?.label || 'Please choose payment method'}
               </span>
            </div>
         </Dropdown>
      </div>
   )
}
