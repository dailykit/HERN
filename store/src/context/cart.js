import { useMutation, useSubscription } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import {
   CREATE_CART_ITEMS,
   GET_CART_ON_DEMAND,
   MUTATIONS,
   DELETE_CART_ITEMS,
} from '../graphql'
import { useUser } from '.'
export const CartContext = React.createContext()

// const CREATE_CART = gql`
//    mutation CREATE_CART($object: order_cart_insert_input!) {
//       createCart(object: $object) {
//          id
//       }
//    }
// `
// const CREATE_CART_ITEMS = gql`
//    mutation CREATE_CART_ITEMS($objects: [order_cartItem_insert_input!]!) {
//       createCartItems(objects: $objects) {
//          returning {
//             id
//          }
//       }
//    }
// `
const initialState = {
   cart: null,
}

const reducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case 'CART':
         return { ...state, cart: payload }
      default:
         return state
   }
}

export const CartProvider = ({ children }) => {
   const { isAuthenticated } = useUser()
   const [cartState, cartReducer] = React.useReducer(reducer, initialState)
   const [storedCartId, setStoredCartId] = useState(null)
   React.useEffect(() => {
      const cartId = localStorage.getItem('cart-id')
      if (cartId) {
         setStoredCartId(+cartId)
         if (!isAuthenticated) {
            // only set local cart id in headers when not authenticated
            // when logged in, if it has local cart id then it will try to merge carts
         }
      }
   }, [])
   console.log('storedCartId', storedCartId)
   //initial cart when no auth
   const { error: getInitialCart } = useSubscription(GET_CART_ON_DEMAND, {
      skip: isAuthenticated || !storedCartId,
      variables: {
         id: storedCartId,
      },
      onSubscriptionData: ({
         subscriptionData: { data: { cart = {} } = {} } = {},
      } = {}) => {
         console.log('🚀 🍟', cart)
         cartReducer({
            type: 'CART',
            payload: cart,
         })
      },
   })

   //create cart
   const [createCart] = useMutation(MUTATIONS.CART.CREATE, {
      onCompleted: data => {
         if (!isAuthenticated) {
            localStorage.setItem('cart-id', data.createCart.id)
            setStoredCartId(data.createCart.id)
            console.log('product has been added', data.createCart.id)
         }
      },
      onError: error => {
         console.log(error)
         toast.error('Failed to create cart!')
      },
   })
   //update cart
   const [deleteCartItems] = useMutation(DELETE_CART_ITEMS, {
      onCompleted: () => {
         console.log('item removed successfully')
      },
      onError: error => {
         console.log(error)
         // toast.error("Failed to add cart items!");
      },
   })
   //delete cart

   //create cartItems
   const [createCartItems] = useMutation(CREATE_CART_ITEMS, {
      onCompleted: () => {
         console.log('items added successfully')
      },
      onError: error => {
         console.log(error)
         // toast.error("Failed to add cart items!");
      },
   })

   //update cartItems

   //add to cart
   const addToCart = (cartItem, quantity) => {
      const cartItems = new Array(quantity).fill({ ...cartItem })
      if (!isAuthenticated) {
         //without login
         if (!cartState.cart) {
            //new cart
            const object = {
               cartItems: {
                  data: cartItems,
               },
            }
            console.log('object new cart', object)
            createCart({
               variables: {
                  object,
               },
            })
         } else {
            //cart already exist
            const cartItemsWithCartId = new Array(quantity).fill({
               ...cartItem,
               cartId: storedCartId,
            })
            console.log('object new cart', cartItemsWithCartId)
            createCartItems({
               variables: {
                  objects: cartItemsWithCartId,
               },
            })
         }
      }
   }
   console.log('cartState', cartState)
   return (
      <CartContext.Provider
         value={{
            cartState,
            cartReducer,
            addToCart,
            methods: {
               cartItems: {
                  delete: deleteCartItems,
               },
            },
         }}
      >
         {children}
      </CartContext.Provider>
   )
}
