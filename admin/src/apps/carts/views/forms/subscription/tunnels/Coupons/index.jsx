import React from 'react'
import styled from 'styled-components'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Flex, Spacer, Text, Tunnel, TunnelHeader, Tunnels } from '@dailykit/ui'
import { useParams } from 'react-router'
import { toast } from 'react-toastify'
import { InlineLoader } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { MUTATIONS, QUERIES } from '../../../../../graphql'
import { useManual } from '../../state'

export const CouponsTunnel = ({ panel }) => {
   const [tunnels] = panel
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel size="md">
            <Content panel={panel} />
         </Tunnel>
      </Tunnels>
   )
}

const Content = ({ panel }) => {
   const [, , closeTunnel] = panel
   const { brand, customer } = useManual()
   const { id: cartId } = useParams()

   const [availableCoupons, setAvailableCoupons] = React.useState([])
   const [applying, setApplying] = React.useState(false)
   const [selectedCoupon, setSelectedCoupon] = React.useState(null)

   const { loading, error } = useSubscription(QUERIES.COUPONS.LIST, {
      variables: {
         params: {
            cartId: +cartId,
            keycloakId: customer.keycloakId,
         },
         brandId: brand.id,
      },
      onSubscriptionData: data => {
         console.log(data)
         const coupons = data.subscriptionData.data.coupons
         setAvailableCoupons([
            ...coupons.filter(coupon => coupon.visibilityCondition.isValid),
         ])
      },
   })
   if (error) {
      console.log('🚀 ~ CouponsList ~ error', error)
   }

   const [createOrderCartRewards, { loading: inFlight }] = useMutation(
      MUTATIONS.CART.REWARDS.CREATE,
      {
         onCompleted: () => {
            toast.success('Coupon applied successfully!')
            closeTunnel(1)
         },
         onError: error => {
            toast.error('Failed to apply coupon!')
            logger(error)
         },
      }
   )

   const handleApplyCoupon = () => {
      try {
         if (applying) return
         setApplying(true)
         const objects = []
         if (selectedCoupon.isRewardMulti) {
            for (const reward of selectedCoupon.rewards) {
               if (reward.condition.isValid) {
                  objects.push({ rewardId: reward.id, cartId: +cartId })
               }
            }
         } else {
            const firstValidCoupon = selectedCoupon.rewards.find(
               reward => reward.condition.isValid
            )
            objects.push({
               rewardId: firstValidCoupon.id,
               cartId: +cartId,
            })
         }
         createOrderCartRewards({
            variables: {
               objects,
            },
         })
      } catch (err) {
         console.log(err)
      } finally {
         setApplying(false)
      }
   }

   return (
      <>
         <TunnelHeader
            title="Available Coupons"
            close={() => closeTunnel(1)}
            right={{
               title: 'Apply',
               disabled: !selectedCoupon,
               isLoading: applying || inFlight,
               action: handleApplyCoupon,
            }}
         />
         <Flex padding="16px" overflowY="auto" height="calc(100vh - 196px)">
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  {availableCoupons.length ? (
                     <>
                        {availableCoupons.map(coupon => (
                           <Styles.Coupon
                              key={coupon.id}
                              padding="16px"
                              disabled={
                                 !coupon.rewards.some(
                                    reward => reward.condition.isValid
                                 )
                              }
                              selected={selectedCoupon?.id === coupon.id}
                              onClick={() => {
                                 if (
                                    coupon.rewards.some(
                                       reward => reward.condition.isValid
                                    )
                                 ) {
                                    setSelectedCoupon(coupon)
                                 }
                              }}
                           >
                              <Text as="h2">{coupon.code} </Text>
                              <Spacer size="12px" />
                              <Text as="text2">{coupon.metaDetails.title}</Text>
                              <Spacer size="2px" />
                              <Text as="text3">
                                 {coupon.metaDetails.description}
                              </Text>
                           </Styles.Coupon>
                        ))}
                     </>
                  ) : (
                     <Text as="text2"> No coupons available! </Text>
                  )}
               </>
            )}
         </Flex>
      </>
   )
}

const Styles = {
   Coupon: styled(Flex)`
      margin-bottom: 16px;
      border: 1px solid ${props => (props.selected ? '#5d41db' : '#efefef')};
      cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
      opacity: ${props => (props.disabled ? '0.7' : '1')};
   `,
}
