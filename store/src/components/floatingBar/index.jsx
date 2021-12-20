import React from 'react'
import moment from 'moment'
import gql from 'graphql-tag'
import { useRouter } from 'next/router'
import tw from 'twin.macro'
import { useSubscription } from '@apollo/react-hooks'
import isEmpty from 'lodash/isEmpty'

import { Loader } from '../loader'
import { Tunnel } from '../tunnel'
import { Button } from '../button'
import { useUser } from '../../context'
import { HelperBar } from '../helper_bar'
import { useConfig, usePayment } from '../../lib'
import { formatCurrency } from '../../utils'
import { CloseIcon } from '../../assets/icons'

const FloatingBar = () => {
   const router = useRouter()
   const { brand } = useConfig()
   const { user } = useUser()
   const { initializePayment } = usePayment()
   const [isOpen, setIsOpen] = React.useState(false)
   const {
      loading,
      error,
      data: { cartPayments = {} } = {},
   } = useSubscription(CART_PAYMENTS_AGGREGATE, {
      skip: !brand?.id || !user.keycloakId,
      variables: {
         where: {
            cart: {
               brandId: { _eq: brand?.id },
               customerKeycloakId: { _eq: user?.keycloakId },
            },
            paymentStatus: {
               _nin: ['CANCELLED', 'FAILED', 'SUCCEEDED'],
            },
            isResultShown: {
               _eq: false,
            },
         },
      },
   })

   if (loading) return null
   if (error) return null
   if (cartPayments?.aggregate?.count === 0) return null
   return (
      <section tw="fixed flex items-center max-height[200px] width[85%] border-radius[6px] box-shadow[0px 4px 12px rgba(0, 0, 0, 0.2)] background[rgba(56, 161, 105, 0.8)] backdrop-blur-md bottom-0 right-0 left-0 margin[1rem auto] px-3 md:px-0">
         <div tw="p-4 flex flex-col items-start sm:(flex-row items-center justify-between)  mx-auto rounded text-white w-full">
            <div>
               <p tw="text-white font-semibold text-2xl">
                  Hi {user?.platform_customer?.fullName || ''}!
               </p>
               <p tw="text-white font-semibold text-lg">
                  Your payment for fulfillment date &nbsp;
                  {!isEmpty(cartPayments) &&
                  !isEmpty(cartPayments?.nodes) &&
                  cartPayments?.nodes[0]?.cart?.subscriptionOccurence
                     ?.fulfillmentDate
                     ? moment(
                          cartPayments?.nodes[0]?.cart?.subscriptionOccurence
                             ?.fulfillmentDate
                       ).format('MMM DD, YYYY')
                     : 'N/A'}{' '}
                  is pending. Complete your payment
               </p>
            </div>

            <button
               onClick={() =>
                  initializePayment(cartPayments?.nodes[0]?.cartId || null)
               }
               tw="bg-white color[#38A169] w-full md:(w-max) font-semibold text-lg rounded px-3 py-2"
            >
               Pay Now{' '}
               {!isEmpty(cartPayments) &&
                  !isEmpty(cartPayments?.nodes) &&
                  formatCurrency(Number(cartPayments?.nodes[0]?.amount || 0))}
            </button>
         </div>
      </section>
   )
}

const CART_PAYMENTS_AGGREGATE = gql`
   subscription carts($where: order_cartPayment_bool_exp!) {
      cartPayments: order_cartPayment_aggregate(
         where: $where
         limit: 1
         order_by: { updated_at: desc }
      ) {
         aggregate {
            count
         }
         nodes {
            id
            paymentStatus
            amount
            cartId
            cart {
               id
               subscriptionOccurence {
                  id
                  fulfillmentDate
               }
            }
         }
      }
   }
`
export default FloatingBar
