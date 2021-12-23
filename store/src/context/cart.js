import { useMutation, useSubscription } from '@apollo/react-hooks'
import isEmpty from 'lodash/isEmpty'
import gql from 'graphql-tag'
import React, { useEffect, useState, useContext } from 'react'
import {
   CREATE_CART_ITEMS,
   GET_CART,
   MUTATIONS,
   DELETE_CART_ITEMS,
   GET_CARTS,
   UPDATE_CART_ITEMS,
   GET_CART_ITEMS_BY_CART,
} from '../graphql'
import { useUser } from '.'
import { useConfig } from '../lib'
import { useToasts } from 'react-toast-notifications'
import { combineCartItems, useQueryParamState } from '../utils'

export const CartContext = React.createContext()

const initialState = {
   cart: null,
   cartItems: null,
   kioskPaymentOption: {
      cod: 1000,
      terminal: 1010,
   },
}

const reducer = (state, { type, payload }) => {
   console.log('cartDataInReducer', payload)

   switch (type) {
      case 'CART':
         return { ...state, cart: payload }
      case 'CART_ITEMS':
         return { ...state, cartItems: payload }
      case 'KIOSK_PAYMENT_OPTION':
         return { ...state, kioskPaymentOption: payload }
      default:
         return state
   }
}

export const CartProvider = ({ children }) => {
   const { brand, kioskId, selectedOrderTab, locationId } = useConfig()
   const { addToast } = useToasts()
   const [oiType] = useQueryParamState('oiType')

   const { isAuthenticated, user, isLoading } = useUser()
   const [cartState, cartReducer] = React.useReducer(reducer, initialState)

   const [storedCartId, setStoredCartId] = useState(null)
   const [combinedCartItems, setCombinedCartData] = useState(null)
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
   const {
      loading: isCartLoading,
      error: getInitialCart,
      data: cartData,
   } = useSubscription(GET_CART, {
      skip: !storedCartId,
      variables: {
         id: storedCartId,
      },
   })

   // get cartItems
   const {
      loading: cartItemsLoading,
      error: cartItemsError,
      data: cartItemsData,
   } = useSubscription(GET_CART_ITEMS_BY_CART, {
      skip: !storedCartId,
      variables: {
         id: storedCartId,
      },
      fetchPolicy: 'network-only',
   })

   useEffect(() => {
      console.log('kiosk paymentOption', cartData)
      if (!isCartLoading && !isEmpty(cartData) && oiType === 'Kiosk Ordering') {
         const terminalPaymentOption = cartData?.cart?.paymentMethods.find(
            option =>
               option?.supportedPaymentOption?.paymentOptionLabel === 'TERMINAL'
         )
         console.log('kiosk paymentOption 1', terminalPaymentOption)

         const codPaymentOption = cartData?.cart?.paymentMethods.find(
            option =>
               option?.supportedPaymentOption?.paymentOptionLabel === 'CASH'
         )
         console.log('kiosk paymentOption 2', codPaymentOption)
         const terminalPaymentOptionId = !isEmpty(terminalPaymentOption)
            ? terminalPaymentOption?.id
            : null
         console.log('kiosk paymentOption 3', terminalPaymentOptionId)
         const codPaymentOptionId = !isEmpty(codPaymentOption)
            ? codPaymentOption?.id
            : null
         console.log('kiosk paymentOption 4', codPaymentOptionId)
         console.log(
            'kiosk paymentOption 5',
            terminalPaymentOptionId,
            codPaymentOptionId
         )
         cartReducer({
            type: 'KIOSK_PAYMENT_OPTION',
            payload: {
               cod: codPaymentOptionId,
               terminal: terminalPaymentOptionId,
            },
         })
      }
   }, [cartData, isCartLoading])

   useEffect(() => {
      if (cartItemsData?.cart?.cartItems) {
         const combinedCartItems = combineCartItems(
            cartItemsData?.cart?.cartItems
         )
         console.log('combinedCartItems', combinedCartItems)
         setCombinedCartData(combinedCartItems)
      } else {
         setCombinedCartData([])
      }
   }, [cartItemsData?.cart?.cartItems])

   //create cart
   const [createCart] = useMutation(MUTATIONS.CART.CREATE, {
      onCompleted: data => {
         if (!isAuthenticated) {
            localStorage.setItem('cart-id', data.createCart.id)
         }
         setStoredCartId(data.createCart.id)
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
         if (!(oiType === 'Kiosk Ordering')) {
            localStorage.removeItem('cart-id')
         }
         console.log('🍾 Cart updated with data!')
      },
      onError: error => {
         console.log(error)
         addToast('Failed to update items!', {
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
         addToast('Failed to create items!', {
            appearance: 'error',
         })
      },
   })

   // delete cartItems
   const [deleteCartItems] = useMutation(DELETE_CART_ITEMS, {
      onCompleted: () => {
         console.log('item removed successfully')
         addToast('Item removed!', {
            appearance: 'success',
         })
      },
      onError: error => {
         console.log(error)
         addToast('Failed to delete items!', {
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
         if (!cartData?.cart) {
            //new cart
            console.log('new cart', cartState)
            const object = {
               cartItems: {
                  data: cartItems,
               },
               locationKioskId: kioskId,
               usedOrderInterface: oiType,
               orderTabId: selectedOrderTab?.id || null,
               locationId: locationId || null,
               ...(oiType === 'Kiosk Ordering' &&
                  cartState.kioskPaymentOption.terminal && {
                     toUseAvailablePaymentOptionId:
                        cartState.kioskPaymentOption.terminal,
                  }),
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
         if (!cartData?.cart) {
            console.log('Login ✔ Cart ❌')
            // new cart
            const object = {
               isTest: user.isTest,
               // to be moved to headers
               customerId: user.id,
               usedOrderInterface: oiType,
               orderTabId: selectedOrderTab?.id || null,
               locationId: locationId || null,
               paymentMethodId: user.platform_customer.defaultPaymentMethodId,
               brandId: brand.id,
               paymentCustomerId: user.platform_customer?.paymentCustomerId,
               address: user.platform_customer.defaultCustomerAddress,
               customerKeycloakId: user?.keycloakId,
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
               status: { _eq: 'ORDER_PENDING' },
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
                              user.platform_customer?.defaultPaymentMethodId,
                           brandId: brand.id,
                           paymentCustomerId:
                              user.platform_customer?.paymentCustomerId,
                           address:
                              user.platform_customer?.defaultCustomerAddress,
                           ...(user.platform_customer.firstName && {
                              customerInfo: {
                                 customerFirstName:
                                    user.platform_customer?.firstName,
                                 customerLastName:
                                    user.platform_customer?.lastName,
                                 customerEmail: user.platform_customer?.email,
                                 customerPhone:
                                    user.platform_customer?.phoneNumber,
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
            cartState: {
               cart: cartData?.cart,
               cartItems: cartItemsData?.cart?.cartItems,
               kioskPaymentOption: cartState.kioskPaymentOption,
            },
            cartReducer,
            addToCart,
            combinedCartItems,
            setStoredCartId,
            methods: {
               cartItems: {
                  delete: deleteCartItems,
               },
               cart: {
                  update: updateCart,
               },
            },
         }}
      >
         {children}
      </CartContext.Provider>
   )
}

export const useCart = () => useContext(CartContext)
