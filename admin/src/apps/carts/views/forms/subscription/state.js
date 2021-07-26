import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router'
import { Flex, Filler, useTunnel } from '@dailykit/ui'
import { useQuery, useSubscription, useMutation } from '@apollo/react-hooks'

import { QUERIES, MUTATIONS } from '../../../graphql'
import { logger } from '../../../../../shared/utils'
import EmptyIllo from '../../../assets/svgs/EmptyIllo'
import { FulfillmentTunnel, CouponsTunnel } from './tunnels'
import { InlineLoader } from '../../../../../shared/components'

const Context = React.createContext()

const initial = {
   brand: { id: null },
   customer: { id: null },
   address: { id: null },
   paymentMethod: { id: null },
   organization: { id: null },
   products: { aggregate: { count: 0 } },
   billing: {},
   loyaltyPoints: {},
   occurenceCustomer: {},
   cart: {},
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_INITIAL':
         return {
            ...state,
            brand: payload.brand,
            customer: payload.customer,
            products: payload.products,
            address: payload.address,
            paymentMethod: payload.paymentMethod,
            loyaltyPoints: payload.loyaltyPoints,
            fulfillmentInfo: payload.fulfillmentInfo,
            occurenceCustomer: payload.occurenceCustomer,
            subscriptionOccurence: payload.subscriptionOccurence,
            subscriptionOccurenceId: payload.subscriptionOccurenceId,
            ...(payload.billing && {
               billing: {
                  discount: payload.billing?.discount,
                  itemTotal: payload.billing?.itemTotal,
                  totalPrice: payload.billing?.totalPrice,
                  isTaxIncluded: payload.billing?.isTaxIncluded,
                  deliveryPrice: payload.billing?.deliveryPrice,
                  walletAmountUsed: payload.billing?.walletAmountUsed,
                  loyaltyPointsUsed: payload.billing?.loyaltyPointsUsed,
               },
            }),
         }
      case 'SET_CUSTOMER':
         return {
            ...state,
            customer: payload,
         }
      case 'SET_ADDRESS':
         return {
            ...state,
            address: payload,
         }
      case 'SET_PAYMENT':
         return {
            ...state,
            paymentMethod: payload,
         }
      case 'SET_ORGANIZATION':
         return {
            ...state,
            organization: payload,
         }
      case 'SET_CART': {
         const { id, orderId, paymentStatus } = payload
         return {
            ...state,
            cart: {
               id,
               orderId,
               paymentStatus,
            },
         }
      }
      default:
         return state
   }
}

