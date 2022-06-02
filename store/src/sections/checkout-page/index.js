import React, { useState } from 'react'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../lib'
import * as Icon from '../../assets/icons'
import OrderInfo from '../../sections/OrderInfo'
import { OnDemandCart } from '../cart'
import {
   isClient,
   formatCurrency,
   getRoute,
   useQueryParams,
   get_env,
   setThemeVariable,
   normalizeAddress,
} from '../../utils'
import {
   Loader,
   Button,
   HelperBar,
   PaymentOptionsRenderer,
   UserInfo,
   Tunnel,
} from '../../components'
import {
   // usePayment,
   ProfileSection,
   PaymentProvider,
   // PaymentSection,
} from '../../sections/checkout'
import { useUser, useCart, useTranslation } from '../../context'
import * as QUERIES from '../../graphql'
import { isEmpty } from 'lodash'
import { EmptyCart } from '../../assets/icons'
import Link from 'next/link'
import classNames from 'classnames'
import moment from 'moment'

export const Checkout = props => {
   const router = useRouter()
   const { id } = router.query
   const { isAuthenticated, isLoading, user } = useUser()

   const { cartState, isFinalCartLoading } = useCart()
   const { addToast } = useToasts()
   const { t } = useTranslation()
   const authTabRef = React.useRef()
   const { configOf } = useConfig()
   const [otpPageUrl, setOtpPageUrl] = React.useState('')
   const [isOverlayOpen, toggleOverlay] = React.useState(false)
   const [overlayMessage, setOverlayMessage] = React.useState('')
   const [loading, setLoading] = React.useState(true)
   const {
      error,
      data: { cart = { paymentStatus: '', transactionRemark: {} } } = {},
   } = useSubscription(QUERIES.CART_SUBSCRIPTION, {
      skip: isEmpty(id),
      variables: {
         id,
      },
      onSubscriptionData: () => {
         setLoading(false)
      },
   })

   const onOverlayClose = () => {
      setOtpPageUrl('')
      setOverlayMessage('We are processing your payment.')
      toggleOverlay(false)
   }

   const theme = configOf('theme-color', 'Visual')

   React.useEffect(() => {
      if (!isAuthenticated && !isLoading && cart?.source === 'subscription') {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/select-plan'))
      }
   }, [isAuthenticated, isLoading])

   React.useEffect(() => {
      if (!isEmpty(cartState) && cartState?.cart?.id) {
         setLoading(false)
      }
   }, [cartState?.cart?.id])

   if (
      isClient &&
      !new URLSearchParams(location.search).get('id') &&
      cart?.source === 'subscription'
   ) {
      return (
         // <Main>
         //    <div tw="pt-4 w-full">
         //       <HelperBar>
         //          <HelperBar.Title>
         //             Oh no! Looks like you've wandered on an unknown path, let's
         //             get you to home.
         //          </HelperBar.Title>
         //          <HelperBar.Button onClick={() => router.push('/')}>
         //             Go to Home
         //          </HelperBar.Button>
         //       </HelperBar>
         //    </div>
         // </Main>
         <div className="hern-cart-empty-cart">
            <EmptyCart />
            <span>Oops! Your cart is empty </span>
            <Button className="hern-cart-go-to-menu-btn" onClick={() => {}}>
               <Link href="/order">GO TO MENU</Link>
            </Button>
         </div>
      )
   }
   if (error) {
      setLoading(false)
      return (
         <Main>
            <div tw="pt-4 w-full">
               <HelperBar type="danger">
                  <HelperBar.SubTitle>
                     Looks like there was an issue fetching details, please
                     refresh the page!
                  </HelperBar.SubTitle>
               </HelperBar>
            </div>
         </Main>
      )
   }
   if (isEmpty(cart) && cart?.source === 'subscription') {
      return (
         <Main>
            <div tw="pt-4 w-full">
               <HelperBar type="info">
                  <HelperBar.Title>
                     Looks like the page you're requesting is not available
                     anymore, let's get you to home.
                  </HelperBar.Title>
                  <HelperBar.Button
                     onClick={() =>
                        (window.location.href =
                           get_env('BASE_BRAND_URL') + getRoute('/'))
                     }
                  >
                     Go to Home
                  </HelperBar.Button>
               </HelperBar>
            </div>
         </Main>
      )
   }
   if (id === 'undefined') {
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

   if (loading) return <Loader inline />
   return (
      <>
         {cart?.source === 'subscription' ? (
            <>
               {router.pathname === '/[brand]/checkout' && <CartPageHeader />}
               <div className="hern-subscription-checkout hern-on-demand-cart-section">
                  <div>
                     <div className="hern-on-demand-cart-section__left">
                        <UserInfo cart={cart} />
                        <FulfillmentAddress cart={cart} />
                        <PaymentSection cart={cart} />
                     </div>
                     <div className="hern-on-demand-cart-section__right">
                        <OrderInfo cart={cart} showFulfillment={false} />
                     </div>
                  </div>
               </div>
            </>
         ) : (
            <OnDemandCart config={props.config} />
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
               <Icon.LeftArrowIcon /> &nbsp;&nbsp;
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
const PaymentSection = ({ cart }) => {
   const [open, setOpen] = React.useState(false)
   console.log('cart', cart)
   const isDisabled =
      !cart?.customerInfo?.customerFirstName?.length ||
      !cart?.customerInfo?.customerLastName?.length ||
      !cart?.customerInfo?.customerPhone?.length
   const isSmallerDevice = isClient && window.innerWidth < 768
   const { t } = useTranslation()
   const [isTunnelOpen, setIsTunnelOpen] = React.useState(false)
   console.log(
      'cart',
      cart?.customerInfo?.customerFirstName,
      cart?.customerInfo?.customerLastName
   )
   React.useEffect(() => {
      if (!isDisabled) {
         setOpen(true)
      }
   }, [isDisabled])

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
                        <Icon.PaymentIcon
                           color="rgba(64, 64, 64, 0.6)"
                           width={20}
                           height={20}
                        />
                     </span>
                     &nbsp; &nbsp;
                     <h3>{t('Payment')}</h3>
                  </div>
                  <span role="button">
                     <Icon.ChevronIcon
                        direction={open ? 'down' : 'right'}
                        color="rgba(64, 64, 64, 0.6)"
                        width={16}
                        height={16}
                     />
                  </span>
               </div>

               {open && (
                  <>
                     {!isEmpty(cart) && (
                        <PaymentOptionsRenderer cartId={cart?.id} />
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
                  {`(${formatCurrency(cart?.cartOwnerBilling?.totalToPay)})`}
               </button>
               <Tunnel.Bottom
                  title={
                     <div className="hern-on-demand-cart__payment-section__header--tunnel">
                        <Icon.PaymentIcon width={20} height={22} />
                        <span className="hern-user-info__heading">Payment</span>
                     </div>
                  }
                  visible={isTunnelOpen}
                  className="hern-on-demand-cart__payment-section__content--tunnel"
                  onClose={() => setIsTunnelOpen(false)}
               >
                  <PaymentOptionsRenderer cartId={cart?.id} />
               </Tunnel.Bottom>
            </>
         )}
      </>
   )
}
const FulfillmentAddress = ({ cart }) => {
   const [isOpen, setIsOpen] = React.useState(true)
   const { t } = useTranslation()
   React.useEffect(() => {
      const elem =
         isClient && document.querySelector('.hern-fulfillment-address')
      if (elem) {
         setThemeVariable(
            '--user-info-section-bottom',
            elem.clientHeight + 50 + 'px'
         )
      }
   }, [isOpen])
   React.useEffect(() => {
      const isSmallerDevice = isClient && window.innerWidth < 768
      if (isSmallerDevice) {
         setIsOpen(false)
      }
   }, [])

   return (
      <section className="hern-fulfillment-address">
         <h2
            onClick={() => setIsOpen(!isOpen)}
            className="hern-fulfillment-address__heading"
            style={{ marginBottom: isOpen ? '16px' : '0px' }}
         >
            <Icon.LocationIcon size={18} /> &nbsp;&nbsp; {t('Fulfillment')}
            <span role="button">
               <Icon.ChevronIcon
                  direction={isOpen ? 'down' : 'right'}
                  color="rgba(64, 64, 64, 0.6)"
                  width={16}
                  height={16}
               />
            </span>
         </h2>
         {isOpen && (
            <>
               {cart?.fulfillmentInfo?.type?.includes('DELIVERY') ? (
                  <div className="hern-fulfillment-address__delivery">
                     <h3>Delivery</h3>
                     <p>
                        <span>{t('Your box will be delivered on')}</span>{' '}
                        <span>
                           {moment(cart?.fulfillmentInfo?.slot?.from).format(
                              'MMM D'
                           )}
                           &nbsp;<span>{t('between')}</span>{' '}
                           {moment(cart?.fulfillmentInfo?.slot?.from).format(
                              'hh:mm A'
                           )}
                           &nbsp;-&nbsp;
                           {moment(cart?.fulfillmentInfo?.slot?.to).format(
                              'hh:mm A'
                           )}
                        </span>{' '}
                        <span>{t('at')}</span>{' '}
                        <span>{normalizeAddress(cart?.address)}</span>
                     </p>
                  </div>
               ) : (
                  <div className="hern-fulfillment-address__pickup">
                     <h3>Pickup</h3>
                     <p>
                        <span>{t('Pickup your box in between')}</span>
                        {moment(cart?.fulfillmentInfo?.slot?.from).format(
                           'MMM D'
                        )}
                        ,{' '}
                        {moment(cart?.fulfillmentInfo?.slot?.from).format(
                           'hh:mm A'
                        )}{' '}
                        -{' '}
                        {moment(cart?.fulfillmentInfo?.slot?.to).format(
                           'hh:mm A'
                        )}{' '}
                        <span>{t('from')}</span>{' '}
                        {normalizeAddress(cart?.fulfillmentInfo?.address)}
                     </p>
                  </div>
               )}
            </>
         )}
      </section>
   )
}
