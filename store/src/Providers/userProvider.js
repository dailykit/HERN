import React from 'react'
import { useSession } from 'next-auth/client'
import { useMutation, useSubscription } from '@apollo/client'
import { InlineLoader } from '../components'
// import { useConfig } from '../lib'
import { CUSTOMER_DETAILS, CREATE_CUSTOMER, GET_BRAND_INFO } from '../graphql'

const inititalState = {
   isAddressModalOpen: false,
   isPaymentModalOpen: false,
   isProductModalOpen: false,
   isAuthenticationModalOpen: false,
   isAuthenticated: false,
   productModalType: 'booking',
   user: { name: '', keycloakId: '' },
   brand: {
      id: null,
      domain: '',
      isDefault: ''
   }
}
const UserContext = React.createContext()

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_USER':
         return {
            ...state,
            isAuthenticated: true,
            user: { ...state.user, ...payload }
         }
      case 'SET_BRAND_INFO':
         return { ...state, brand: payload }
      case 'CLEAR_USER':
         return {
            ...state,
            isAuthenticated: false,
            user: { keycloakId: '' }
         }
      case 'Toggle_ADDRESS_MODEL':
         return {
            ...state,
            isAddressModalOpen: payload
         }
      case 'Toggle_PAYMENT_MODEL':
         return {
            ...state,
            isPaymentModalOpen: payload
         }
      case 'Toggle_PRODUCT_MODEL':
         return {
            ...state,
            isProductModalOpen: payload
         }
      case 'Toggle_AUTHENTICATION_MODEL':
         return {
            ...state,
            isAuthenticationModalOpen: payload
         }

      case 'SET_PRODUCT_MODAL_TYPE': {
         return {
            ...state,
            productModalType: payload
         }
      }
      default:
         return state
   }
}

export const UserProvider = ({ children }) => {
   // const { brand } = useConfig()
   const [keycloakId, setKeycloakId] = React.useState('')
   const [brandId, setBrandId] = React.useState(null)
   const [isLoading, setIsLoading] = React.useState(true)
   const [state, dispatch] = React.useReducer(reducers, inititalState)
   const [session, loadingSession] = useSession()

   const [createCustomer] = useMutation(CREATE_CUSTOMER, {
      onCompleted: data => {
         console.log('customer created', data)
      },
      onError: error => console.error('createCustomer => error => ', error)
   })

   // subscription to get the brand details
   const {
      loading: isBrandInfoQueryLoading,
      error: hasBrandInfoQueryError,
      data: { brands = [] } = {}
   } = useSubscription(GET_BRAND_INFO, {
      variables: {
         domain: process.browser && window.location.hostname
      }
   })

   //  subscription to get the user details
   const { loading, data: { customer = {} } = {} } = useSubscription(
      CUSTOMER_DETAILS,
      {
         skip: !session?.user?.id || !keycloakId || !brandId,
         fetchPolicy: 'network-only',
         variables: {
            keycloakId
            // may be should also pass the brandId in case of multi brand
         },
         onSubscriptionData: async ({
            subscriptionData: { data: { customer = {} } = {} } = {}
         } = {}) => {
            console.log('customer details subscription', customer)
            if (!customer?.id) {
               console.log("customer doesn't exist in crm")
               await createCustomer({
                  variables: {
                     object: {
                        email: session.user.email,
                        keycloakId: session.user.id,
                        source: 'stay-in-social',
                        sourceBrandId: brandId,
                        brandCustomers: {
                           data: {
                              brandId: brandId,
                              subscriptionOnboardStatus: 'SELECT_DELIVERY'
                           }
                        }
                     }
                  }
               })
            }
         },
         onError: error => {
            setIsLoading(false)
         }
      }
   )

   const toggleAddressModal = data => {
      dispatch({
         type: 'Toggle_ADDRESS_MODEL',
         payload: data
      })
   }
   const togglePaymentModal = data => {
      dispatch({
         type: 'Toggle_PAYMENT_MODEL',
         payload: data
      })
   }
   const toggleProductModal = data => {
      dispatch({
         type: 'Toggle_PRODUCT_MODEL',
         payload: data
      })
   }
   const toggleAuthenticationModal = data => {
      dispatch({
         type: 'Toggle_AUTHENTICATION_MODEL',
         payload: data
      })
   }

   const setProductModalType = type => {
      dispatch({
         type: 'SET_PRODUCT_MODAL_TYPE',
         payload: type
      })
   }

   React.useEffect(() => {
      if (!isBrandInfoQueryLoading) {
         if (brands.length) {
            setBrandId(brands[0]?.id)
            dispatch({
               type: 'SET_BRAND_INFO',
               payload: {
                  id: brands[0]?.id,
                  domain: brands[0]?.domain,
                  isDefault: brands[0]?.isDefault
               }
            })
         }

         setIsLoading(false)
      }
   }, [isBrandInfoQueryLoading, brands])

   React.useEffect(() => {
      if (!loadingSession) {
         if (session?.user?.id) {
            setKeycloakId(session?.user?.id)
            dispatch({
               type: 'SET_USER',
               payload: { keycloakId: session?.user?.id }
            })
         } else {
            dispatch({ type: 'CLEAR_USER' })
            setIsLoading(false)
         }
      }
   }, [session, loadingSession])

   React.useEffect(() => {
      if (keycloakId && !loading && customer?.id) {
         if (customer?.id) {
            const user = {
               ...customer,
               ...customer?.platform_customer
            }
            dispatch({ type: 'SET_USER', payload: user })
            setIsLoading(false)
         }
      }
   }, [keycloakId, loading, customer])

   if (loading) {
      return <InlineLoader type="full" />
   }

   return (
      <UserContext.Provider
         value={{
            state,
            dispatch,
            toggleAddressModal,
            togglePaymentModal,
            toggleProductModal,
            toggleAuthenticationModal,
            setProductModalType,
            isLoading
         }}
      >
         {!isLoading && children}
      </UserContext.Provider>
   )
}
export const useUser = () => React.useContext(UserContext)
export const useConfig = () => {
   const { state } = React.useContext(UserContext)
   return { brand: state.brand }
}
