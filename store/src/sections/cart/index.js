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
   LanguageSwitch,
} from '../../components'
import { CartContext, useTranslation, useUser } from '../../context'
import {
   EmptyCart,
   PaymentIcon,
   ChevronIcon,
   LeftArrowIcon,
} from '../../assets/icons'
import { UserInfo, UserType, Tunnel } from '../../components'
import { useConfig } from '../../lib'
import classNames from 'classnames'
import {
   formatCurrency,
   isClient,
   setThemeVariable,
   getRoute,
} from '../../utils'
import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import * as QUERIES from '../../graphql'
import { useToasts } from 'react-toast-notifications'
import { usePayment } from '../../lib'

export const OnDemandCart = () => {
   const { cartState, combinedCartItems, isFinalCartLoading, storedCartId } =
      React.useContext(CartContext)

   const { isAuthenticated, userType } = useUser()
   const { locationId, dispatch } = useConfig()
   const { t } = useTranslation()

   React.useEffect(() => {
      if (!isFinalCartLoading) {
         const storeLocationId = localStorage.getItem('storeLocationId')
         if (storeLocationId && !locationId) {
            dispatch({
               type: 'SET_LOCATION_ID',
               payload: JSON.parse(storeLocationId),
            })
            const localUserLocation = JSON.parse(
               localStorage.getItem('userLocation')
            )

            dispatch({
               type: 'SET_USER_LOCATION',
               payload: { ...localUserLocation },
            })
            dispatch({
               type: 'SET_STORE_STATUS',
               payload: {
                  status: true,
                  message: 'Store available on your location.',
                  loading: false,
               },
            })
         } else {
            const localUserLocation = localStorage.getItem('userLocation')
            if (localUserLocation) {
               const localUserLocationParse = JSON.parse(localUserLocation)
               dispatch({
                  type: 'SET_USER_LOCATION',
                  payload: {
                     ...localUserLocationParse,
                  },
               })
               return
            }
         }
      }
   }, [isFinalCartLoading])
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
               <span>{t('Oops! Your cart is empty')} </span>
               <Link href="/order">
                  <a>
                     <Button
                        className="hern-cart-go-to-menu-btn"
                        onClick={() => {}}
                     >
                        {t('GO TO MENU')}
                     </Button>
                  </a>
               </Link>
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
   setThemeVariable(
      '--cart-section-height-sm',
      isSmallerDevice && isDisabled
         ? 'calc(100vh - 56px)'
         : 'calc(100vh - 200px)'
   )
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
   const { cartState, isCartValidByProductAvailability } =
      React.useContext(CartContext)
   const [open, setOpen] = React.useState(true)
   const [isTunnelOpen, setIsTunnelOpen] = React.useState(false)
   const isDisabled =
      !cartState?.cart.fulfillmentInfo ||
      !cartState.cart?.customerInfo?.customerFirstName ||
      !cartState.cart?.customerInfo?.customerLastName ||
      !cartState.cart?.customerInfo?.customerPhone ||
      !isCartValidByProductAvailability
   console.log('first', cartState)
   const isSmallerDevice = isClient && window.innerWidth < 768
   const { t } = useTranslation()
   const { addToast } = useToasts()
   const { initializePayment } = usePayment()

   // update cart mutation
   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onError: error => {
         console.log(error)
         addToast(error.message, { appearance: 'error' })
      },
   })

   const placeOrderHandler = async () => {
      initializePayment(cartState.cart.id)
      await updateCart({
         variables: {
            id: cartState.cart.id,
            _inc: { paymentRetryAttempt: 1 },
            _set: {},
         },
      })
   }

   return (
      <>
         {!isSmallerDevice && (
            <div className="hern-on-demand-cart__payment-section__content">
               <div
                  role="button"
                  onClick={() => !isDisabled && setOpen(!open)}
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
                     <h3>{t('Payment')}</h3>
                  </div>
                  <span role="button">
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
                     {cartState?.cart?.cartOwnerBilling?.balanceToPay > 0 ? (
                        <PaymentOptionsRenderer
                           cartId={cartState?.cart?.id}
                           setPaymentTunnelOpen={setOpen}
                        />
                     ) : (
                        <Button
                           className="hern-cart__place_order"
                           onClick={placeOrderHandler}
                        >
                           {t('Place Order')}
                        </Button>
                     )}
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
                  {t('Make Payment')}
                  {`(${formatCurrency(
                     cartState?.cart?.cartOwnerBilling?.totalToPay
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
                  {cartState?.cart?.cartOwnerBilling?.balanceToPay > 0 ? (
                     <PaymentOptionsRenderer
                        cartId={cartState?.cart?.id}
                        setPaymentTunnelOpen={setIsTunnelOpen}
                     />
                  ) : (
                     <button
                        className="hern-cart__make-payment-btn"
                        onClick={placeOrderHandler}
                     >
                        {t('Place Order')}
                     </button>
                  )}
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
   const { t } = useTranslation()
   return (
      <header className="hern-cart-page__header">
         <div>
            <a
               style={{ display: 'flex', alignItems: 'center' }}
               onClick={() => router.back()}
            >
               <LeftArrowIcon /> &nbsp;&nbsp;
            </a>
         </div>
         <div
            role="button"
            onClick={() => router.push(getRoute('/'))}
            className="hern-cart-page__header-logo"
         >
            {showBrandLogo && logo && <img src={logo} alt={brandName} />}
            &nbsp;&nbsp;
            {showBrandName && brandName && <span>{brandName}</span>}
         </div>
      </header>
   )
}
