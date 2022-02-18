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
import { CartContext, useUser } from '../../context'
import {
   EmptyCart,
   PaymentIcon,
   ChevronIcon,
   LeftArrowIcon,
} from '../../assets/icons'
import { UserInfo, UserType, Tunnel } from '../../components'
import { useConfig } from '../../lib'
import classNames from 'classnames'
import { formatCurrency, isClient } from '../../utils'
import { useRouter } from 'next/router'

export const OnDemandCart = () => {
   const { cartState, combinedCartItems, isFinalCartLoading, storedCartId } =
      React.useContext(CartContext)
   const { isAuthenticated, userType } = useUser()

   if (isFinalCartLoading)
      return (
         <>
            <CartPageHeader />
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
            <CartPageHeader />
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
            <CartPageHeader />
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
   const isDisabled =
      !cartState.cart?.customerInfo?.customerFirstName ||
      !cartState.cart?.customerInfo?.customerLastName ||
      !cartState.cart?.customerInfo?.customerPhone
   const isSmallerDevice = isClient && window.innerWidth < 768
   console.log('isDisabled : ', isDisabled, isSmallerDevice)
   return (
      <>
         <CartPageHeader />
         <div className="hern-on-demand-cart-section">
            <div>
               <div className="hern-on-demand-cart-section__left">
                  <UserInfo cart={cartState.cart} />
                  {isSmallerDevice ? (
                     isDisabled ? null : (
                        <React.Fragment key="smaller-device">
                           <Fulfillment cart={cartState.cart} />
                           <PaymentSection />
                        </React.Fragment>
                     )
                  ) : (
                     <React.Fragment key="large-device">
                        <Fulfillment cart={cartState.cart} />
                        <PaymentSection />
                     </React.Fragment>
                  )}
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
   const [isTunnelOpen, setIsTunnelOpen] = React.useState(false)
   const isDisabled =
      !cartState?.cart.fulfillmentInfo ||
      !cartState.cart?.customerInfo?.customerFirstName ||
      !cartState.cart?.customerInfo?.customerLastName ||
      !cartState.cart?.customerInfo?.customerPhone
   console.log('first', cartState)
   const isSmallerDevice = isClient && window.innerWidth < 768

   return (
      <>
         {!isSmallerDevice && (
            <div className="hern-on-demand-cart__payment-section__content">
               <div
                  className={classNames(
                     'hern-on-demand-cart__payment-section__content__header',
                     {
                        'hern-on-demand-cart__payment-section__content__header--open':
                           open,
                     },
                     {
                        'hern-on-demand-cart__payment-section__content__header--disabled':
                           isDisabled,
                     }
                  )}
               >
                  <div>
                     <span className="hern-payment-icon-shawdow">
                        <PaymentIcon
                           color="rgba(64, 64, 64, 0.6)"
                           width={20}
                           height={20}
                        />
                     </span>
                     &nbsp; &nbsp;
                     <h3>Payment</h3>
                  </div>
                  <span
                     onClick={() => !isDisabled && setOpen(!open)}
                     role="button"
                  >
                     <ChevronIcon
                        direction={open ? 'down' : 'right'}
                        color="rgba(64, 64, 64, 0.6)"
                        width={16}
                        height={16}
                     />
                  </span>
               </div>

               {open && !isDisabled && (
                  <>
                     {isAuthenticated && (
                        <WalletAmount cart={cartState.cart} version={2} />
                     )}
                     <PaymentOptionsRenderer
                        cartId={cartState?.cart?.id}
                        setPaymentTunnelOpen={setOpen}
                     />
                  </>
               )}
            </div>
         )}

         {isSmallerDevice && !isDisabled && (
            <>
               <button
                  className="hern-cart__make-payment-btn"
                  onClick={() => setIsTunnelOpen(true)}
               >
                  Make Payment{' '}
                  {`(${formatCurrency(
                     cartState?.cart?.cartOwnerBilling?.balanceToPay
                  )})`}
               </button>
               <Tunnel.Bottom
                  title={
                     <div className="hern-on-demand-cart__payment-section__header--tunnel">
                        <PaymentIcon width={20} height={22} />
                        <span className="hern-user-info__heading">Payment</span>
                     </div>
                  }
                  visible={isTunnelOpen}
                  className="hern-on-demand-cart__payment-section__content--tunnel"
                  onClose={() => setIsTunnelOpen(false)}
               >
                  {isAuthenticated && (
                     <div className="hern-ondemand-cart__left-card">
                        <WalletAmount cart={cartState.cart} version={2} />
                     </div>
                  )}
                  <PaymentOptionsRenderer
                     cartId={cartState?.cart?.id}
                     setPaymentTunnelOpen={setIsTunnelOpen}
                  />
               </Tunnel.Bottom>
            </>
         )}
      </>
   )
}

const CartPageHeader = () => {
   const {
      BrandName: { value: showBrandName } = {},
      BrandLogo: { value: showBrandLogo } = {},
      brandName: { value: brandName } = {},
      brandLogo: { value: logo } = {},
   } = useConfig('brand').configOf('Brand Info')
   const router = useRouter()
   return (
      <header className="hern-cart-page__header">
         <div>
            <a
               style={{ display: 'flex', alignItems: 'center' }}
               onClick={() => router.back()}
            >
               <LeftArrowIcon /> &nbsp;&nbsp;
            </a>

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
