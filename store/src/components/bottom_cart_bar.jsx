import React from 'react'

export const BottomCartBar = () => {
   return (
      <div className="hern-bottom-cart-bar">
         <div className="hern-bottom-cart-bar-details">
            <span className="hern-bottom-cart-bar__item-count">1 item(s)</span>
            <span className="hern-bottom-cart-bar__price">$ 20</span>
            <span className="hern-bottom-cart-bar__taxes">+ taxes</span>
         </div>
         <div className="hern-bottom-cart-bar-view-cart">VIEW CART</div>
      </div>
   )
}
