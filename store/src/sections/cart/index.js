import React, { useState, useEffect } from 'react'
import { CartContext, onDemandMenuContext } from '../../context'
import {
   Button,
   Divider,
   ProductCard,
   ModifierPopup,
   CounterButton,
   Loader,
} from '../../components'
import _ from 'lodash'
import { combineCartItems, formatCurrency } from '../../utils'
import { DeleteIcon, EditIcon, EmptyCart, CloseIcon } from '../../assets/icons'
import { useLazyQuery, useQuery } from '@apollo/react-hooks'
import { PRODUCTS } from '../../graphql'
import Link from 'next/link'

export const OnDemandCart = () => {
   //context
   const { cartState, methods, addToCart } = React.useContext(CartContext)
   const { onDemandMenu } = React.useContext(onDemandMenuContext)

   //context data
   const { cart } = cartState
   const { isMenuLoading } = onDemandMenu

   //component state
   const [status, setStatus] = useState('loading')
   const [combinedCartData, setCombinedCartData] = useState(null)
   const [increaseProductId, setIncreaseProductId] = useState(null)
   const [increaseProduct, setIncreaseProduct] = useState(null)
   const [popUpType, setPopupType] = useState(null)
   const [cartDetailSelectedProduct, setCartDetailSelectedProduct] =
      useState(null)
   const [tip, setTip] = useState(null)

   useEffect(() => {
      if (!isMenuLoading) {
         if (cart) {
            const combinedCartItems = combineCartItems(cart.products.nodes)
            setCombinedCartData(combinedCartItems)
         } else {
            setCombinedCartData([])
         }
         setStatus('success')
      }
   }, [cart, isMenuLoading])

   //fetch product detail which to be increase or edit
   useQuery(PRODUCTS, {
      skip: !increaseProductId,
      variables: {
         ids: increaseProductId,
      },
      onCompleted: data => {
         if (data) {
            setIncreaseProduct(data.products[0])
         }
      },
   })

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

   //custom area for product card
   const customArea = props => {
      const { data } = props
      const { productId } = data

      return (
         <div className="hern-cart-product-custom-area">
            <div className="hern-cart-product-custom-area-quantity">
               {/* <span>X{quantity}</span> */}
               <CounterButton
                  count={data.ids.length}
                  incrementClick={() => {
                     if (data.childs.length === 0) {
                        addToCart({ productId: data.productId }, 1)
                        return
                     }
                     setCartDetailSelectedProduct(data)
                     setIncreaseProductId(productId)
                     setPopupType('newItem')
                  }}
                  decrementClick={() =>
                     removeCartItems([data.ids[data.ids.length - 1]])
                  }
               />
            </div>
            <div className="hern-cart-product-custom-area-icons">
               <DeleteIcon
                  stroke={'red'}
                  onClick={() => removeCartItems(data.ids)}
                  style={{ cursor: 'pointer' }}
                  title="Delete"
               />
               {data.childs.length > 0 && (
                  <EditIcon
                     stroke={'#367BF5'}
                     onClick={() => {
                        setCartDetailSelectedProduct(data)
                        setIncreaseProductId(productId)
                        setPopupType('edit')
                     }}
                     style={{ cursor: 'pointer' }}
                     title="Edit"
                  />
               )}
            </div>
         </div>
      )
   }

   const closeModifier = () => {
      setIncreaseProduct(null)
      setCartDetailSelectedProduct(null)
      setIncreaseProductId(null)
   }

   const address = address => {
      if (!address) {
         return 'Address Not Available'
      }
   }

   if (status === 'loading') {
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

   if (combinedCartData.length === 0) {
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
      <div className="hern-cart-container">
         <div className="hern-cart-page">
            <div className="hern-cart-content">
               <header>Cart</header>
               <section>
                  {/* address */}
                  <div className="hern-cart-delivery-info">
                     <span>YOUR ORDER(S)</span>
                     <div className="hern-cart-delivery-details">
                        <span>Delivery Description</span>
                        <span>{address(cart.address)}</span>
                     </div>
                  </div>
                  {/*products*/}
                  <div className="hern-cart-products-product-list">
                     {combinedCartData.map((product, index) => {
                        return (
                           <div key={index}>
                              <ProductCard
                                 data={product}
                                 showImage={false}
                                 showProductAdditionalText={false}
                                 customAreaComponent={customArea}
                              />
                              {product.childs.length > 0 && (
                                 <ModifiersList data={product} />
                              )}
                           </div>
                        )
                     })}
                  </div>
                  <Divider />
                  {/* bill details */}
                  <div className="hern-cart-bill-details">
                     <span>BILL DETAILS</span>
                     <ul className="hern-cart-bill-details-list">
                        <li>
                           <span>{cart.billing.itemTotal.label}</span>
                           <span>
                              {formatCurrency(
                                 cart.billing.itemTotal.value || 0
                              )}
                           </span>
                        </li>
                        <li>
                           <span>{cart.billing.deliveryPrice.label}</span>
                           <span>
                              {formatCurrency(
                                 cart.billing.deliveryPrice.value || 0
                              )}
                           </span>
                        </li>
                        <li>
                           <span>{cart.billing.tax.label}</span>
                           <span>
                              {formatCurrency(cart.billing.tax.value || 0)}
                           </span>
                        </li>
                        <li>
                           <span>{cart.billing.discount.label}</span>
                           <span>
                              {formatCurrency(cart.billing.discount.value || 0)}
                           </span>
                        </li>
                        {tip && tip !== 0 && (
                           <li>
                              <span>Tip</span>
                              <span>{formatCurrency(tip)}</span>
                           </li>
                        )}
                     </ul>
                  </div>
                  {/* tip */}
                  <Tips
                     setTip={setTip}
                     totalPrice={cart.billing.totalPrice.value}
                  />
                  {/*
                  total
                  */}
               </section>
            </div>
            {/* bottom bar to proceed */}
            <footer className="hern-cart-footer">
               <Button className="hern-cart-proceed-btn">PROCEED TO PAY</Button>
            </footer>
            {increaseProduct && (
               <ModifierPopup
                  productData={increaseProduct}
                  closeModifier={closeModifier}
                  showCounterBtn={popUpType === 'edit'}
                  forNewItem={popUpType === 'newItem'}
                  edit={popUpType === 'edit'}
                  productCartDetail={cartDetailSelectedProduct}
               />
            )}
         </div>
      </div>
   )
}

const ModifiersList = props => {
   const { data } = props
   console.log('this is modifier data', data)
   return (
      <div className="hern-cart-product-modifiers">
         <span className="hern-cart-product-modifiers-heading">
            Product Option:
         </span>
         <div className="hern-cart-product-modifiers-product-option">
            <span>{data.childs[0].productOption.label || 'N/A'}</span>{' '}
            <span>{formatCurrency(data.childs[0].price || 0)}</span>
         </div>
         <div className="hern-cart-product-modifiers-list">
            <span className="hern-cart-product-modifiers-heading">
               Add ons:
            </span>
            <ul>
               {data.childs[0].childs.map((modifier, index) => (
                  <li key={index}>
                     <span>{modifier.modifierOption.name}</span>
                     <span>{formatCurrency(modifier.price || 0)}</span>
                  </li>
               ))}
            </ul>
         </div>
      </div>
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
