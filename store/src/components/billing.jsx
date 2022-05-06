import React from 'react'
import { useTranslation } from '../context'
import { formatCurrency } from '../utils'
import { useConfig } from '../lib'

const parseText = (text = '') =>
   text.replace(/\{\{([^}]+)\}\}/g, () => {
      return formatCurrency(text.match(/\{\{([^}]+)\}\}/g)[0].slice(2, -2))
   })

export const Billing = ({ billing }) => {
   const { dynamicTrans, locale } = useTranslation()
   const { configOf } = useConfig()
   const taxDetails = React.useMemo(() => {
      const taxPercentage = configOf('Tax Percentage', 'sales')[
         'Tax Percentage'
      ]?.taxPercentage
      const isTaxIncluded = configOf('Tax Percentage', 'sales')[
         'Is Tax Included'
      ]?.isTaxIncluded
      return {
         isTaxInclusive: isTaxIncluded?.value || isTaxIncluded?.default,
         percentage: taxPercentage?.value || taxPercentage?.default,
      }
   }, [
      configOf('Tax Percentage', 'sales')['Tax Percentage'],
      configOf('Is Tax Included', 'sales')['Is Tax Included'],
   ])
   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])
   return (
      <table className="hern-billing__table">
         <tbody>
            <tr>
               <td
                  className="hern-billing__table__cell"
                  title={billing?.itemTotal?.description || 'Item Total'}
               >
                  <span data-translation="true">
                     {billing?.itemTotal?.label || 'Item Total'}
                  </span>
                  <p
                     className="hern-billing__table__cell__comment"
                     data-translation="true"
                  >
                     {parseText(billing?.itemTotal?.comment) ||
                        'Includes add on total'}
                  </p>
               </td>
               <td className="hern-billing__table__cell">
                  {formatCurrency(billing?.itemTotal)}
               </td>
            </tr>
            <tr>
               <td
                  className="hern-billing__table__cell"
                  title={billing?.deliveryPrice?.description || 'Delivery Fee'}
               >
                  <span data-translation="true">
                     {billing?.deliveryPrice?.label || 'Delivery Fee'}
                  </span>
                  {billing?.deliveryPrice?.comment && (
                     <p
                        className="hern-billing__table__cell__comment"
                        data-translation="true"
                     >
                        {parseText(billing?.deliveryPrice?.comment)}
                     </p>
                  )}
               </td>
               <td className="hern-billing__table__cell">
                  {formatCurrency(billing?.deliveryPrice)}
               </td>
            </tr>
            <tr>
               <td
                  className="hern-billing__table__cell"
                  title={billing?.subTotal?.description || 'Sub Total'}
               >
                  <span data-translation="true">
                     {billing?.subTotal?.label || 'Sub Total'}
                  </span>
                  {billing?.subTotal?.comment && (
                     <p
                        className="hern-billing__table__cell__comment"
                        data-translation="true"
                     >
                        {parseText(billing?.subTotal?.comment)}
                     </p>
                  )}
               </td>
               <td className="hern-billing__table__cell">
                  {formatCurrency(billing?.subTotal)}
               </td>
            </tr>

            {taxDetails.isTaxInclusive ? (
               <>
                  {billing.itemTotalInclusiveTax > 0 && (
                     <tr>
                        <td
                           className="hern-billing__table__cell"
                           title={
                              billing?.itemTotalInclusiveTax?.description ||
                              'Tax (Inclusive)'
                           }
                        >
                           <span data-translation="true">
                              {billing?.itemTotalInclusiveTax?.label ||
                                 'Tax (Inclusive)'}
                           </span>
                           {billing?.itemTotalInclusiveTax?.comment && (
                              <p
                                 className="hern-billing__table__cell__comment"
                                 data-translation="true"
                              >
                                 {parseText(
                                    billing?.itemTotalInclusiveTax?.comment
                                 )}
                              </p>
                           )}
                        </td>
                        <td className="hern-billing__table__cell">
                           {formatCurrency(billing?.itemTotalInclusiveTax)}
                        </td>
                     </tr>
                  )}
               </>
            ) : (
               <>
                  {billing?.itemTotalTaxExcluded > 0 && (
                     <tr>
                        <td
                           className="hern-billing__table__cell"
                           title={
                              billing?.itemTotalTaxExcluded?.description ||
                              'Tax'
                           }
                        >
                           <span data-translation="true">
                              {billing?.itemTotalTaxExcluded?.label || 'Tax'}
                           </span>
                           {billing?.itemTotalTaxExcluded?.comment && (
                              <p
                                 className="hern-billing__table__cell__comment"
                                 data-translation="true"
                              >
                                 {parseText(
                                    billing?.itemTotalTaxExcluded?.comment
                                 )}
                              </p>
                           )}
                        </td>
                        <td className="hern-billing__table__cell">
                           {formatCurrency(billing?.itemTotalTaxExcluded)}
                        </td>
                     </tr>
                  )}
               </>
            )}
            {billing?.walletAmountUsed > 0 && (
               <tr>
                  <td
                     className="hern-billing__table__cell"
                     data-translation="true"
                  >
                     <span data-translation="true">
                        {billing?.walletAmountUsed?.label || 'Wallet Amount'}
                     </span>
                  </td>
                  <td className="hern-billing__table__cell">
                     {formatCurrency(billing?.walletAmountUsed)}
                  </td>
               </tr>
            )}
            {billing?.loyaltyAmountApplied > 0 && (
               <tr>
                  <td
                     className="hern-billing__table__cell"
                     data-translation="true"
                  >
                     {billing?.loyaltyAmountApplied?.label || 'Loyalty Points'}
                  </td>
                  <td className="hern-billing__table__cell">
                     {billing?.loyaltyAmountApplied}
                  </td>
               </tr>
            )}
            {billing?.totalDiscount > 0 && (
               <tr>
                  <td
                     className="hern-billing__table__cell"
                     data-translation="true"
                  >
                     <span data-translation="true">
                        {billing?.totalDiscount?.label || 'Discount'}
                     </span>
                  </td>
                  <td className="hern-billing__table__cell">
                     {formatCurrency(billing?.totalDiscount)}
                  </td>
               </tr>
            )}
            <tr>
               <td
                  className="hern-billing__table__cell"
                  title={billing?.totalToPay?.description || 'Total Price'}
               >
                  <span data-translation="true">
                     {billing?.totalToPay?.label || 'Total Price'}
                  </span>
                  {billing?.totalToPay?.comment && (
                     <p
                        className="hern-billing__table__cell__comment"
                        data-translation="true"
                     >
                        {parseText(billing?.totalToPay?.comment) ||
                           'Total Price'}
                     </p>
                  )}
               </td>
               <td className="hern-billing__table__cell">
                  {formatCurrency(billing?.totalToPay)}
               </td>
            </tr>
         </tbody>
      </table>
   )
}
