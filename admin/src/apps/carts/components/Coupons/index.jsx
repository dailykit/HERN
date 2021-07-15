import React from 'react'
import { useParams } from 'react-router'
import { toast } from 'react-toastify'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import styled from 'styled-components'
import {
   Filler,
   Flex,
   Form,
   IconButton,
   Spacer,
   Text,
   TextButton,
   ButtonTile,
} from '@dailykit/ui'

import { CloseIcon } from '../../../../shared/assets/icons'
import { MUTATIONS, QUERIES } from '../../graphql'
import { logger } from '../../../../shared/utils'

const Coupon = ({ customer, tunnels }) => {
   const { id: cartId } = useParams()

   const { data, error } = useSubscription(QUERIES.CART.REWARDS, {
      variables: {
         cartId: +cartId,
         params: {
            cartId: +cartId,
            keycloakId: customer.keycloakId,
         },
      },
      onSubscriptionData: ({ subscriptionData: { data = {} } = {} }) => {
         if (data.cartRewards.length) {
            const isCouponValid = data.cartRewards.every(
               record => record.reward.condition.isValid
            )
            if (isCouponValid) {
               console.log('Coupon is valid!')
            } else {
               console.log('Coupon is not valid anymore!')
               toast.error('Coupon is not valid!')
               deleteCartRewards()
            }
         }
      },
   })
   if (error) {
      console.log('🚀 Coupon ~ error', error)
   }

   const [deleteCartRewards] = useMutation(MUTATIONS.CART.REWARDS.DELETE, {
      variables: {
         cartId: +cartId,
      },
      onCompleted: () => {
         toast.success('Coupon removed successfully!')
      },
      onError: error => {
         toast.error('Failed to delete coupon!')
         logger(error)
      },
   })

   return (
      <>
         {data?.cartRewards?.length ? (
            <Styles.Coupon
               container
               alignItems="center"
               justifyContent="space-between"
               padding="8px"
            >
               <Flex>
                  <Text as="text1">
                     {data.cartRewards[0].reward.coupon.code}
                  </Text>
                  <Spacer size="4px" />
                  <Text as="subtitle">Coupon applied!</Text>
               </Flex>
               <IconButton type="ghost" size="sm" onClick={deleteCartRewards}>
                  <CloseIcon color="#ec3333" />
               </IconButton>
            </Styles.Coupon>
         ) : (
            <ButtonTile
               type="secondary"
               text="Add Coupon"
               onClick={() => tunnels.coupons[1](1)}
            />
         )}
      </>
   )
}

export default Coupon

const Styles = {
   Coupon: styled(Flex)`
      background: #fff;
      border: 1px solid #ececec;
   `,
}
