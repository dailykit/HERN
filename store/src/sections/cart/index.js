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
import { DeleteIcon, EditIcon, EmptyCart } from '../../assets/icons'
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
                     </ul>
                  </div>
                  {/*
                  tip
                  */}
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
                  height={increaseProduct ? '100%' : '0'}
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
