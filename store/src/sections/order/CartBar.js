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
import {
   DeleteIcon,
   EditIcon,
   EmptyCart,
   CloseIcon,
   RightArrowIcon,
} from '../../assets/icons'
import { useLazyQuery, useQuery } from '@apollo/react-hooks'
import { PRODUCTS } from '../../graphql'
import Link from 'next/link'
import { useConfig } from '../../lib'

const CartBar = () => {
   //context
   const { cartState, methods, addToCart, combinedCartItems } =
      React.useContext(CartContext)
   const { onDemandMenu } = React.useContext(onDemandMenuContext)
   const { brand } = useConfig()
   //context data
   const { cart } = cartState
   //component state
   // const [combinedCartData, setCombinedCartData] = useState(null)
   const [increaseProductId, setIncreaseProductId] = useState(null)
   const [increaseProduct, setIncreaseProduct] = useState(null)
   const [popUpType, setPopupType] = useState(null)
   const [cartDetailSelectedProduct, setCartDetailSelectedProduct] =
      useState(null)

   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: 1000,
         },
      }),
      [brand]
   )

   //fetch product detail which to be increase or edit
   useQuery(PRODUCTS, {
      skip: !increaseProductId,
      variables: {
         ids: increaseProductId,
         priceArgs: argsForByLocation,
         discountArgs: argsForByLocation,
         defaultCartItemArgs: argsForByLocation,
         productOptionPriceArgs: argsForByLocation,
         productOptionDiscountArgs: argsForByLocation,
         productOptionCartItemArgs: argsForByLocation,
         modifierCategoryOptionPriceArgs: argsForByLocation,
         modifierCategoryOptionDiscountArgs: argsForByLocation,
         modifierCategoryOptionCartItemArgs: argsForByLocation,
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

   if (combinedCartItems.length === 0) {
      return (
         <div className="hern-cart-container">
            <div
               className="hern-cart-page__cartbar"
               style={{ overflowY: 'hidden' }}
            >
               <div className="hern-cart-content">
                  <header>Cart</header>
                  <div className="hern-cart-empty-cart hern-cart-empty-cart-start__md">
                     <EmptyCart />
                     <span>Oops! Your cart is empty </span>
                  </div>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="hern-order__cartbar">
         <div className="hern-cart-container">
            <div className="hern-cart-page__cartbar">
               <div className="hern-cart-content">
                  <header>Cart</header>
                  <section>
                     {/*products*/}
                     <div className="hern-cart-products-product-list">
                        {combinedCartItems.map((product, index) => {
                           return (
                              <div key={index}>
                                 <ProductCard
                                    data={product}
                                    showImage={false}
                                    showProductAdditionalText={false}
                                    customAreaComponent={customArea}
                                    showModifier={Boolean(increaseProduct)}
                                    closeModifier={closeModifier}
                                    modifierPopupConfig={{
                                       productData: increaseProduct,
                                       showCounterBtn: Boolean(
                                          popUpType === 'edit'
                                       ),
                                       forNewItem: Boolean(
                                          popUpType === 'newItem'
                                       ),
                                       edit: Boolean(popUpType === 'edit'),
                                       productCartDetail:
                                          cartDetailSelectedProduct,
                                    }}
                                 />
                              </div>
                           )
                        })}
                     </div>
                  </section>
                  <div className="hern-ondemand-cart__cart-bar">
                     <h3>Total</h3>
                     <h3>
                        {formatCurrency(cart?.billing?.itemTotal?.value || 0)}
                     </h3>
                  </div>
                  <div className="hern-ondemand-cart__review-cart">
                     <button>
                        <Link href="/on-demand-cart">
                           <div
                              style={{ display: 'flex', alignItems: 'center' }}
                           >
                              <span
                                 style={{
                                    display: 'inline-block',
                                    paddingRight: '12px',
                                 }}
                              >
                                 REVIEW CART
                              </span>
                              <RightArrowIcon />
                           </div>
                        </Link>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default CartBar
