import React from 'react'
import { indexOf, isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router'
import { Flex, Filler, useTunnel } from '@dailykit/ui'
import { useQuery, useSubscription, useMutation } from '@apollo/react-hooks'

import { QUERIES, MUTATIONS, GET_BRAND_LOCATION } from '../../../graphql'
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
   location: {
      id: null,
   },
   brandLocation: null,
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
            location: payload.location,
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
      case 'SET_BRAND_LOCATION': {
         return {
            ...state,
            brandLocation: payload,
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
   const [
      isCartValidByProductAvailability,
      setIsCartValidByProductAvailability,
   ] = React.useState(false)
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
   useQuery(GET_BRAND_LOCATION, {
      skip: !state.brand?.id || !state.location?.id,
      variables: {
         where: {
            brandId: { _eq: state.brand?.id },
            locationId: { _eq: state.location?.id },
         },
      },
      onCompleted: ({ brandLocations = [] } = {}) => {
         if (!isEmpty(brandLocations)) {
            dispatch({ type: 'SET_BRAND_LOCATION', payload: brandLocations[0] })
         }
      },
   })
   const argsForByLocation = React.useMemo(
      () => ({
         brandId: state.brand?.id,
         locationId: state.location?.id,
         brand_locationId: state.brandLocation?.id,
      }),
      [state.brand, state.location?.id, state.brandLocation?.id]
   )
   const { loading, error } = useSubscription(QUERIES.CART.ONE, {
      variables: { id: params.id, params: argsForByLocation },
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
                  location: {
                     id: cart.locationId,
                  },
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

   // check availability of product in cart
   React.useEffect(() => {
      if (state.products.aggregate.count) {
         for (let node of state.products.nodes) {
            let isCartValid = true
            const selectedProductOption = node.product.productOptions.find(
               option => option.id === node.childs[0]?.productOption?.id
            )
            if (!isEmpty(selectedProductOption)) {
               isCartValid =
                  node.product.isAvailable &&
                  node.product.isPublished &&
                  selectedProductOption.isAvailable &&
                  selectedProductOption.isPublished
            } else {
               isCartValid =
                  node.product.isAvailable && node.product.isPublished
            }

            if (!isCartValid) {
               setIsCartValidByProductAvailability(false)
               return
            }
            if (
               indexOf(state.products.nodes, node) ===
               state.products.nodes.length - 1
            ) {
               if (isCartValid) {
                  setIsCartValidByProductAvailability(true)
               }
            }
         }
      }
   }, [state.products])

   if (!loading && error) {
      setIsCartLoading(false)
      logger(error)
      toast.error('Something went wrong, please refresh the page.')
      return
   }
   if (isCartLoading) return <InlineLoader />
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
            isCartValidByProductAvailability,
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
   customer.paymentCustomerId =
      user.customer.platform_customer?.paymentCustomerId || ''
   return customer
}
