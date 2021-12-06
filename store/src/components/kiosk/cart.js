import { Col, Layout, Row } from 'antd'
import React from 'react'
import { ArrowLeftIconBG, DeleteIcon, EditIcon } from '../../assets/icons'
import { useTranslation, CartContext } from '../../context'
import { KioskCounterButton } from './component'
import { formatCurrency } from '../../utils'
const { Header, Content, Footer } = Layout
export const KioskCart = props => {
   //context
   const { cartState, methods, addToCart } = React.useContext(CartContext)
   const { config, combinedCartItems } = props
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
         <Content>
            <div className="hern-kiosk__cart-cards-container">
               <div className="hern-kiosk__cart-cards-container-header">
                  <span>{t('REVIEW ORDER')}</span>
                  <span
                     style={{
                        color: `${config.kioskSettings.theme.primaryColor.value}`,
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
               <Header className="hern-kiosk__cart-page-offer">Offers</Header>
               <Content className="hern-kiosk__cart-page-price-detail">
                  Price
               </Content>
               <Footer className="hern-kiosk__cart-page-proceed-to-checkout">
                  Procced
               </Footer>
            </Layout>
         </Footer>
      </Layout>
   )
}

const CartCard = props => {
   const { config, productData, removeCartItems } = props

   return (
      <div className="hern-kiosk__cart-card">
         <img
            src={productData.image}
            alt="p-image"
            className="hern-kiosk__cart-card-p-image"
         />
         <div className="hern-kiosk__cart-card-p-mid">
            <div className="hern-kiosk__cart-card-p-details">
               <span className="hern-kiosk__cart-card-p-name">
                  {productData.name}
               </span>{' '}
               <div></div>
            </div>
            <KioskCounterButton
               config={config}
               quantity={productData.ids.length}
               onMinusClick={() => {
                  removeCartItems([productData.ids[productData.ids.length - 1]])
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
               />
               <DeleteIcon
                  stroke={config.kioskSettings.theme.primaryColor.value}
                  style={{ cursor: 'pointer', margin: '0 0 0 .5em' }}
                  title="Delete"
                  size={50}
               />
            </div>
            <span className="hern-kiosk__cart-cards-price">
               {formatCurrency(productData.price)}
            </span>
         </div>
      </div>
   )
}
