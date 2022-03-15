import React from 'react'

import { useTranslation, useUser } from '../context'
import { formatCurrency } from '../utils'

export const CartBillingDetails = ({ billing, tip }) => {
   const { user } = useUser()
   const { t, dynamicTrans, locale } = useTranslation()
   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   return (
      <div className="hern-cart-billing-details">
         <h3>{t('Bill Details')}</h3>
         {billing && (
            <ul className="hern-cart-billing-details-list">
               <li>
                  <span data-translation="true"
                  >{billing.itemTotal.label}</span>
                  <span>{formatCurrency(billing.itemTotal.value || 0)}</span>
               </li>
               <li>
                  <span data-translation="true"
                  >
                     {billing.deliveryPrice.label}</span>
                  {billing.deliveryPrice.value === 0 ? (
                     <span
                        style={{
                           color: 'var(--hern-accent)',
                           fontWeight: 'bold',
                        }}
                     >
                        {t('free')}
                     </span>
                  ) : (
                     <span>
                        {formatCurrency(billing.deliveryPrice.value || 0)}
                     </span>
                  )}
               </li>
               <li>
                  <span data-translation="true"
                  >{billing.tax.label}</span>
                  <span>{formatCurrency(billing.tax.value || 0)}</span>
               </li>
               {billing.discount.value > 0 && (
                  <li>
                     <span >{billing.discount.label}</span>
                     <span>
                        - {formatCurrency(billing.discount.value || 0)}
                     </span>
                  </li>
               )}
               {user?.keycloakId && billing.loyaltyPointsUsed.value > 0 && (
                  <li>
                     <span >{billing.loyaltyPointsUsed.label}</span>
                     <span>{billing.loyaltyPointsUsed.value}</span>
                  </li>
               )}
               {user?.keycloakId && billing.walletAmountUsed.value > 0 && (
                  <li>
                     <span >{billing.walletAmountUsed.label}</span>
                     <span>{billing.walletAmountUsed.value}</span>
                  </li>
               )}
               {tip && tip !== 0 && (
                  <li>
                     <span>{t('Tip')}</span>
                     <span>{formatCurrency(tip)}</span>
                  </li>
               )}
               <li className="hern-cart-billing-details-total-price">
                  <span data-translation="true"
                  >{billing.totalPrice.label}</span>
                  <span>{formatCurrency(billing.totalPrice.value || 0)}</span>
               </li>
            </ul>
         )
         }
      </div >
   )
}
