import React from 'react'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'

import { useMenu } from '../../state'
import { formatCurrency, getRoute } from '../../../../utils'
import {
   Billing,
   Coupon,
   LoyaltyPoints,
   WalletAmount,
} from '../../../../components'
import { useConfig } from '../../../../lib'
import { PlusIcon, MinusIcon } from '../../../../assets/icons'

const BillingDetails = ({ isCheckout }) => {
   const router = useRouter()
   const { state } = useMenu()
   const { addToast } = useToasts()
   const { configOf } = useConfig()
   const [open, toggle] = React.useState(false)
   const { billingDetails: billing = {} } = state?.occurenceCustomer?.cart || {}
   const { itemCountValid = false } =
      state?.occurenceCustomer?.validStatus || {}

   const couponsAllowed = configOf('Coupons', 'rewards')?.isAvailable
   const walletAllowed = configOf('Wallet', 'rewards')?.isAvailable
   const loyaltyPointsAllowed = configOf(
      'Loyalty Points',
      'rewards'
   )?.isAvailable

   const payEarly = () => {
      if (state.occurenceCustomer?.betweenPause) {
         addToast('You have paused your plan.', {
            appearance: 'warning',
         })
         return
      }
      router.push(
         getRoute(`/checkout/?id=${state.occurenceCustomer?.cart?.id}`)
      )
   }

   return (
      <div>
         {itemCountValid && state?.occurenceCustomer?.cart && (
            <>
               {couponsAllowed && (
                  <Coupon cart={state?.occurenceCustomer?.cart} />
               )}
               {walletAllowed && (
                  <WalletAmount cart={state?.occurenceCustomer?.cart} />
               )}
               {loyaltyPointsAllowed && (
                  <LoyaltyPoints cart={state?.occurenceCustomer?.cart} />
               )}
            </>
         )}
         <header className="hern-cart-billing__header">
            <h4 className="hern-cart-billing__heading">
               Your Weekly Total:{' '}
               {itemCountValid
                  ? formatCurrency(billing?.totalPrice?.value)
                  : 'N/A'}
            </h4>
            {itemCountValid && <Toggle open={open} toggle={toggle} />}
         </header>
         {itemCountValid && open && <Billing billing={billing} />}
         {!isCheckout && itemCountValid && (
            <button
               className="hern-cart-billing__early-pay-btn"
               onClick={payEarly}
            >
               EARLY PAY
            </button>
         )}
      </div>
   )
}

export default BillingDetails

const Toggle = ({ open, toggle }) => {
   return (
      <button
         className="hern-cart-billing__toggle-btn"
         onClick={() => toggle(!open)}
      >
         {open ? (
            <MinusIcon
               color="rgba(4,120,87,1)"
               stroke="currentColor"
               size={18}
            />
         ) : (
            <PlusIcon
               color="rgba(4,120,87,1)"
               stroke="currentColor"
               size={18}
            />
         )}
      </button>
   )
}
