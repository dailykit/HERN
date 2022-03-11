import React from 'react'
import { useTranslation } from '../context'
import { formatCurrency } from '../utils'

const parseText = (text = '') =>
   text.replace(/\{\{([^}]+)\}\}/g, () => {
      return formatCurrency(text.match(/\{\{([^}]+)\}\}/g)[0].slice(2, -2))
   })

export const Billing = ({ billing }) => {
   const { dynamicTrans } = useTranslation()
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [])
   return (
      <table className="hern-billing__table">
         <tbody>
            <tr>
               <td
                  className="hern-billing__table__cell"
                  title={billing?.itemTotal?.description}
               >
                  <span data-translation="true">
                     {billing?.itemTotal?.label}
                  </span>
                  <p
                     className="hern-billing__table__cell__comment"
                     data-translation="true"
                  >
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
                  <span data-translation="true">
                     {billing?.deliveryPrice?.label}
                  </span>
                  <p
                     className="hern-billing__table__cell__comment"
                     data-translation="true"
                  >
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
                     <span data-translation="true">
                        {billing?.subTotal?.label}
                     </span>
                     <p
                        className="hern-billing__table__cell__comment"
                        data-translation="true"
                     >
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
                     <span data-translation="true">{billing?.tax?.label}</span>
                     <p
                        className="hern-billing__table__cell__comment"
                        data-translation="true"
                     >
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
                  <td
                     className="hern-billing__table__cell"
                     data-translation="true"
                  >
                     <span data-translation="true">
                        {billing?.walletAmountUsed?.label}
                     </span>
                  </td>
                  <td className="hern-billing__table__cell">
                     {formatCurrency(billing?.walletAmountUsed?.value)}
                  </td>
               </tr>
            )}
            {!!billing?.loyaltyPointsUsed?.value && (
               <tr>
                  <td
                     className="hern-billing__table__cell"
                     data-translation="true"
                  >
                     {billing?.loyaltyPointsUsed?.label}
                  </td>
                  <td className="hern-billing__table__cell">
                     {billing?.loyaltyPointsUsed?.value}
                  </td>
               </tr>
            )}
            {!!billing?.discount?.value && (
               <tr>
                  <td
                     className="hern-billing__table__cell"
                     data-translation="true"
                  >
                     <span data-translation="true">
                        {billing?.discount?.label}
                     </span>
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
                  <span data-translation="true">
                     {billing?.totalPrice?.label}
                  </span>
                  <p
                     className="hern-billing__table__cell__comment"
                     data-translation="true"
                  >
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
