import React from 'react'
import { CartContext } from './../context'
import { formatCurrency } from '../utils'

export const BottomCartBar = () => {
   const { cartState } = React.useContext(CartContext)
   const { cart } = cartState
   return (
      <div className="hern-bottom-cart-bar">
         <div className="hern-bottom-cart-bar-details">
            <span className="hern-bottom-cart-bar__item-count">
               {cart.products.aggregate.count} item(s)
            </span>
            <span className="hern-bottom-cart-bar__price">
               {formatCurrency(cart.billing.itemTotal.value)}
            </span>
            <span className="hern-bottom-cart-bar__taxes">+ taxes</span>
         </div>
         <div className="hern-bottom-cart-bar-view-cart">VIEW CART</div>
      </div>
   )
}
