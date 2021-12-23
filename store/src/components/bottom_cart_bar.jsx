import React from 'react'
import Link from 'next/link'
import { CartContext } from './../context'
import { formatCurrency } from '../utils'

export const BottomCartBar = () => {
   const { cartState } = React.useContext(CartContext)
   const { cart } = cartState
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
            <Link href="/on-demand-cart">VIEW CART</Link>{' '}
         </div>
      </div>
   )
}
