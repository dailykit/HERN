import React from 'react'
import tw from 'twin.macro'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'

import { useMenu } from '../../state'
import { SaveGhostButton } from '../styled'
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
         <header tw="mt-3 mb-3 h-10 flex items-center justify-between">
            <h4 tw="text-lg text-gray-700">
               Your Weekly Total:{' '}
               {itemCountValid
                  ? formatCurrency(billing?.totalPrice?.value)
                  : 'N/A'}
            </h4>
            {itemCountValid && <Toggle open={open} toggle={toggle} />}
         </header>
         {itemCountValid && open && <Billing billing={billing} />}
         {!isCheckout && itemCountValid && (
            <SaveGhostButton onClick={payEarly}>EARLY PAY</SaveGhostButton>
         )}
      </div>
   )
}

export default BillingDetails

const Toggle = ({ open, toggle }) => {
   return (
      <button
         onClick={() => toggle(!open)}
         tw="focus:outline-none border w-8 h-6 rounded-full flex items-center justify-center border-green-500"
      >
         {open ? (
            <MinusIcon tw="stroke-current text-green-700" size={18} />
         ) : (
            <PlusIcon tw="stroke-current text-green-700" size={18} />
         )}
      </button>
   )
}
