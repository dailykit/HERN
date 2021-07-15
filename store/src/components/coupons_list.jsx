import React from 'react'
import { useSubscription } from '@apollo/react-hooks'
import { styled } from 'twin.macro'
import { useUser } from '../context'
import { COUPONS } from '../graphql'
import { useConfig } from '../lib'
import { useMenu } from '../sections/select-menu'
import { Loader } from './loader'
import { CloseIcon } from '../assets/icons'

export const CouponsList = ({ createOrderCartRewards, closeTunnel }) => {
   const { state } = useMenu()
   const { brand } = useConfig()
   const { user } = useUser()
   const { id } = state?.occurenceCustomer?.cart

   const [availableCoupons, setAvailableCoupons] = React.useState([])
   const [applying, setApplying] = React.useState(false)

   const { loading, error } = useSubscription(COUPONS, {
      variables: {
         params: {
            cartId: id,
            keycloakId: user?.keycloakId,
         },
         brandId: brand.id,
      },
      onSubscriptionData: data => {
         const coupons = data.subscriptionData.data.coupons
         setAvailableCoupons([
            ...coupons.filter(coupon => coupon.visibilityCondition.isValid),
         ])
      },
   })

   const handleApplyCoupon = coupon => {
      try {
         if (applying) return
         setApplying(true)
         const objects = []
         if (coupon.isRewardMulti) {
            for (const reward of coupon.rewards) {
               if (reward.condition.isValid) {
                  objects.push({ rewardId: reward.id, cartId: id })
               }
            }
         } else {
            const firstValidCoupon = coupon.rewards.find(
               reward => reward.condition.isValid
            )
            objects.push({
               rewardId: firstValidCoupon.id,
               cartId: id,
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

   const isButtonDisabled = coupon => {
      return !coupon.rewards.some(reward => reward.condition.isValid)
   }

   if (loading) return <Loader />
   return (
      <Styles.Wrapper>
         <Styles.ListHeader>
            <Styles.Heading>Available Coupons</Styles.Heading>
            <button tw="rounded-full border-2 border-green-400 h-6 w-8 flex items-center justify-center">
               <CloseIcon
                  size={16}
                  tw="stroke-current text-green-400"
                  onClick={closeTunnel}
               />
            </button>
         </Styles.ListHeader>
         {!availableCoupons.length && (
            <Styles.Title>No coupons available!</Styles.Title>
         )}
         {availableCoupons.map(coupon => (
            <Styles.Coupon key={coupon.id}>
               <Styles.CouponTop>
                  <Styles.Code>{coupon.code} </Styles.Code>
                  <Styles.Button
                     onClick={() => handleApplyCoupon(coupon)}
                     disabled={isButtonDisabled(coupon)}
                  >
                     Apply
                  </Styles.Button>
               </Styles.CouponTop>
               <Styles.CouponBottom>
                  <Styles.Title>{coupon.metaDetails.title}</Styles.Title>
                  <Styles.Description>
                     {coupon.metaDetails.description}
                  </Styles.Description>
               </Styles.CouponBottom>
            </Styles.Coupon>
         ))}
      </Styles.Wrapper>
   )
}

const Styles = {
   Wrapper: styled.div`
      padding: 16px;
   `,
   ListHeader: styled.div`
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
   `,
   Heading: styled.h3`
      color: gray;
   `,
   Coupon: styled.div`
      padding: 8px;
      border: 1px dashed #cacaca;
      margin-bottom: 16px;
      border-radius: 4px;
   `,
   CouponTop: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
   `,
   Code: styled.h3`
      text-transform: uppercase;
      font-weight: 500;
   `,
   Button: styled.button`
      color: teal;

      &:disabled {
         color: gray;
      }
   `,
   CouponBottom: styled.div``,
   Title: styled.p``,
   Description: styled.p``,
}
