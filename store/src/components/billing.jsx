import React from 'react'
import tw, { styled } from 'twin.macro'

import { formatCurrency } from '../utils'

const parseText = (text = '') =>
   text.replace(/\{\{([^}]+)\}\}/g, () => {
      return formatCurrency(text.match(/\{\{([^}]+)\}\}/g)[0].slice(2, -2))
   })

export const Billing = ({ billing }) => {
   return (
      <Styles.Table>
         <tbody>
            <tr>
               <Styles.Cell title={billing?.itemTotal?.description}>
                  {billing?.itemTotal?.label}
                  <Styles.Comment>
                     {parseText(billing?.itemTotal?.comment)}
                  </Styles.Comment>
               </Styles.Cell>
               <Styles.Cell>
                  {formatCurrency(billing?.itemTotal?.value)}
               </Styles.Cell>
            </tr>
            <tr>
               <Styles.Cell title={billing?.deliveryPrice?.description}>
                  {billing?.deliveryPrice?.label}
                  <Styles.Comment>
                     {parseText(billing?.deliveryPrice?.comment)}
                  </Styles.Comment>
               </Styles.Cell>
               <Styles.Cell>
                  {formatCurrency(billing?.deliveryPrice?.value)}
               </Styles.Cell>
            </tr>
            {!billing?.isTaxIncluded && (
               <tr>
                  <Styles.Cell title={billing?.subTotal?.description}>
                     {billing?.subTotal?.label}
                     <Styles.Comment>
                        {parseText(billing?.subTotal?.comment)}
                     </Styles.Comment>
                  </Styles.Cell>
                  <Styles.Cell>
                     {formatCurrency(billing?.subTotal?.value)}
                  </Styles.Cell>
               </tr>
            )}
            {!billing?.isTaxIncluded && (
               <tr>
                  <Styles.Cell title={billing?.tax?.description}>
                     {billing?.tax?.label}
                     <Styles.Comment>
                        {parseText(billing?.tax?.comment)}
                     </Styles.Comment>
                  </Styles.Cell>
                  <Styles.Cell>
                     {formatCurrency(billing?.tax?.value)}
                  </Styles.Cell>
               </tr>
            )}
            {!!billing?.walletAmountUsed?.value && (
               <tr>
                  <Styles.Cell>{billing?.walletAmountUsed?.label}</Styles.Cell>
                  <Styles.Cell>
                     {formatCurrency(billing?.walletAmountUsed?.value)}
                  </Styles.Cell>
               </tr>
            )}
            {!!billing?.loyaltyPointsUsed?.value && (
               <tr>
                  <Styles.Cell>{billing?.loyaltyPointsUsed?.label}</Styles.Cell>
                  <Styles.Cell>{billing?.loyaltyPointsUsed?.value}</Styles.Cell>
               </tr>
            )}
            {!!billing?.discount?.value && (
               <tr>
                  <Styles.Cell>{billing?.discount?.label}</Styles.Cell>
                  <Styles.Cell>
                     {formatCurrency(billing?.discount?.value)}
                  </Styles.Cell>
               </tr>
            )}
            <tr>
               <Styles.Cell title={billing?.totalPrice?.description}>
                  {billing?.totalPrice?.label}
                  <Styles.Comment>
                     {parseText(billing?.totalPrice?.comment)}
                  </Styles.Comment>
               </Styles.Cell>
               <Styles.Cell>
                  {formatCurrency(billing?.totalPrice?.value)}
               </Styles.Cell>
            </tr>
         </tbody>
      </Styles.Table>
   )
}

const Styles = {
   Table: styled.table`
      ${tw`my-2 w-full table-auto`}
      tr:nth-of-type(even) {
         ${tw`bg-gray-100`}
      }
      tr {
         td:last-child {
            text-align: right;
         }
      }
   `,
   Cell: styled.td`
      ${tw`border px-2 py-1`}
   `,
   Comment: styled.p`
      ${tw`text-sm text-gray-600`}
   `,
}
