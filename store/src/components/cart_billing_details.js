import React from 'react'

import { useTranslation, useUser } from '../context'
import { formatCurrency } from '../utils'
import { useConfig } from '../lib'

export const CartBillingDetails = ({ cart, billing, tip }) => {
   const { user } = useUser()
   const { t, dynamicTrans, locale } = useTranslation()
   const currentLang = React.useMemo(() => locale, [locale])
   const { configOf } = useConfig()
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])
   const loyaltyPointsUsage = configOf('Loyalty Points Usage', 'rewards')[
      'Loyalty Points Usage'
   ]
   const loyaltyPointsConversionRate = parseInt(
      loyaltyPointsUsage?.ConversionRate?.value
   )
   return (
      <div className="hern-cart-billing-details">
         <h3>{t('Bill Details')}</h3>
         {billing && (
            <ul className="hern-cart-billing-details-list">
               <li>
                  <span>{t('Item total')}</span>
                  <span>{formatCurrency(billing.itemTotal || 0)}</span>
               </li>
               <li>
                  <span>{t('Delivery fee')}</span>
                  {billing.deliveryPrice === 0 ? (
                     <span
                        style={{
                           color: 'var(--hern-accent)',
                           fontWeight: 'bold',
                        }}
                     >
                        {t('free')}
                     </span>
                  ) : (
                     <span>{formatCurrency(billing.deliveryPrice || 0)}</span>
                  )}
               </li>
               {billing.itemTotalInclusiveTax > 0 ? (
                  <li title="Included with price">
                     <span>{t('Tax (Inclusive)')}</span>
                     <span>
                        {formatCurrency(
                           Math.round(
                              (billing.itemTotalInclusiveTax + Number.EPSILON) *
                                 100
                           ) / 100 || billing.itemTotalInclusiveTax
                        )}
                     </span>
                  </li>
               ) : (
                  <li>
                     <span>{t('Tax')}</span>
                     <span>
                        {formatCurrency(
                           Math.round(
                              (billing.itemTotalTaxExcluded + Number.EPSILON) *
                                 100
                           ) / 100 || billing.itemTotalTaxExcluded
                        )}
                     </span>
                  </li>
               )}
               {billing.totalDiscount > 0 && (
                  <li>
                     <span>{t('Total Discount')}</span>
                     <span>- {formatCurrency(billing.totalDiscount || 0)}</span>
                  </li>
               )}
               {user?.keycloakId && billing.loyaltyAmountApplied > 0 && (
                  <li>
                     <span>{t('Loyalty amount applied')}</span>
                     <span>
                        <span
                           title={
                              loyaltyPointsConversionRate &&
                              `${loyaltyPointsConversionRate} (Conversion Rate) * ${cart.loyaltyPointsUsed}`
                           }
                        >
                           {billing.loyaltyAmountApplied}
                        </span>
                     </span>
                  </li>
               )}
               {user?.keycloakId && billing.walletAmountUsed > 0 && (
                  <li>
                     <span>{t('Wallet amount used')}</span>
                     <span>{billing.walletAmountUsed}</span>
                  </li>
               )}
               {tip && tip !== 0 && (
                  <li>
                     <span>{t('Tip')}</span>
                     <span>{formatCurrency(tip)}</span>
                  </li>
               )}
               <li className="hern-cart-billing-details-total-price">
                  <span>{t('Total')}</span>
                  <span>{formatCurrency(billing.totalToPay || 0)}</span>
               </li>
            </ul>
         )}
      </div>
   )
}
