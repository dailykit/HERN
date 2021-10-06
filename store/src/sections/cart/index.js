import React, { useState, useEffect } from 'react'
import { CartContext, onDemandMenuContext } from '../../context'
import {
   Button,
   Divider,
   ProductCard,
   ModifierPopup,
   CounterButton,
} from '../../components'
import _ from 'lodash'
import { combineCartItems, formatCurrency } from '../../utils'
import { DeleteIcon, EditIcon } from '../../assets/icons'
import { useQuery } from '@apollo/react-hooks'
import { PRODUCTS } from '../../graphql'

export const OnDemandCart = () => {
   //context
   const { cartState, methods } = React.useContext(CartContext)
   const { onDemandMenu } = React.useContext(onDemandMenuContext)

   //context data
   const { cart } = cartState
   const { isMenuLoading } = onDemandMenu

   //component state
   const [status, setStatus] = useState('loading')
   const [combinedCartData, setCombinedCartData] = useState(null)
   const [productForEdit, setProductForEdit] = useState(null)
   const [productsInCart, setProductsInCart] = useState(null)

   useEffect(() => {
      if (!isMenuLoading) {
         const combinedCartItems = combineCartItems(cart.products.nodes)
         setCombinedCartData(combinedCartItems)
         setStatus('success')
      }
   }, [cart, isMenuLoading])

   //fetch all products available in cart detail
   // const { loading: productsLoading, error: productsError } = useQuery(
   //    PRODUCTS,
   //    {
   //       skip: isMenuLoading || !cart,
   //       variables: {
   //          ids: cart?.products?.nodes.map(x => x.productId),
   //       },
   //       // fetchPolicy: 'network-only',
   //       onCompleted: data => {
   //          setProductsInCart(data.products)
   //       },
   //    }
   // )

   //used to group by product id so be can show s
   const products = () => {
      const productsFromCart = _.chain(cart.products.nodes)
         .groupBy('productId')
         .map((value, key) => ({
            productId: parseInt(key),
            products: value,
            quantity: value.length,
         }))
         .value()
      console.log(productsFromCart)
      return productsFromCart
   }

   const editIconClick = () => {}

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
   const customArea = props => {
      const { data } = props
      console.log('this is data custom', data)
      const { productId } = data

      return (
         <div className="hern-cart-product-custom-area">
            <div className="hern-cart-product-custom-area-quantity">
               {/* <span>X{quantity}</span> */}
               <CounterButton
                  count={data.ids.length}
                  incrementClick={() => {}}
                  decrementClick={() =>
                     removeCartItems([data.ids[data.ids.length - 1]])
                  }
               />
            </div>
            <div className="hern-cart-product-custom-area-icons">
               <EditIcon
                  stroke={'#367BF5'}
                  onClick={() => editIconClick(productId)}
                  style={{ cursor: 'pointer' }}
                  title="Edit"
               />
               <DeleteIcon
                  stroke={'red'}
                  onClick={() => removeCartItems(data.ids)}
                  style={{ cursor: 'pointer' }}
                  title="Delete"
               />
            </div>
         </div>
      )
   }

   const address = address => {
      if (!address) {
         return 'Address Not Available'
      }
   }

   if (status === 'loading') {
      return <p>Loading</p>
   }

   if (combinedCartData.length === 0) {
      return <p>Cart Not Available</p>
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
                              <ModifiersList data={product} />
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
            {productForEdit && <ModifierPopup />}
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
