import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router'
import { Flex, Filler, useTunnel } from '@dailykit/ui'
import { useQuery, useSubscription } from '@apollo/react-hooks'

import { QUERIES } from '../../../graphql'
import { logger } from '../../../../../shared/utils'
import EmptyIllo from '../../../assets/svgs/EmptyIllo'
import {
   AddressTunnel,
   PaymentTunnel,
   ProductOptionsTunnel,
   FulfillmentTunnel,
   CustomizableComponentsTunnel,
   ComboComponentsTunnel,
   CouponsTunnel,
} from './tunnels'
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
   fulfillment: {},
   loyaltyPoints: {},
   productId: null,
   cart: {},
   location: { id: null },
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_INITIAL':
         return {
            ...state,
            brand: payload.brand,
            address: payload.address,
            customer: payload.customer,
            products: payload.products,
            paymentMethod: payload.paymentMethod,
            billing: payload.billing,
            fulfillment: payload.fulfillment,
            loyaltyPoints: payload.loyaltyPoints,
            location: payload.location,
         }
      case 'SET_CUSTOMER':
         return {
            ...state,
            customer: payload,
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
      case 'SET_PRODUCT_ID':
         return {
            ...state,
            productId: payload,
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
   const fulfillmentTunnels = useTunnel(1)
   const productOptionsTunnels = useTunnel(1)
   const customizableComponentTunnels = useTunnel(1)
   const comboComponentTunnels = useTunnel(1)
   const couponsTunnels = useTunnel(1)
   const [cartError, setCartError] = React.useState('')
   const [isCartLoading, setIsCartLoading] = React.useState(true)
   const [state, dispatch] = React.useReducer(reducers, initial)
   const [organizationLoading, setOrganizationLoading] = React.useState(true)
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
   const { loading, error } = useSubscription(QUERIES.CART.ONE, {
      variables: { id: params.id },
      onSubscriptionData: ({
         subscriptionData: { data: { cart = {} } = {} } = {},
      }) => {
         if (cart && !isEmpty(cart)) {
            dispatch({
               type: 'SET_INITIAL',
               payload: {
                  brand: cart.brand,
                  products: cart.products,
                  customer: {
                     id: cart?.customerId,
                  },
                  paymentMethod: { id: cart.paymentMethodId },
                  ...(cart.address?.id && { address: cart.address }),
                  billing: {
                     tax: cart?.tax || 0,
                     discount: cart?.discount || 0,
                     itemTotal: cart?.itemTotal || 0,
                     totalPrice: cart?.totalPrice || 0,
                     deliveryPrice: cart?.deliveryPrice || 0,
                     walletAmountUsed: cart?.walletAmountUsed || 0,
                     loyaltyPointsUsed: cart?.loyaltyPointsUsed || 0,
                  },
                  fulfillment: cart?.fulfillmentInfo,
                  loyaltyPoints: {
                     used: cart.loyaltyPointsUsed,
                     usable: cart.loyaltyPointsUsable,
                  },
                  location: {
                     id: cart.locationId,
                  },
               },
            })
            dispatch({ type: 'SET_CART', payload: cart })
            refetchCustomer()
            if (cart?.paymentMethodId) {
               refetchPaymentMethod()
            }
            setCartError('')
         } else {
            setCartError('No such cart exists!')
         }
         setIsCartLoading(false)
      },
   })

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
            state,
            dispatch,
            cart: state.cart,
            brand: state.brand,
            address: state.address,
            fulfillment: state.fulfillment,
            billing: state.billing,
            products: state.products,
            customer: state.customer,
            organization: state.organization,
            paymentMethod: state.paymentMethod,
            loyaltyPoints: state.loyaltyPoints,
            locationId: state.location?.id,
            tunnels: {
               address: addressTunnels,
               fulfillment: fulfillmentTunnels,
               productOptions: productOptionsTunnels,
               customizableComponents: customizableComponentTunnels,
               comboComponents: comboComponentTunnels,
               coupons: couponsTunnels,
            },
         }}
      >
         {children}
         <FulfillmentTunnel panel={fulfillmentTunnels} />
         <AddressTunnel panel={addressTunnels} />
         <ProductOptionsTunnel panel={productOptionsTunnels} />
         <CustomizableComponentsTunnel panel={customizableComponentTunnels} />
         <ComboComponentsTunnel panel={comboComponentTunnels} />
         <CouponsTunnel panel={couponsTunnels} />
      </Context.Provider>
   )
}

export const useManual = () => React.useContext(Context)

const processCustomer = (user, organization) => {
   let customer = {}

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
   customer.paymentCustomerId =
      user.customer.platform_customer?.paymentCustomerId || ''

   return customer
}
