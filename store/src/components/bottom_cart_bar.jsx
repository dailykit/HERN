import React from 'react'
import Link from 'next/link'
import { CartContext } from './../context'
import { formatCurrency } from '../utils'

export const BottomCartBar = () => {
   const { cartState, storedCartId } = React.useContext(CartContext)
   const { cart } = cartState
   if (!Boolean(storedCartId)) {
      return null
   }
   if (Boolean(storedCartId) && !cart?.cartItems_aggregate?.aggregate?.count) {
      return null
   }
   return (
      <div className="hern-bottom-cart-bar">
         <div className="hern-bottom-cart-bar-details">
            <span className="hern-bottom-cart-bar__item-count">
               {cart?.cartItems_aggregate?.aggregate?.count || 0} item(s)
            </span>
            <span className="hern-bottom-cart-bar__price">
               {formatCurrency(cart?.billing?.itemTotal?.value || 0)}
            </span>
            <span className="hern-bottom-cart-bar__taxes">+ taxes</span>
         </div>
         <div className="hern-bottom-cart-bar-view-cart">
            <Link href="/checkout">VIEW CART</Link>{' '}
         </div>
      </div>
   )
}
