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
   BRAND,
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
   }
}

export const UserProvider = ({ children }) => {
   const { brand, organization } = useConfig()
   const [isLoading, setIsLoading] = React.useState(true)
   const [keycloakId, setKeycloakId] = React.useState('')
   const [session, loadingSession] = useSession()

   const [createCustomer] = useMutation(MUTATIONS.CUSTOMER.CREATE, {
      onError: error => console.log('createCustomer => error => ', error),
   })
   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      onError: error => console.log('createCustomer => error => ', error),
   })
   const [state, dispatch] = React.useReducer(reducers, {
      isAuthenticated: false,
      user: {
         isDemo: false,
         keycloakId: '',
         subscriptionOnboardStatus: 'REGISTER',
      },
   })

   const { loading, data: { customer = {} } = {} } = useSubscription(
      CUSTOMER.DETAILS,
      {
         skip: session?.user?.id || !keycloakId || !brand.id,
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
         if (session?.user?.id) {
            setKeycloakId(session?.user?.id)
            dispatch({
               type: 'SET_USER',
               payload: { keycloakId: session?.user?.id },
            })
         } else {
            dispatch({ type: 'CLEAR_USER' })
            setIsLoading(false)
         }
      }
   }, [session, loadingSession])

   React.useEffect(() => {
      if (keycloakId && !loading && customer?.id) {
         const user = processUser(customer, organization?.stripeAccountType)
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
            if (index !== -1) {
               updateBrandCustomer({
                  skip: !user?.brandCustomerId,
                  variables: {
                     where: {
                        id: {
                           _eq: user?.brandCustomerId,
                        },
                     },
                     _set: { subscriptionOnboardStatus: 'ONBOARDED' },
                  },
               })
            }
         }

         dispatch({ type: 'SET_USER', payload: user })
         setIsLoading(false)
      }
   }, [keycloakId, loading, customer])

   if (isLoading) return <PageLoader />
   return (
      <UserContext.Provider
         value={{
            isAuthenticated: state.isAuthenticated,
            user: state.user,
            dispatch,
            isLoading,
         }}
      >
         {children}
      </UserContext.Provider>
   )
}

export const useUser = () => React.useContext(UserContext)