export const ManualProvider = ({ children }) => {
   const params = useParams()
   const addressTunnels = useTunnel(1)

   const couponsTunnels = useTunnel(1)
   const [cartError, setCartError] = React.useState('')
   const [isCartLoading, setIsCartLoading] = React.useState(true)
   const [state, dispatch] = React.useReducer(reducers, initial)
   const [organizationLoading, setOrganizationLoading] = React.useState(true)
   const { refetch: refetchAddress } = useQuery(QUERIES.CUSTOMER.ADDRESS.LIST, {
      skip: !state.customer?.subscriptionAddressId,
      notifyOnNetworkStatusChange: true,
      variables: {
         where: { id: { _eq: state.customer?.subscriptionAddressId } },
      },
      onCompleted: ({ addresses = [] } = {}) => {
         if (addresses.length > 0) {
            const [address] = addresses
            if (!state.address?.id) {
               dispatch({ type: 'SET_ADDRESS', payload: address })
            }
         }
      },
   })
   const { refetch: refetchPaymentMethod } = useQuery(
      QUERIES.CUSTOMER.PAYMENT_METHODS.ONE,
      {
         skip: !state.paymentMethod?.id,
         notifyOnNetworkStatusChange: true,
         variables: { id: state.paymentMethod?.id },
         onCompleted: ({ paymentMethod = {} } = {}) => {
            if (!isEmpty(paymentMethod)) {
               dispatch({ type: 'SET_PAYMENT', payload: paymentMethod })
            }
         },
         onError: () => {
            toast.error(
               'Failed to get payment method details, please refresh the page.'
            )
         },
      }
   )
   const { refetch: refetchCustomer } = useQuery(QUERIES.CUSTOMER.LIST, {
      skip: !state.brand?.id || !state.customer?.id,
      notifyOnNetworkStatusChange: true,
      variables: {
         where: {
            brandId: { _eq: state.brand?.id },
            customer: { id: { _eq: state.customer?.id } },
         },
      },
      onCompleted: ({ customers = [] } = {}) => {
         if (!isEmpty(customers)) {
            const [node] = customers
            dispatch({
               type: 'SET_CUSTOMER',
               payload: processCustomer(node, state.organization),
            })
         }
      },
      onError: () => {
         toast.error('Failed to get customer details, please refresh the page.')
      },
   })
   const [updateBrandCustomer] = useMutation(MUTATIONS.BRAND.CUSTOMER.UPDATE, {
      refetchQueries: ['customers'],
      onError: error => logger(error),
   })
   const { loading, error } = useSubscription(QUERIES.CART.ONE, {
      variables: { id: params.id },
      onSubscriptionData: async ({
         subscriptionData: { data: { cart = {} } = {} } = {},
      }) => {
         if (cart && !isEmpty(cart)) {
            dispatch({
               type: 'SET_INITIAL',
               payload: {
                  brand: cart.brand,
                  billing: cart.billing,
                  loyaltyPoints: {
                     used: cart.loyaltyPointsUsed,
                     usable: cart.loyaltyPointsUsable,
                  },
                  products: cart.products,
                  customer: { id: cart?.customerId },
                  address: cart.address || { id: null },
                  fulfillmentInfo: cart.fulfillmentInfo,
                  paymentMethod: { id: cart.paymentMethodId },
                  occurenceCustomer: cart.occurenceCustomer || {},
                  subscriptionOccurence: cart.subscriptionOccurence,
                  subscriptionOccurenceId: cart.subscriptionOccurenceId,
               },
            })
            dispatch({ type: 'SET_CART', payload: cart })
            if (
               !cart.occurenceCustomer?.itemCountValid &&
               state.customer.subscriptionOnboardStatus !== 'SELECT_MENU'
            ) {
               await updateBrandCustomer({
                  variables: {
                     where: { id: { _eq: state.customer.brand_customerId } },
                     _set: { subscriptionOnboardStatus: 'SELECT_MENU' },
                  },
               })
            }
            refetchCustomer()
            if (cart?.paymentMethodId) {
               refetchPaymentMethod()
            }
            refetchAddress()
            setCartError('')
         } else {
            setCartError('No such cart exists!')
         }
         setIsCartLoading(false)
      },
   })
   useQuery(QUERIES.ORGANIZATION, {
      onCompleted: ({ organizations = [] }) => {
         if (organizations.length > 0) {
            const [organization] = organizations
            dispatch({ type: 'SET_ORGANIZATION', payload: organization })
         }
         setOrganizationLoading(false)
      },
      onError: () => {
         setOrganizationLoading(false)
         toast.error('Failed to fetch organization details!')
      },
   })

   if (!loading && error) {
      setIsCartLoading(false)
      logger(error)
      toast.error('Something went wrong, please refresh the page.')
      return
   }
   if (organizationLoading || isCartLoading) return <InlineLoader />
   if (cartError.trim())
      return (
         <Flex container alignItems="center" justifyContent="center">
            <Filler
               width="360px"
               message="There's no cart linked to this cart id"
               illustration={<EmptyIllo />}
            />
         </Flex>
      )
   return (
      <Context.Provider
         value={{
            dispatch,
            ...state,
            billing: state.billing,
            loyaltyPoints: state.loyaltyPoints,
            tunnels: {
               address: addressTunnels,
               coupons: couponsTunnels,
            },
         }}
      >
         {children}
         <FulfillmentTunnel panel={addressTunnels} />
         <CouponsTunnel panel={couponsTunnels} />
      </Context.Provider>
   )
}

export const useManual = () => React.useContext(Context)

const processCustomer = (user, organization) => {
   let customer = {}

   customer.brand_customerId = user.id
   customer.keycloakId = user.keycloakId
   customer.subscriptionId = user.subscriptionId
   customer.subscriptionAddressId = user.subscriptionAddressId
   customer.subscriptionOnboardStatus = user.subscriptionOnboardStatus
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
   return customer
}
