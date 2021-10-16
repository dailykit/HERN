import React from 'react'
import { useSubscription } from '@apollo/client'
import { InlineLoader } from '../components'
import { useToasts } from 'react-toast-notifications'
import { CART_INFO } from '../graphql'
import { useUser } from '.'

const initialState = {
   carts: [],
   currentCart: {},
   hostCart: {}
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_CARTS': {
         const newState = {
            ...state,
            carts: payload
         }
         return newState
      }
      case 'ADD_HOST_CART': {
         const newState = {
            ...state,
            hostCart: payload
         }
         return newState
      }
      case 'ADD_CURRENT_CART': {
         const newState = {
            ...state,
            currentCart: payload
         }
         return newState
      }
      default:
         return state
   }
}

const CartContext = React.createContext()

export const CartProvider = ({ children }) => {
   const {
      state: { user = {} }
   } = useUser()
   const { addToast } = useToasts()
   const [state, dispatch] = React.useReducer(reducers, initialState)
   const {
      loading: isCartLoading,
      error: cartError,
      data: { carts = [] } = {}
   } = useSubscription(CART_INFO, {
      variables: {
         keycloakId: user?.keycloakId,
         params: {
            keycloakId: user?.keycloakId,
            shareFor: 'parent'
         }
      }
   })

   const getCart = data => {
      const cart = state.carts.find(
         cart => cart?.experienceClass?.experienceId === +data
      )
      return cart
   }

   const addHostCart = data => {
      dispatch({
         type: 'ADD_HOST_CART',
         payload: data
      })
   }
   const addCurrentCart = data => {
      dispatch({
         type: 'ADD_CURRENT_CART',
         payload: data
      })
   }

   React.useEffect(() => {
      if (!isCartLoading) {
         console.log('CHECKING>>>> carts query works....', carts)
         if (carts.length) {
            console.log('CHECKING>>>> carts query works....', carts)
            dispatch({
               type: 'SET_CARTS',
               payload: carts
            })
         }
      }
   }, [carts, isCartLoading])

   if (isCartLoading) return <InlineLoader type="full" />

   if (cartError) {
      addToast('Opps! Something went wrong!', { appearance: 'error' })
   }
   return (
      <CartContext.Provider
         value={{
            state,
            carts: state.carts,
            hostCart: state.hostCart,
            getCart,
            addHostCart,
            addCurrentCart,
            dispatch
         }}
      >
         {children}
      </CartContext.Provider>
   )
}

export const useCart = () => React.useContext(CartContext)
