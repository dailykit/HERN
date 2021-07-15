import 'twin.macro'
import React from 'react'
import { isEmpty } from 'lodash'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import { getSession } from 'next-auth/client'

import { useConfig } from '../lib'
import {
   BRAND_CUSTOMER,
   CUSTOMER,
   CUSTOMER_REFERRALS,
   LOYALTY_POINTS,
   UPDATE_BRAND_CUSTOMER,
   WALLETS,
} from '../graphql'
import { PageLoader } from '../components'
import { isClient, processUser } from '../utils'

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
   })
   useSubscription(BRAND_CUSTOMER, {
      skip: !state?.user?.brandCustomerId,
      variables: { id: state?.user?.brandCustomerId },
      onSubscriptionData: ({
         subscriptionData: { data: { brandCustomer = {} } = {} } = {},
      }) => {
         if (isEmpty(brandCustomer)) return
         dispatch({
            type: 'SET_USER',
            payload: {
               subscriptionOnboardStatus:
                  brandCustomer.subscriptionOnboardStatus,
            },
         })
      },
   })
   const { loading, data: { customer = {} } = {} } = useSubscription(
      CUSTOMER.DETAILS,
      {
         skip: !keycloakId || !brand.id,
         fetchPolicy: 'network-only',
         variables: {
            keycloakId,
            brandId: brand.id,
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
      ;(async () => {
         if (isClient) {
            const session = await getSession()
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
      })()
   }, [])

   React.useEffect(() => {
      if (!loading && customer?.id && organization?.id) {
         const user = processUser(customer, organization?.stripeAccountType)

         if (Array.isArray(user?.carts) && user?.carts?.length > 0) {
            const index = user.carts.findIndex(
               node => node.paymentStatus === 'SUCCEEDED'
            )
            if (index !== -1) {
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
         setIsLoading(false)
      }
   }, [loading, customer, organization])

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
