import React from 'react'
import { CartDetails } from './CartDetails'
import {
   Fulfillment,
   Loader,
   Button,
   PaymentOptionsRenderer,
   WalletAmount,
} from '../../components'
import { CartContext, onDemandMenuContext, useUser } from '../../context'
import { EmptyCart, PaymentIcon } from '../../assets/icons'
import Link from 'next/link'
import { UserInfo, UserType } from '../../components'
import { isEmpty } from 'lodash'

export const OnDemandCart = () => {
   const { cartState, combinedCartItems, isFinalCartLoading, storedCartId } =
      React.useContext(CartContext)
   const { isAuthenticated, userType, isLoading } = useUser()
   const { onDemandMenu } = React.useContext(onDemandMenuContext)
   const { isMenuLoading } = onDemandMenu

   if (isFinalCartLoading || isMenuLoading)
      return <Loader type="cart-loading" />

   if (
      storedCartId === null ||
      isEmpty(cartState?.cart) ||
      combinedCartItems === null ||
      combinedCartItems?.length === 0
   ) {
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
   if (!isAuthenticated && userType !== 'guest') {
      return (
         <div className="hern-on-demand-cart-section">
            <div>
               <div className="hern-on-demand-cart-section__left">
                  <UserType />
               </div>
               <div className="hern-on-demand-cart-section__right">
                  <CartDetails />
               </div>
            </div>
         </div>
      )
   }
   return (
      <div className="hern-on-demand-cart-section">
         <div>
            <div className="hern-on-demand-cart-section__left">
               <div className="hern-ondemand-cart__left-card">
                  <UserInfo cart={cartState.cart} />
               </div>
               <div className="hern-ondemand-cart__left-card">
                  <Fulfillment cart={cartState.cart} />
               </div>
               <div className="hern-ondemand-cart__left-card">
                  {/* TODO:Should be fixed */}
                  {isAuthenticated && (
                     <div className="hern-ondemand-cart__left-card">
                        <WalletAmount cart={cartState.cart} version={2} />
                     </div>
                  )}
                  <div tw="p-4">
                     <div style={{ display: 'flex', alignItems: 'center' }}>
                        <PaymentIcon />
                        <span className="hern-user-info__heading">Payment</span>
                     </div>
                     <PaymentOptionsRenderer cartId={cartState?.cart?.id} />
                  </div>
               </div>
            </div>
            <div className="hern-on-demand-cart-section__right">
               <CartDetails />
            </div>
         </div>
      </div>
   )
}
