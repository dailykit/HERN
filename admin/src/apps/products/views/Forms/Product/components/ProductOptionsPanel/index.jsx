import React from 'react'

import { StyledTable } from './styled'

const ProductOptionsPanel = ({ options }) => {
   return (
      <StyledTable>
         <thead>
            <tr>
               <th>Label</th>
               <th>Quantity</th>
               <th>Price</th>
               <th>Discount</th>
               <th>Discounted Price</th>
            </tr>
         </thead>
         {options.map(({ productOption: option, price, discount }) => (
            <tr key={option.id}>
               <td>{option.label}</td>
               <td>{option.quantity}</td>
               <td>${price}</td>
               <td>{discount}%</td>
               <td>${(price - (discount / 100) * price).toFixed(2)}</td>
            </tr>
         ))}
      </StyledTable>
   )
}

export default ProductOptionsPanel
