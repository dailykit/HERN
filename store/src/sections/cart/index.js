import React from 'react'
import { CartContext } from '../../context'
import { Button, Divider, ProductCard } from '../../components'
import _ from 'lodash'
import { formatCurrency } from '../../utils'
import { DeleteIcon, EditIcon } from '../../assets/icons'

export const OnDemandCart = () => {
   const { cartState } = React.useContext(CartContext)
   const { cart } = cartState
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
   const customArea = props => {
      const { data } = props
      console.log('this is data', data)
      const { productId } = data
      const quantity = products().find(x => x.productId === productId).quantity
      return (
         <div className="hern-cart-product-custom-area">
            <div className="hern-cart-product-custom-area-quantity">
               <span>X{quantity}</span>
            </div>
            <div className="hern-cart-product-custom-area-icons">
               <EditIcon
                  stroke={'#367BF5'}
                  onClick={() => console.log(productId)}
                  style={{ cursor: 'pointer' }}
                  title="Edit"
               />
               <DeleteIcon
                  stroke={'red'}
                  onClick={() => console.log(productId)}
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
   if (!cart) {
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
                     {products().map((product, index) => {
                        return (
                           <div key={index}>
                              <ProductCard
                                 data={product.products[0]}
                                 showImage={false}
                                 showProductAdditionalText={false}
                                 customAreaComponent={customArea}
                              />
                              <ModifiersList data={product.products[0]} />
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
