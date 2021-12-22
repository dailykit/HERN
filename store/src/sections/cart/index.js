import React from 'react'
import { Row, Col } from 'antd'
import tw from 'twin.macro'
import { CartDetails } from './CartDetails'
import {
   Fulfillment,
   LoyaltyPoints,
   Loader,
   Button,
   PaymentOptionsRenderer,
   Coupon,
   WalletAmount,
} from '../../components'
import { CartContext } from '../../context'
import { EmptyCart } from '../../assets/icons'
import Link from 'next/link'
import { UserInfo } from '../../components'

export const OnDemandCart = () => {
   const { cartState, combinedCartItems } = React.useContext(CartContext)

   if (combinedCartItems === null) {
      return <Loader />
   }
   if (cartState.cart == null || combinedCartItems.length === 0) {
      return (
         <div className="hern-cart-empty-cart">
            <EmptyCart />
            <span>Oops! Your cart is empty </span>
            <Button className="hern-cart-go-to-menu-btn" onClick={() => {}}>
               <Link href="/order">GO TO MENU</Link>
            </Button>
         </div>
      )
   }
   return (
      <Row>
         <Col span={16}>
            <div className="hern-ondemand-cart__left-card">
               <UserInfo cart={cartState.cart} />
            </div>
            <div className="hern-ondemand-cart__left-card">
               <Fulfillment />
            </div>
            <div className="hern-ondemand-cart__left-card">
               <Coupon cart={cartState.cart} />
            </div>
            <div className="hern-ondemand-cart__left-card">
               <LoyaltyPoints cart={cartState.cart} version={2} />
            </div>
            <div className="hern-ondemand-cart__left-card">
               <WalletAmount cart={cartState.cart} version={2} />
            </div>
            <div className="hern-ondemand-cart__left-card">
               <div tw="p-4">
                  <PaymentOptionsRenderer cartId={cartState?.cart?.id} />
               </div>
            </div>
         </Col>
         <Col span={8}>
            <CartDetails />
         </Col>
      </Row>
   )
}
