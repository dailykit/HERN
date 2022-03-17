import React, { useState } from 'react'
import { CartContext, onDemandMenuContext, useUser } from '../../context'
import {
   Button,
   Divider,
   Loader,
   CartBillingDetails,
   LoyaltyPoints,
   Coupon,
   CartCard,
} from '../../components'
import _, { isEmpty } from 'lodash'
import { formatCurrency } from '../../utils'
import { EmptyCart, CloseIcon } from '../../assets/icons'
import Link from 'next/link'
import { useConfig } from '../../lib'

export const CartDetails = () => {
   //context
   const { cartState, methods, combinedCartItems, isFinalCartLoading } =
      React.useContext(CartContext)

   const { settings } = useConfig()
   const { user, isAuthenticated } = useUser()
   //context data
   const { cart } = cartState

   const isLoyaltyPointsAvailable =
      settings?.rewards?.['Loyalty Points Availability']?.['Loyalty Points']
         ?.IsLoyaltyPointsAvailable?.value ?? true

   //remove cartItem or cartItems
   const removeCartItems = cartItemIds => {
      console.log('removed id', cartItemIds)
      methods.cartItems.delete({
         variables: {
            where: {
               id: {
                  _in: cartItemIds,
               },
            },
         },
      })
   }

   if (isFinalCartLoading) {
      return (
         <div className="hern-cart-container">
            <div className="hern-cart-page">
               <div className="hern-cart-content">
                  <header>Cart</header>
                  <Loader />
               </div>
            </div>
         </div>
      )
   }

   if (
      cart == null ||
      isEmpty(cart) ||
      combinedCartItems?.length === 0 ||
      combinedCartItems === null
   ) {
      return (
         <div className="hern-cart-container">
            <div className="hern-cart-page" style={{ overflowY: 'hidden' }}>
               <div className="hern-cart-content">
                  <header>Cart</header>
                  <div className="hern-cart-empty-cart">
                     <EmptyCart />
                     <span>Oops! Your cart is empty </span>
                     <Button
                        className="hern-cart-go-to-menu-btn"
                        onClick={() => {}}
                     >
                        <Link href="/order">GO TO MENU</Link>
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      )
   }

   return (
      <section className="hern-cart-container">
         <h2>Items({combinedCartItems.length})</h2>
         {combinedCartItems.map((product, index) => {
            return (
               <CartCard
                  key={product.productId}
                  productData={product}
                  quantity={product?.ids?.length}
                  removeCartItems={removeCartItems}
               />
            )
         })}
         <Coupon upFrontLayout={true} cart={cart} />
         {isAuthenticated &&
            isLoyaltyPointsAvailable &&
            user.loyaltyPoint?.points > 0 && (
               <LoyaltyPoints cart={cartState.cart} version={2} />
            )}
         <Divider />
         <CartBillingDetails billing={cart.billing} />
      </section>
   )
}

const Tips = props => {
   //props
   const { totalPrice, setTip } = props

   //component state
   const [customPanel, setCustomPanel] = useState(false)
   const [tipAmount, setTipAmount] = useState(0)
   const [activeOption, setActiveOption] = useState(null)

   const classesForTipOption = option => {
      if (option === activeOption) {
         return 'hern-cart__tip-tip-option hern-cart__tip-tip-option--active'
      }
      return 'hern-cart__tip-tip-option'
   }

   const predefinedTip = option => {
      if (activeOption !== option) {
         setActiveOption(option)
         setTip((totalPrice * option) / 100)
      } else {
         setActiveOption(null)
         setTip(null)
      }
   }
   return (
      <div className="hern-cart__tip">
         <div className="hern-cart__tip-heading">
            <span>Add a Tip</span>
         </div>
         {!customPanel && (
            <div className="hern-cart__tip-tip-options-list">
               <ul>
                  {/* <li>0% {formatCurrency(0)}</li> */}
                  <li
                     className={classesForTipOption(5)}
                     onClick={() => {
                        predefinedTip(5)
                     }}
                  >
                     <span>5%</span>{' '}
                     <span>{formatCurrency(totalPrice * 0.05)}</span>
                  </li>
                  <li
                     className={classesForTipOption(10)}
                     onClick={() => {
                        predefinedTip(10)
                     }}
                  >
                     <span>10%</span>{' '}
                     <span>{formatCurrency(totalPrice * 0.1)}</span>
                  </li>
                  <li
                     className={classesForTipOption(15)}
                     onClick={() => {
                        predefinedTip(15)
                     }}
                  >
                     <span>15%</span>{' '}
                     <span> {formatCurrency(totalPrice * 0.15)}</span>
                  </li>
               </ul>

               <button
                  className="hern-cart__tip-add-custom-btn"
                  onClick={() => {
                     setCustomPanel(prevState => !prevState)
                  }}
               >
                  Custom
               </button>
            </div>
         )}
         {customPanel && (
            <div className="hern-cart__tip-custom-tip">
               <div className="hern-cart__tip-input-field">
                  <span>
                     {formatCurrency(0)
                        .replace(/\d/g, '')
                        .replace(/\./g, '')
                        .trim()}
                  </span>
                  <input
                     // type="number"
                     type="text"
                     pattern="[0-9]*"
                     placeholder="Enter amount..."
                     value={tipAmount}
                     onChange={e => {
                        setTipAmount(e.target.value)
                     }}
                  />
               </div>
               <button
                  className="hern-cart__tip-add-tip-btn"
                  onClick={() => {
                     setTip(parseFloat(tipAmount))
                     setCustomPanel(prevState => !prevState)
                  }}
               >
                  ADD
               </button>
               <CloseIcon
                  title="Close"
                  size={18}
                  stroke={'#404040CC'}
                  style={{ marginLeft: '10px', cursor: 'pointer' }}
                  onClick={() => {
                     setCustomPanel(prevState => !prevState)
                  }}
               />
            </div>
         )}
      </div>
   )
}
