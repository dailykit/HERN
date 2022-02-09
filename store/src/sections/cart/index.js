import React from 'react'
import { isEmpty } from 'lodash'
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
import { EmptyCart, PaymentIcon, LeftArrowIcon } from '../../assets/icons'
import { UserInfo, UserType, Tunnel } from '../../components'
import { useConfig } from '../../lib'

export const OnDemandCart = () => {
   const { cartState, combinedCartItems, isFinalCartLoading, storedCartId } =
      React.useContext(CartContext)
   const { isAuthenticated, userType, isLoading } = useUser()
   const { onDemandMenu } = React.useContext(onDemandMenuContext)
   const { isMenuLoading } = onDemandMenu
   if (isFinalCartLoading || isMenuLoading)
      return (
         <>
            <CarPageHeader />
            <Loader type="cart-loading" />
         </>
      )

   if (
      storedCartId === null ||
      isEmpty(cartState?.cart) ||
      combinedCartItems === null ||
      combinedCartItems?.length === 0
   ) {
      return (
         <>
            <CarPageHeader />
            <div className="hern-cart-empty-cart">
               <EmptyCart />
               <span>Oops! Your cart is empty </span>
               <Button className="hern-cart-go-to-menu-btn" onClick={() => {}}>
                  <Link href="/order">GO TO MENU</Link>
               </Button>
            </div>
         </>
      )
   }
   if (!isAuthenticated && userType !== 'guest') {
      return (
         <>
            <CarPageHeader />
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
         </>
      )
   }
   return (
      <>
         <CarPageHeader />
         <div className="hern-on-demand-cart-section">
            <div>
               <div className="hern-on-demand-cart-section__left">
                  <UserInfo cart={cartState.cart} />
                  <Fulfillment cart={cartState.cart} />
                  <PaymentSection />
               </div>
               <div className="hern-on-demand-cart-section__right">
                  <CartDetails />
               </div>
            </div>
         </div>
      </>
   )
}
const PaymentSection = () => {
   const { isAuthenticated } = useUser()
   const { cartState } = React.useContext(CartContext)
   const [open, setOpen] = React.useState(false)

   return (
      <>
         {!open && (
            <button
               className="hern-make-payment__btn"
               onClick={() => setOpen(true)}
            >
               Make Payment
            </button>
         )}
         <div className="hern-ondemand-cart__left-card">
            <div className="hern-on-demand-cart__payment-section__content">
               <div className="hern-on-demand-cart__payment-section__header">
                  <PaymentIcon width={20} height={22} />
                  <span className="hern-user-info__heading">Payment</span>
               </div>
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
         <Tunnel.Bottom
            title={
               <div className="hern-on-demand-cart__payment-section__header--tunnel">
                  <PaymentIcon width={20} height={22} />
                  <span className="hern-user-info__heading">Payment</span>
               </div>
            }
            visible={open}
            className="hern-on-demand-cart__payment-section__content--tunnel"
            onClose={() => setOpen(false)}
         >
            {isAuthenticated && (
               <div className="hern-ondemand-cart__left-card">
                  <WalletAmount cart={cartState.cart} version={2} />
               </div>
            )}
            <PaymentOptionsRenderer
               cartId={cartState?.cart?.id}
               setPaymentTunnelOpen={setOpen}
            />
         </Tunnel.Bottom>
      </>
   )
}

const CarPageHeader = () => {
   const {
      BrandName: { value: showBrandName } = {},
      BrandLogo: { value: showBrandLogo } = {},
      brandName: { value: brandName } = {},
      brandLogo: { value: logo } = {},
   } = useConfig('brand').configOf('Brand Info')

   return (
      <header className="hern-cart-page__header">
         <div>
            <LeftArrowIcon /> &nbsp;&nbsp;
            <span>Cart</span>
         </div>
         <div className="hern-cart-page__header-logo">
            {showBrandLogo && logo && <img src={logo} alt={brandName} />}
            &nbsp;&nbsp;
            {showBrandName && brandName && <span>{brandName}</span>}
         </div>
      </header>
   )
}
