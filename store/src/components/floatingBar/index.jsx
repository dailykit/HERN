import React from 'react'
import moment from 'moment'
import gql from 'graphql-tag'
import { useRouter } from 'next/router'
import tw from 'twin.macro'
import { useSubscription } from '@apollo/react-hooks'

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
      <>
         <section tw="fixed bottom-0 right-0 left-0 mb-24 md:mb-3 px-3 md:px-0">
            <div tw="pl-3 pr-2 flex items-center justify-between mx-auto rounded bg-red-400 text-white border-white h-14 border w-full md:w-5/12">
               <span>Complete your payment:</span>
               <button
                  onClick={() =>
                     initializePayment(cartPayments.nodes[0]?.cartId)
                  }
                  tw="bg-red-600 text-white rounded px-3 py-2"
               >
                  Pay now{' '}
                  {formatCurrency(Number(cartPayments.nodes[0]?.amount) || 0)}
               </button>
            </div>
         </section>
         {/* <Tunnel isOpen={isOpen} toggleTunnel={setIsOpen} size="md">
            <Tunnel.Header title="Incomplete Payments">
               <Button size="sm" onClick={() => setIsOpen(false)}>
                  <CloseIcon size={20} tw="stroke-current" />
               </Button>
            </Tunnel.Header>
            <Tunnel.Body>
               {loading ? (
                  <Loader inline />
               ) : (
                  <>
                     {cartPayments?.aggregate?.count === 0 ? (
                        <HelperBar type="success">
                           <HelperBar.SubTitle>
                              No Incomplete payments
                           </HelperBar.SubTitle>
                        </HelperBar>
                     ) : (
                        <ul tw="space-y-3">
                           <li
                              key={cartPayment?.id}
                              tw="p-3 border border-gray-200 rounded"
                           >
                              <section tw="flex items-center justify-between">
                                 <span>
                                    Delivery on:&nbsp;
                                    {cartPayment.cart.subscriptionOccurence
                                       ?.fulfillmentDate
                                       ? moment(
                                            cartPayment.subscriptionOccurence
                                               ?.fulfillmentDate
                                         ).format('MMM DD, YYYY')
                                       : 'N/A'}
                                 </span>
                                 <button
                                    tw="uppercase rounded px-3 py-2 hover:bg-green-100 text-green-700"
                                    onClick={() => {
                                       initializePayment(cartPayment?.cartId)
                                       setIsOpen(false)
                                    }}
                                 >
                                    Pay{' '}
                                    {formatCurrency(
                                       Number(cartPayment?.amount) || 0
                                    )}
                                 </button>
                              </section>
                              <span>
                                 Payment Status: {cartPayment.paymentStatus}
                              </span>
                           </li>
                        </ul>
                     )}
                  </>
               )}
            </Tunnel.Body>
         </Tunnel> */}
      </>
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
