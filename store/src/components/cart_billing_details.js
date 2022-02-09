import React from 'react'

import { useUser } from '../context'
import { formatCurrency } from '../utils'

export const CartBillingDetails = ({ billing, tip }) => {
   const { user } = useUser()
   return (
      <div className="hern-cart-billing-details">
         <h3>Bill Details</h3>
         {billing && (
            <ul className="hern-cart-billing-details-list">
               <li>
                  <span>{billing.itemTotal.label}</span>
                  <span>{formatCurrency(billing.itemTotal.value || 0)}</span>
               </li>
               <li>
                  <span>{billing.deliveryPrice.label}</span>
                  {billing.deliveryPrice.value === 0 ? (
                     <span
                        style={{
                           color: 'var(--hern-accent)',
                           fontWeight: 'bold',
                        }}
                     >
                        free
                     </span>
                  ) : (
                     <span>
                        {formatCurrency(billing.deliveryPrice.value || 0)}
                     </span>
                  )}
               </li>
               <li>
                  <span>{billing.tax.label}</span>
                  <span>{formatCurrency(billing.tax.value || 0)}</span>
               </li>
               {billing.discount.value > 0 && (
                  <li>
                     <span>{billing.discount.label}</span>
                     <span>
                        - {formatCurrency(billing.discount.value || 0)}
                     </span>
                  </li>
               )}
               {user?.keycloakId && billing.loyaltyPointsUsed.value > 0 && (
                  <li>
                     <span>{billing.loyaltyPointsUsed.label}</span>
                     <span>{billing.loyaltyPointsUsed.value}</span>
                  </li>
               )}
               {user?.keycloakId && billing.walletAmountUsed.value > 0 && (
                  <li>
                     <span>{billing.walletAmountUsed.label}</span>
                     <span>{billing.walletAmountUsed.value}</span>
                  </li>
               )}
               {tip && tip !== 0 && (
                  <li>
                     <span>Tip</span>
                     <span>{formatCurrency(tip)}</span>
                  </li>
               )}
               <li className="hern-cart-billing-details-total-price">
                  <span>{billing.totalPrice.label}</span>
                  <span>{formatCurrency(billing.totalPrice.value || 0)}</span>
               </li>
            </ul>
         )}
      </div>
   )
}
