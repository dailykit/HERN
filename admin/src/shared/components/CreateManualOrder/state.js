import React from 'react'
import { toast } from 'react-toastify'
import { useTunnel } from '@dailykit/ui'
import { useQuery, useMutation, useLazyQuery } from '@apollo/react-hooks'

import { InlineLoader } from '../'
import { logger } from '../../utils'
import { useTabs } from '../../providers'
import { QUERIES, MUTATIONS } from './graphql'

const Context = React.createContext()

const initial = {
   mode: '',
   brand: { id: null },
   customer: { id: null },
   organization: { id: null },
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_MODE':
         return { ...state, mode: payload }
      case 'SET_BRAND':
         return {
            ...state,
            brand: {
               id: payload.id,
               title: payload?.title || '',
               domain: payload?.domain || 'N/A',
            },
         }
      case 'SET_CUSTOMER': {
         const result = processCustomer(payload, state.organization)

         return {
            ...state,
            customer: result,
         }
      }
      case 'SET_ORGANIZATION':
         return {
            ...state,
            organization: payload,
         }
      default:
         return state
   }
}

export const Provider = ({
   brandId = null,
   keycloakId = null,
   isModeTunnelOpen,
   children,
}) => {
   const { addTab } = useTabs()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(4)
   const [state, dispatch] = React.useReducer(reducers, initial)
   const [customerLoading, setIsCustomerLoading] = React.useState(true)
   const [organizationLoading, setOrganizationLoading] = React.useState(true)
   const [insertSubscriptionOccurenceCustomer] = useMutation(
      MUTATIONS.SUBSCRIPTION.OCCURENCE.CREATE,
      {
         onError: error => {
            logger(error)
         },
      }
   )
   useQuery(QUERIES.CUSTOMER.LIST, {
      skip: organizationLoading || !brandId || !keycloakId,
      variables: {
         where: {
            brandId: { _eq: brandId },
            customer: { keycloakId: { _eq: keycloakId } },
         },
      },
      onCompleted: ({ customers = [] } = {}) => {
         if (customers.length > 0) {
            const [customer] = customers
            dispatch({ type: 'SET_BRAND', payload: { id: brandId } })
            dispatch({ type: 'SET_CUSTOMER', payload: customer })
         }
         setIsCustomerLoading(false)
      },
      onError: error => {
         logger(error)
         setIsCustomerLoading(false)
         toast.error('Failed to fetch customer details.')
      },
   })

   const [insert, { loading: creatingCart }] = useMutation(
      MUTATIONS.CART.INSERT,
      {
         onCompleted: async ({ createCart = {} }) => {
            if (createCart?.id) {
               if (state.mode === 'SUBSCRIPTION') {
                  await insertSubscriptionOccurenceCustomer({
                     variables: {
                        object: {
                           cartId: createCart?.id,
                           keycloakId: state.customer.keycloakId,
                           brand_customerId: state.customer.brand_customerId,
                           subscriptionOccurenceId:
                              createCart?.subscriptionOccurenceId,
                        },
                     },
                  })
               }
               toast.success('Successfully created the cart.')
               const path = `/carts/${
                  state.mode === 'SUBSCRIPTION' ? 'subscription' : 'ondemand'
               }/${createCart?.id}`
               addTab(createCart?.id, path)
            }
         },
         onError: error => {
            logger(error)
            toast.error('Failed to create the cart.')
         },
      }
   )

   React.useEffect(() => {
      if (isModeTunnelOpen) {
         openTunnel(1)
         if (!brandId || !keycloakId) {
            setIsCustomerLoading(false)
         }
      }
   }, [isModeTunnelOpen])

   useQuery(QUERIES.ORGANIZATION, {
      onCompleted: ({ organizations = [] }) => {
         if (organizations.length > 0) {
            const [organization] = organizations
            dispatch({ type: 'SET_ORGANIZATION', payload: organization })
         }
         setOrganizationLoading(false)
      },
      onError: error => {
         logger(error)
         setOrganizationLoading(false)
         toast.error('Failed to fetch organization details!')
      },
   })

   const createCart = async (user = null, occurenceId = null) => {
      const cart = {}
      if (user) {
         const customer = await processCustomer(user, state.organization)

         cart.isTest = customer.isTest
         cart.customerId = customer.id
         cart.customerKeycloakId = customer.keycloakId
         cart.customerInfo = {
            customerFirstName: customer.firstName,
            customerLastName: customer.lastName,
            customerEmail: customer.email,
            customerPhone: customer.phoneNumber,
         }
      } else {
         cart.isTest = state.customer.isTest
         cart.customerId = state.customer.id
         cart.customerKeycloakId = state.customer.keycloakId
         cart.customerInfo = {
            customerFirstName: state.customer.firstName,
            customerLastName: state.customer.lastName,
            customerEmail: state.customer.email,
            customerPhone: state.customer.phoneNumber,
         }
      }

      cart.brandId = state.brand.id
      cart.source =
         state.mode === 'SUBSCRIPTION' ? 'subscription' : 'a-la-carte'
      if (state.mode === 'SUBSCRIPTION' && occurenceId) {
         cart.subscriptionOccurenceId = occurenceId
      }
      await insert({ variables: { object: cart } })
   }

   if (organizationLoading || customerLoading) return <InlineLoader />
   return (
      <Context.Provider
         value={{
            dispatch,
            ...state,
            tunnels: { list: tunnels, open: openTunnel, close: closeTunnel },
            methods: {
               cart: { create: { mutate: createCart, loading: creatingCart } },
            },
         }}
      >
         {children}
      </Context.Provider>
   )
}

export const useManual = () => React.useContext(Context)

const processCustomer = (user, organization) => {
   let customer = {}

   customer.isDemo = user.isDemo
   customer.isSubscriber = user.isSubscriber
   customer.subscriptionId = user.subscriptionId
   customer.brand_customerId = user.id
   customer.keycloakId = user.keycloakId
   customer.subscriptionPaymentMethodId = user.subscriptionPaymentMethodId

   customer.id = user.customer.id
   customer.email = user.customer.email
   customer.isTest = user.customer.isTest

   customer.firstName = user.customer.platform_customer?.firstName || ''
   customer.lastName = user.customer.platform_customer?.lastName || ''
   customer.fullName = user.customer.platform_customer?.fullName || ''
   customer.phoneNumber = user.customer.platform_customer?.phoneNumber || ''
   customer.stripeCustomerId =
      user.customer.platform_customer?.stripeCustomerId || ''

   if (
      organization.id &&
      organization?.stripeAccountType === 'standard' &&
      organization?.stripeAccountId
   ) {
      if (user.customer.platform_customer?.customerByClients.length > 0) {
         const [node = {}] =
            user.customer.platform_customer?.customerByClients || []
         if (node?.organizationStripeCustomerId) {
            customer.stripeCustomerId = node?.organizationStripeCustomerId
         }
      }
   }
   return customer
}
