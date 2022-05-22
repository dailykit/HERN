import React from 'react'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import isEmpty from 'lodash/isEmpty'

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
import { useTranslation } from '../../../../context'

import { ChevronIcon } from '../../../../assets/icons/Chevron'

const BillingDetails = ({ isCheckout }) => {
   const router = useRouter()
   const { state } = useMenu()
   const { addToast } = useToasts()
   const { t } = useTranslation()
   const { configOf } = useConfig()
   const [open, toggle] = React.useState(false)
   const { cartOwnerBilling: billing = {} } =
      state?.occurenceCustomer?.cart || {}
   const { itemCountValid = false } =
      state?.occurenceCustomer?.validStatus || {}
   const { Coupons } = configOf('Coupons Availability', 'rewards')
   const { Wallet } = configOf('Wallet', 'rewards')
   const loyaltyPoint = configOf('Loyalty Points', 'rewards')['Loyalty Points']
   const couponsAllowed =
      Coupons?.areCouponsAvailable?.value ||
      Coupons?.areCouponsAvailable?.default ||
      false
   const walletAllowed =
      Wallet?.isWalletAvailable?.value ||
      Wallet?.isWalletAvailable?.default ||
      false
   const loyaltyPointsAllowed =
      loyaltyPoint?.IsLoyaltyPointsAvailable?.value ||
      loyaltyPoint?.IsLoyaltyPointsAvailable?.default ||
      false

   const payEarly = () => {
      if (state.occurenceCustomer?.betweenPause) {
         addToast(t('You have paused your plan.'), {
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
         {itemCountValid && !isEmpty(state?.occurenceCustomer?.cart) && (
            <>
               {couponsAllowed && (
                  <Coupon cart={state?.occurenceCustomer?.cart} />
               )}
               {walletAllowed && !isEmpty(state?.occurenceCustomer?.cart) && (
                  <WalletAmount cart={state?.occurenceCustomer?.cart} />
               )}
               {loyaltyPointsAllowed &&
                  !isEmpty(state?.occurenceCustomer?.cart) && (
                     <LoyaltyPoints cart={state?.occurenceCustomer?.cart} />
                  )}
            </>
         )}
         <header className="hern-cart-billing__header">
            <h4 className="hern-cart-billing__heading">
               <span> {t('Your Weekly Total:')} </span>
               <span className="hern-cart-billing__amount">
                  {itemCountValid ? formatCurrency(billing?.totalToPay) : 'N/A'}
               </span>
            </h4>
            {itemCountValid && <Toggle open={open} toggle={toggle} />}
         </header>
         {itemCountValid && open && <Billing billing={billing} />}
         {!isCheckout && itemCountValid && (
            <button
               className="hern-cart-billing__early-pay-btn"
               onClick={payEarly}
            >
               {t('EARLY PAY')}
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
            <ChevronIcon
               direction="down"
               color="#3F4441"
               width={12}
               height={6}
            />
         ) : (
            <ChevronIcon color="#3F4441" height={15} width={8} />
         )}
      </button>
   )
}
