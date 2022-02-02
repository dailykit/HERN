import React from 'react'
import { isEmpty } from 'lodash'
import classNames from 'classnames'
import Link from 'next/link'

import { CartDetails } from './CartDetails'
import {
   Fulfillment,
   Loader,
   Button,
   PaymentOptionsRenderer,
   WalletAmount,
} from '../../components'
import { CartContext, onDemandMenuContext, useUser } from '../../context'
import { CloseIcon, EmptyCart, PaymentIcon } from '../../assets/icons'
import { UserInfo, UserType } from '../../components'
import { isClient } from '../../utils'

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
               <PaymentSection />
            </div>
            <div className="hern-on-demand-cart-section__right">
               <CartDetails />
            </div>
         </div>
      </div>
   )
}
const PaymentSection = () => {
   const { isAuthenticated } = useUser()
   const { cartState } = React.useContext(CartContext)
   const [open, setOpen] = React.useState(false)

   React.useEffect(() => {
      if (open && isClient) {
         document.body.style.overflowY = 'hidden'
      } else {
         document.body.style.overflowY = 'auto'
      }
   }, [open])

   return (
      <div
         className={classNames(
            'hern-ondemand-cart__left-card',
            'hern-ondemand-cart__payment-section',
            { 'hern-ondemand-cart__payment-section--toggle': open }
         )}
      >
         <button onClick={() => setOpen(true)}>Make Payment</button>
         <div>
            <div className="hern-ondemand-cart__payment-section__header">
               <div>
                  <PaymentIcon width={20} height={22} />
                  <span className="hern-user-info__heading">Payment</span>
               </div>
               <button onClick={() => setOpen(false)}>
                  <CloseIcon stroke="rgba(64, 64, 64, 0.6)" />
               </button>
            </div>
            <div className="hern-on-demand-cart__payment-section__content">
               {isAuthenticated && (
                  <div className="hern-ondemand-cart__left-card">
                     <WalletAmount cart={cartState.cart} version={2} />
                  </div>
               )}
               <PaymentOptionsRenderer
                  cartId={cartState?.cart?.id}
                  setPaymentTunnelOpen={setOpen}
               />
            </div>
         </div>
      </div>
   )
}
