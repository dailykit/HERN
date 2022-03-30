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
   const [isOpen, setIsOpen] = React.useState(true)
   const [cartPayment, setCartPayment] = React.useState(null)
   const [isLoading, setIsLoading] = React.useState(true)
   const { error, data: { cartPayments = [] } = {} } = useSubscription(
      CART_PAYMENTS_AGGREGATE,
      {
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
         onSubscriptionData: ({
            subscriptionData: { data: { cartPayments = [] } = {} } = {},
         } = {}) => {
            if (!isEmpty(cartPayments)) {
               const [requiredCartPayment] = cartPayments
               setCartPayment(requiredCartPayment)
               setIsLoading(false)
            }
         },
      }
   )

   const pendingBarMsg = () => {
      if (
         !isEmpty(cartPayment) &&
         !isEmpty(cartPayment?.cart?.subscriptionOccurence)
      ) {
         if (!cartPayment?.cart?.subscriptionOccurence?.fulfillmentDate)
            return 'N/A'
         return ` Your payment for fulfillment date ${moment(
            cartPayment?.cart?.subscriptionOccurence?.fulfillmentDate
         ).format('MMM DD, YYYY')} is pending. Complete your payment`
      } else {
         console.log('cartPayment', cartPayment)
         const namesArr = cartPayment?.cart?.cartItems.map(
            item => item?.product?.name
         )
         console.log(namesArr, 'namesArr')
         let nameString = namesArr.toString()
         if (namesArr.length > 2) {
            const updatedNamesArr = namesArr.slice(0, 2)
            nameString = `${updatedNamesArr.toString()} and ${
               namesArr.length - 2
            } more`
         }
         return `Your payment for ${nameString} is pending. Complete your payment`
      }
   }

   const onPayHandler = () => {
      console.log('cartPayment on pay1', cartPayment)
      if (!isEmpty(cartPayment)) {
         console.log('cartPayment on pay', cartPayment)
         initializePayment(cartPayment?.cartId)
      }
   }

   if (isLoading) return null
   if (error) {
      console.error(error)
      return null
   }
   return (
      <>
         {isOpen && (
            <section tw="fixed flex items-center max-height[200px] z-index[100] width[85%] border-radius[6px] box-shadow[0px 4px 12px rgba(0, 0, 0, 0.2)] background[rgba(56, 161, 105, 0.8)] backdrop-blur-md bottom-0 right-0 left-0 margin[1rem auto] px-3 md:px-0">
               <div tw="p-4 flex flex-col items-start  mx-auto rounded text-white w-full">
                  <div tw="padding[1rem 0] flex items-center justify-between w-full">
                     <p tw="text-white font-semibold text-2xl">
                        Hi {user?.platform_customer?.fullName || ''}!
                     </p>
                     <span onClick={() => setIsOpen(false)}>
                        <CloseIcon
                           size={16}
                           stroke="currentColor"
                           color="#fff"
                        />
                     </span>
                  </div>
                  <div tw="w-full flex flex-col items-start sm:(flex-row items-center justify-between) ">
                     <p tw="text-white font-semibold text-lg">
                        {pendingBarMsg()}
                     </p>
                     <button
                        onClick={onPayHandler}
                        tw="bg-white color[#38A169] w-full md:(w-max) font-semibold text-lg rounded px-3 py-2"
                     >
                        Pay Now{' '}
                        {!isEmpty(cartPayment) &&
                           formatCurrency(Number(cartPayment?.amount || 0))}
                     </button>
                  </div>
               </div>
            </section>
         )}
      </>
   )
}

const CART_PAYMENTS_AGGREGATE = gql`
   subscription CART_PAYMENTS_AGGREGATE($where: order_cartPayment_bool_exp!) {
      cartPayments(where: $where, limit: 1, order_by: { updated_at: desc }) {
         id
         paymentStatus
         amount
         cartId
         cart {
            id
            cartItems(where: { level: { _eq: 1 } }) {
               product {
                  id
                  name
               }
            }
            subscriptionOccurence {
               id
               fulfillmentDate
            }
         }
      }
   }
`
export default FloatingBar
