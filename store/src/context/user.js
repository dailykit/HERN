import 'twin.macro'
import React from 'react'
import { getSession, useSession } from 'next-auth/client'
import { useMutation, useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../lib'
import {
   CUSTOMER,
   CUSTOMER_REFERRALS,
   LOYALTY_POINTS,
   MUTATIONS,
   WALLETS,
   UPDATE_BRAND_CUSTOMER,
} from '../graphql'
import { PageLoader } from '../components'
import { isClient, processUser, get_env } from '../utils'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

const UserContext = React.createContext()

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_USER': {
         return {
            ...state,
            isAuthenticated: true,
            user: { ...state.user, ...payload },
         }
      }
      case 'CLEAR_USER':
         return {
            ...state,
            isAuthenticated: false,
            user: {
               isDemo: false,
               keycloakId: '',
               subscriptionOnboardStatus: 'REGISTER',
            },
         }
      case 'SET_PAYMENT_METHOD':
         return {
            ...state,
            user: {
               ...state.user,
               platform_customer: {
                  ...state.user.platform_customer,
                  paymentMethods: [
                     ...state.user.platform_customer.paymentMethods,
                     payload,
                  ],
               },
            },
         }
      case 'SET_USER_TYPE':
         return {
            ...state,
            userType: payload,
         }
   }
}

export const UserProvider = ({ children }) => {
   const { brand } = useConfig()
   const [isLoading, setIsLoading] = React.useState(true)
   const [keycloakId, setKeycloakId] = React.useState('')
   const [session, loadingSession] = useSession()
   // console.log('session from userprovider', session)

   const [createCustomer] = useMutation(MUTATIONS.CUSTOMER.CREATE, {
      onError: error => console.log('createCustomer => error => ', error),
   })
   const [updateBrandCustomer] = useMutation(UPDATE_BRAND_CUSTOMER, {
      onError: error => console.log('updateBrandCustomer => error => ', error),
   })
   const [state, dispatch] = React.useReducer(reducers, {
      isAuthenticated: false,
      user: {
         isDemo: false,
         keycloakId: '',
         subscriptionOnboardStatus: 'REGISTER',
      },
      userType: '',
   })

   const { loading, data: { customer = {} } = {} } = useSubscription(
      CUSTOMER.DETAILS,
      {
         skip: !session?.user?.id || !keycloakId || !brand.id,
         fetchPolicy: 'network-only',
         variables: {
            keycloakId,
            brandId: brand.id,
         },
         onSubscriptionData: async ({
            subscriptionData: { data: { customer = {} } = {} } = {},
         } = {}) => {
            if (!customer?.id) {
               await createCustomer({
                  variables: {
                     object: {
                        email: session.user.email,
                        keycloakId: session.user.id,
                        source: 'subscription',
                        sourceBrandId: brand.id,
                        brandCustomers: {
                           data: {
                              brandId: brand.id,
                              subscriptionOnboardStatus: 'SELECT_DELIVERY',
                           },
                        },
                     },
                  },
               })
            }
         },
         onError: () => {
            setIsLoading(false)
         },
      }
   )
   useSubscription(LOYALTY_POINTS, {
      skip: !(brand.id && state.user?.keycloakId),
      variables: {
         brandId: brand.id,
         keycloakId: state.user?.keycloakId,
      },
      onSubscriptionData: data => {
         const { loyaltyPoints } = data.subscriptionData.data
         if (loyaltyPoints?.length) {
            dispatch({
               type: 'SET_USER',
               payload: { loyaltyPoint: loyaltyPoints[0] },
            })
         }
      },
   })

   useSubscription(WALLETS, {
      skip: !(brand.id && state.user?.keycloakId),
      variables: {
         brandId: brand.id,
         keycloakId: state.user?.keycloakId,
      },
      onSubscriptionData: data => {
         const { wallets } = data.subscriptionData.data
         if (wallets?.length) {
            dispatch({
               type: 'SET_USER',
               payload: { wallet: wallets[0] },
            })
         }
      },
   })

   useSubscription(CUSTOMER_REFERRALS, {
      skip: !(brand.id && state.user?.keycloakId),
      variables: {
         brandId: brand.id,
         keycloakId: state.user?.keycloakId,
      },
      onSubscriptionData: data => {
         const { customerReferrals } = data.subscriptionData.data
         if (customerReferrals?.length) {
            dispatch({
               type: 'SET_USER',
               payload: { customerReferral: customerReferrals[0] },
            })
         }
      },
   })

   React.useEffect(() => {
      if (!loadingSession) {
         window.onload = function () {
            if (session?.user?.id) {
               //login
               setKeycloakId(session?.user?.id)
               dispatch({
                  type: 'SET_USER',
                  payload: { keycloakId: session?.user?.id },
               })
               setIsLoading(false)
            } else {
               //logout
               dispatch({ type: 'CLEAR_USER' })
               setIsLoading(false)
            }
         }
      }
   }, [session, loadingSession])

   React.useEffect(() => {
      if (keycloakId && !loading && customer?.id) {
         const user = processUser(customer)
         // fb pixel initialization when user is logged in
         const pixelId = isClient && get_env('PIXEL_ID')
         const advancedMatching = {
            em: user?.platform_customer?.email,
            ph: user?.platform_customer?.phoneNumber,
            fn: user?.platform_customer?.firstName,
            ln: user?.platform_customer?.lastName,
            external_id: user?.platform_customer?.keycloakId,
         }
         const options = {
            autoConfig: true,
            debug: true,
         }
         ReactPixel.init(pixelId, advancedMatching, options)
         if (Array.isArray(user?.carts) && user?.carts?.length > 0) {
            const index = user.carts.findIndex(
               node => node.paymentStatus === 'SUCCEEDED'
            )
            if (
               index !== -1 &&
               user.subscriptionOnboardStatus !== 'ONBOARDED'
            ) {
               updateBrandCustomer({
                  skip: !user?.brandCustomerId,
                  variables: {
                     id: user?.brandCustomerId,
                     _set: { subscriptionOnboardStatus: 'ONBOARDED' },
                  },
               })
            }
         }

         dispatch({ type: 'SET_USER', payload: user })
         dispatch({
            type: 'SET_USER_TYPE',
            payload: '',
         })
         localStorage.removeItem('userType')
         setIsLoading(false)
      }
      // else {
      //    const isGuest = Boolean(localStorage.getItem('userType') === 'guest')
      //    if (isGuest) {
      //       dispatch({
      //          type: 'SET_USER_TYPE',
      //          payload: 'guest',
      //       })
      //    }
      // }
   }, [
      keycloakId,
      loading,
      customer,
      customer?.platform_customer,
      customer?.platform_customer?.defaultPaymentMethodId,
   ])
   React.useEffect(() => {
      const isGuest = Boolean(localStorage.getItem('userType') === 'guest')
      if (isGuest && !state.isAuthenticated) {
         dispatch({
            type: 'SET_USER_TYPE',
            payload: 'guest',
         })
      }
   }, [])

   return (
      <UserContext.Provider
         value={{
            isAuthenticated: state.isAuthenticated,
            user: state.user,
            userType: state.userType,
            dispatch,
            isLoading,
         }}
      >
         {children}
      </UserContext.Provider>
   )
}

export const useUser = () => React.useContext(UserContext)
