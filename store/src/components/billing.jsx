import React from 'react'
import { formatCurrency } from '../utils'

const parseText = (text = '') =>
   text.replace(/\{\{([^}]+)\}\}/g, () => {
      return formatCurrency(text.match(/\{\{([^}]+)\}\}/g)[0].slice(2, -2))
   })

export const Billing = ({ billing }) => {
   return (
      <table className="hern-billing__table">
         <tbody>
            <tr>
               <td
                  className="hern-billing__table__cell"
                  title={billing?.itemTotal?.description}
               >
                  {billing?.itemTotal?.label}
                  <p className="hern-billing__table__cell__comment">
                     {parseText(billing?.itemTotal?.comment)}
                  </p>
               </td>
               <td className="hern-billing__table__cell">
                  {formatCurrency(billing?.itemTotal?.value)}
               </td>
            </tr>
            <tr>
               <td
                  className="hern-billing__table__cell"
                  title={billing?.deliveryPrice?.description}
               >
                  {billing?.deliveryPrice?.label}
                  <p className="hern-billing__table__cell__comment">
                     {parseText(billing?.deliveryPrice?.comment)}
                  </p>
               </td>
               <td className="hern-billing__table__cell">
                  {formatCurrency(billing?.deliveryPrice?.value)}
               </td>
            </tr>
            {!billing?.isTaxIncluded && (
               <tr>
                  <td
                     className="hern-billing__table__cell"
                     title={billing?.subTotal?.description}
                  >
                     {billing?.subTotal?.label}
                     <p className="hern-billing__table__cell__comment">
                        {parseText(billing?.subTotal?.comment)}
                     </p>
                  </td>
                  <td className="hern-billing__table__cell">
                     {formatCurrency(billing?.subTotal?.value)}
                  </td>
               </tr>
            )}
            {!billing?.isTaxIncluded && (
               <tr>
                  <td
                     className="hern-billing__table__cell"
                     title={billing?.tax?.description}
                  >
                     {billing?.tax?.label}
                     <p className="hern-billing__table__cell__comment">
                        {parseText(billing?.tax?.comment)}
                     </p>
                  </td>
                  <td className="hern-billing__table__cell">
                     {formatCurrency(billing?.tax?.value)}
                  </td>
               </tr>
            )}
            {!!billing?.walletAmountUsed?.value && (
               <tr>
                  <td className="hern-billing__table__cell">
                     {billing?.walletAmountUsed?.label}
                  </td>
                  <td className="hern-billing__table__cell">
                     {formatCurrency(billing?.walletAmountUsed?.value)}
                  </td>
               </tr>
            )}
            {!!billing?.loyaltyPointsUsed?.value && (
               <tr>
                  <td className="hern-billing__table__cell">
                     {billing?.loyaltyPointsUsed?.label}
                  </td>
                  <td className="hern-billing__table__cell">
                     {billing?.loyaltyPointsUsed?.value}
                  </td>
               </tr>
            )}
            {!!billing?.discount?.value && (
               <tr>
                  <td className="hern-billing__table__cell">
                     {billing?.discount?.label}
                  </td>
                  <td className="hern-billing__table__cell">
                     {formatCurrency(billing?.discount?.value)}
                  </td>
               </tr>
            )}
            <tr>
               <td
                  className="hern-billing__table__cell"
                  title={billing?.totalPrice?.description}
               >
                  {billing?.totalPrice?.label}
                  <p className="hern-billing__table__cell__comment">
                     {parseText(billing?.totalPrice?.comment)}
                  </p>
               </td>
               <td className="hern-billing__table__cell">
                  {formatCurrency(billing?.totalPrice?.value)}
               </td>
            </tr>
         </tbody>
      </table>
   )
}
