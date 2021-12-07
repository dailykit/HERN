import { useMutation, useSubscription } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import {
   CREATE_CART_ITEMS,
   GET_CART,
   MUTATIONS,
   DELETE_CART_ITEMS,
   GET_CARTS,
   UPDATE_CART_ITEMS,
} from '../graphql'
import { useUser } from '.'
import { useConfig } from '../lib'
import { useToasts } from 'react-toast-notifications'

export const CartContext = React.createContext()

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
   const { brand } = useConfig()
   const { addToast } = useToasts()

   const { isAuthenticated, user, isLoading } = useUser()
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

   //initial cart when no auth
   const { error: getInitialCart } = useSubscription(GET_CART, {
      skip: !storedCartId,
      variables: {
         id: storedCartId,
      },
      onSubscriptionData: ({
         subscriptionData: { data: { cart = {} } = {} } = {},
      } = {}) => {
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
         }
      },
      onError: error => {
         console.log(error)
         addToast('Failed to create cart!', {
            appearance: 'error',
         })
      },
   })
   //update cart
   const [updateCart] = useMutation(MUTATIONS.CART.UPDATE, {
      onCompleted: data => {
         localStorage.removeItem('cart-id')
         console.log('🍾 Cart updated with data!')
      },
      onError: error => {
         console.log(error)
         addToast('Failed to add cart items!', {
            appearance: 'error',
         })
      },
   })

   //delete cart
   const [deleteCart] = useMutation(MUTATIONS.CART.DELETE, {
      onCompleted: () => {
         localStorage.removeItem('cart-id')
      },
      onError: error => {
         console.log('delete cart error', error)
      },
   })

   // create cartItems
   const [createCartItems] = useMutation(CREATE_CART_ITEMS, {
      onCompleted: () => {
         console.log('items added successfully')
      },
      onError: error => {
         console.log(error)
         addToast('Failed to add cart items!', {
            appearance: 'error',
         })
      },
   })

   // delete cartItems
   const [deleteCartItems] = useMutation(DELETE_CART_ITEMS, {
      onCompleted: () => {
         console.log('item removed successfully')
      },
      onError: error => {
         console.log(error)
         addToast('Failed to add cart items!', {
            appearance: 'error',
         })
      },
   })

   //update cartItems
   const [updateCartItems] = useMutation(UPDATE_CART_ITEMS)
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
      } else {
         // logged in
         if (!cartState.cart) {
            console.log('Login ✔ Cart ❌')
            // new cart
            const object = {
               isTest: user.isTest,
               // to be moved to headers
               customerId: user.id,
               paymentMethodId: user.platform_customer.defaultPaymentMethodId,
               stripeCustomerId: user.platform_customer.stripeCustomerId,
               address: user.platform_customer.defaultCustomerAddress,
               cartItems: {
                  data: cartItems,
               },
               ...(user.platform_customer.firstName && {
                  customerInfo: {
                     customerFirstName: user.platform_customer.firstName,
                     customerLastName: user.platform_customer.lastName,
                     customerEmail: user.platform_customer.email,
                     customerPhone: user.platform_customer.phoneNumber,
                  },
               }),
            }
            createCart({
               variables: {
                  object,
               },
            })
         } else {
            // update existing cart
            const cartItemsWithCartId = new Array(quantity).fill({
               ...cartItem,
               cartId: storedCartId,
            })
            createCartItems({
               variables: {
                  objects: cartItemsWithCartId,
               },
            })
         }
      }
   }

   // get user pending cart when logging in
   const { loading: existingCartLoading, error: existingCartError } =
      useSubscription(GET_CARTS, {
         variables: {
            where: {
               paymentStatus: { _eq: 'PENDING' },
               status: { _eq: 'CART_PENDING' },
               customerKeycloakId: {
                  _eq: user?.keycloakId,
               },
            },
         },
         skip: !(brand?.id && user?.keycloakId),
         onSubscriptionData: ({ subscriptionData }) => {
            // pending cart available
            if (
               subscriptionData.data.carts &&
               subscriptionData.data.carts.length > 0
            ) {
               const pendingCartId = localStorage.getItem('cart-id')
               if (pendingCartId) {
                  // merge
                  updateCartItems({
                     variables: {
                        where: { cartId: { _eq: pendingCartId } },
                        _set: { cartId: subscriptionData.data.carts[0].id },
                     },
                  })
                  // delete last one
                  deleteCart({
                     variables: {
                        id: pendingCartId,
                     },
                  })
               }
               setStoredCartId(subscriptionData.data.carts[0].id)
            } else {
               // no pending cart
               if (storedCartId) {
                  updateCart({
                     variables: {
                        id: storedCartId,
                        _set: {
                           isTest: user.isTest,
                           customerKeycloakId: user.keycloakId,
                           paymentMethodId:
                              user.platform_customer.defaultPaymentMethodId,
                           stripeCustomerId:
                              user.platform_customer?.stripeCustomerId,
                           address:
                              user.platform_customer.defaultCustomerAddress,
                           ...(user.platform_customer.firstName && {
                              customerInfo: {
                                 customerFirstName:
                                    user.platform_customer.firstName,
                                 customerLastName:
                                    user.platform_customer.lastName,
                                 customerEmail: user.platform_customer.email,
                                 customerPhone:
                                    user.platform_customer.phoneNumber,
                              },
                           }),
                        },
                     },
                  })
               }
            }
         },
      })
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
