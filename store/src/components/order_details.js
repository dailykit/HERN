import React, { useState } from 'react'
import _ from 'lodash'
import { useSubscription } from '@apollo/react-hooks'

import {
   Divider,
   Fulfillment,
   Loader,
   UserInfo,
   CartBillingDetails,
   ProductCard,
} from '../components'
import { GET_CART, GET_CART_ITEMS_BY_CART } from '../graphql'
import { combineCartItems, useQueryParams, formatCurrency } from '../utils'

const OrderDetails = () => {
   const { id } = useQueryParams()
   const {
      loading: loadingOrderDetails,
      data: orderDetails,
      error,
   } = useSubscription(GET_CART, { skip: !id, variables: { id } })

   const {
      loading: cartItemsLoading,
      error: cartItemsError,
      data: cartItemsData,
   } = useSubscription(GET_CART_ITEMS_BY_CART, {
      skip: !id,
      variables: {
         id: Number(id),
      },
      fetchPolicy: 'network-only',
   })

   if (!id) return <p>Please select a Order from left side </p>
   if (loadingOrderDetails || cartItemsLoading) return <Loader inline />
   if (error && cartItemsError) return <p>Somethings went wrong</p>

   return (
      <div>
         {orderDetails?.cart?.status && (
            <button
               style={{
                  display: 'block',
                  padding: '8px 12px',
                  marginLeft: 'auto',
                  backgroundColor: `${selectColor(orderDetails?.cart?.status)}`,
                  marginTop: '16px',
                  color: '#fff',
                  fontWeight: 'bold',
               }}
            >
               {orderDetails?.cart?.status?.replaceAll('_', ' ')}
            </button>
         )}
         {orderDetails?.cart?.paymentStatus && (
            <PaymentStatus paymentStatus={orderDetails?.cart?.paymentStatus} />
         )}
         {orderDetails?.cart && (
            <UserInfo cart={orderDetails?.cart} editable={false} />
         )}
         {orderDetails?.cart && (
            <Fulfillment cart={orderDetails?.cart} editable={false} />
         )}
         {cartItemsData?.cartItems && (
            <CartItems
               products={combineCartItems(cartItemsData?.cartItems)}
               editable={false}
            />
         )}
         <Divider />
         <CartBillingDetails
            cart={orderDetails?.cart}
            billing={orderDetails?.cart?.cartOwnerBilling}
         />
      </div>
   )
}

export { OrderDetails }

const selectColor = variant => {
   switch (variant) {
      case 'ORDER_PENDING':
         return '#FF5A52'
      case 'ORDER_UNDER_PROCESSING':
         return '#FBB13C'
      case 'ORDER_READY_TO_DISPATCH':
         return '#3C91E6'
      case 'ORDER_OUT_FOR_DELIVERY':
         return '#1EA896'
      case 'ORDER_DELIVERED':
         return '#53C22B'
      default:
         return '#FF5A52'
   }
}
const PaymentStatus = ({ paymentStatus }) => {
   const backgroundColor = paymentStatus => {
      switch (paymentStatus) {
         case 'CANCELLED':
            return '#FF5A52'
         case 'SUCCEEDED':
            return '#53C22B'
         default:
            return '#cc3300'
      }
   }
   return (
      <div>
         <span
            style={{
               fontSize: '18px',
               fontWeight: 'bold',
               color: 'rgba(64, 64, 64, 0.8)',
               display: 'inline-block',
               marginRight: '16px',
            }}
         >
            Payment Status
         </span>
         <button
            style={{
               padding: '8px 12px',
               backgroundColor: `${backgroundColor(paymentStatus)}`,
               marginTop: '16px',
               color: '#fff',
               fontWeight: 'bold',
            }}
         >
            {paymentStatus}
         </button>
      </div>
   )
}

const CartItems = ({ products }) => {
   const [cartItems, setCartItems] = useState([])
   React.useEffect(() => {
      setCartItems(combineCartItems(products))
   }, [products])

   //custom area for product card
   const customArea = props => {
      const { data } = props

      return (
         <div className="hern-cart-product-custom-area">
            <span
               style={{
                  fontSize: '20px',
                  color: 'var(--hern-accent)',
               }}
            >
               X{data.ids.length}
            </span>
         </div>
      )
   }

   return (
      <>
         <div className="hern-cart-delivery-info">
            <span>ORDER(S)</span>
         </div>

         <div className="hern-cart-products-product-list">
            {cartItems.map((product, index) => {
               return (
                  <div key={index}>
                     <ProductCard
                        data={product}
                        showImage={false}
                        showProductAdditionalText={false}
                        customAreaComponent={customArea}
                        useForThirdParty={true}
                     />
                     {product.childs.length > 0 && (
                        <ModifiersList data={product} />
                     )}
                  </div>
               )
            })}
         </div>
      </>
   )
}

const ModifiersList = props => {
   const { data } = props
   return (
      <div className="hern-cart-product-modifiers">
         <span className="hern-cart-product-modifiers-heading">
            Product Option:
         </span>
         <div className="hern-cart-product-modifiers-product-option">
            <span>{data.childs[0].productOption.label || 'N/A'}</span>{' '}
            {data.childs[0].price !== 0 && (
               <div>
                  {data.childs[0].discount > 0 && (
                     <span
                        style={{
                           textDecoration: 'line-through',
                        }}
                     >
                        {formatCurrency(data.childs[0].price)}
                     </span>
                  )}
                  <span style={{ marginLeft: '6px' }}>
                     {formatCurrency(
                        data.childs[0].price - data.childs[0].discount
                     )}
                  </span>
               </div>
            )}
         </div>
         <div className="hern-cart-product-modifiers-list">
            {data.childs[0].childs.some(each => each.modifierOption) && (
               <span className="hern-cart-product-modifiers-heading">
                  Add ons:
               </span>
            )}
            <ul>
               {data.childs.length > 0 &&
                  data.childs[0].childs.map((modifier, index) =>
                     modifier.modifierOption ? (
                        <li key={index}>
                           <span>{modifier.modifierOption.name}</span>

                           {modifier.price !== 0 && (
                              <div>
                                 {modifier.discount > 0 && (
                                    <span
                                       style={{
                                          textDecoration: 'line-through',
                                       }}
                                    >
                                       {formatCurrency(modifier.price)}
                                    </span>
                                 )}
                                 <span style={{ marginLeft: '6px' }}>
                                    {formatCurrency(
                                       modifier.price - modifier.discount
                                    )}
                                 </span>
                              </div>
                           )}
                        </li>
                     ) : null
                  )}
            </ul>
         </div>
      </div>
   )
}
