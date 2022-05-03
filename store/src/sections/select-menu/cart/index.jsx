import React from 'react'
import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import classNames from 'classnames'

import Billing from './billing'
import Products from './products'
import { useMenu } from '../state'
import OrderInfo from '../../OrderInfo'
import Fulfillment from './fulfillment'
import PaymentCard from './PaymentCard'
import { useConfig } from '../../../lib'
import { useTranslation, useUser } from '../../../context'
import { getRoute, isClient } from '../../../utils'
import { Button } from '../../../components'
import { CloseIcon } from '../../../assets/icons'
import { UPDATE_BRAND_CUSTOMER } from '../../../graphql'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const CartPanel = ({ noSkip, isCheckout }) => {
   const router = useRouter()
   const { user } = useUser()
   const { state } = useMenu()
   const { t } = useTranslation()
   const { configOf } = useConfig()
   const [updateBrandCustomer] = useMutation(UPDATE_BRAND_CUSTOMER, {
      skip: !isCheckout || !user?.brandCustomerId,
      onCompleted: ({ updateBrandCustomer }) => {
         // fb pixel event when checkout is proceeded
         ReactPixel.track('InitiateCheckout', updateBrandCustomer)
      },
      onError: error => {
         console.log('UPDATE BRAND CUSTOMER -> ERROR -> ', error)
      },
   })
   const [isCartPanelOpen, setIsCartPanelOpen] = React.useState(false)

   const onSubmit = async () => {
      try {
         if (isCheckout) {
            await updateBrandCustomer({
               variables: {
                  id: user?.brandCustomerId,
                  _set: { subscriptionOnboardStatus: 'CHECKOUT' },
               },
            })

            const skipList = new URL(location.href).searchParams.get('previous')
            if (skipList && skipList.split(',').length > 0) {
               isClient && localStorage.setItem('skipList', skipList.split(','))
            }
         }
         router.push(
            getRoute(
               `/get-started/checkout/?id=${state.occurenceCustomer?.cart?.id}`
            )
         )
      } catch (error) {
         console.log('SKIP CARTS -> ERROR -> ', error)
      }
   }

   const isOrderPending = ['ORDER_PENDING'].includes(
      state?.occurenceCustomer?.cart?.status
   )
   const theme = configOf('theme-color', 'Visual')

   return (
      <>
         <CartBar setIsCartPanelOpen={setIsCartPanelOpen} />
         <div
            isCartPanelOpen={isCartPanelOpen}
            className={`hern-select-menu__cart__cart-panel${
               isCartPanelOpen ? '' : '--hidden'
            }`}
         >
            <header className="hern-select-menu__cart__cart-panel__header">
               <h1 className="hern-select-menu__cart__cart-panel__header__title">
                  {t('Cart Summary')}
               </h1>
               <button
                  className="hern-select-menu__cart__cart-panel__header__close-icon"
                  onClick={() => setIsCartPanelOpen(false)}
               >
                  <CloseIcon
                     size={16}
                     stroke="currentColor"
                     color="rgba(52, 211, 153,1)"
                  />
               </button>
            </header>
            {isOrderPending ? (
               <OrderInfo
                  cart={state.occurenceCustomer?.cart}
                  showViewOrderButton
               />
            ) : (
               <>
                  {/* Products */}
                  <Products noSkip={noSkip} isCheckout={isCheckout} />
                  {/* Fulfilment Mode */}
                  <Fulfillment />
                  {/* Payment */}
                  {/* <PaymentCard /> */}
                  {/* Billing Details */}
                  <Billing isCheckout={isCheckout} />
                  {/* Checkout */}
                  {isCheckout && (
                     <Button
                        className="hern-select-menu__cart__cart-panel__checkout-btn"
                        bg={theme?.accent}
                        onClick={onSubmit}
                        disabled={
                           !state?.week?.isValid ||
                           !state?.occurenceCustomer?.validStatus
                              ?.itemCountValid
                        }
                     >
                        {t('PROCEED TO CHECKOUT')}
                     </Button>
                  )}
               </>
            )}
         </div>
      </>
   )
}

const CartBar = ({ setIsCartPanelOpen }) => {
   const { state } = useMenu()
   const { user } = useUser()
   const { t } = useTranslation()
   return (
      <section
         className="hern-select-menu__cart__cart-bar"
         onClick={() => setIsCartPanelOpen(true)}
      >
         <section>
            <h4 className="hern-select-menu__cart__cart-bar__count">
               <span>{t('Cart')}</span>{' '}
               {state?.occurenceCustomer?.validStatus?.addedProductsCount}/
               {user?.subscription?.recipes?.count}
            </h4>
            <h4 className="hern-select-menu__cart__cart-bar__summary">
               <span>{t('View full summary')}</span> <span>&#8657;</span>
            </h4>
         </section>
         <section className="hern-select-menu__cart__cart-bar__saving-status">
            {state.cartState === 'SAVING' && (
               <span className="hern-select-menu__cart__cart-bar__saving">
                  {t('SAVING')}
               </span>
            )}
            {state.cartState === 'SAVED' && (
               <span className="hern-select-menu__cart__cart-bar__saved">
                  {t('SAVED')}
               </span>
            )}
         </section>
      </section>
   )
}
