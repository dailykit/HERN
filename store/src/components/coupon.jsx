import { useLazyQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import React from 'react'
import { useToasts } from 'react-toast-notifications'
import tw, { styled } from 'twin.macro'
import { useUser } from '../context'
import { CART_REWARDS, MUTATIONS, SEARCH_COUPONS } from '../graphql'
import { useConfig } from '../lib'
import { useMenu } from '../sections/select-menu'
import { CouponsList } from './coupons_list'
import { Loader } from './loader'
import { Tunnel } from './tunnel'

export const Coupon = ({}) => {
   const { state } = useMenu()
   const { user } = useUser()
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()
   const { id } = state?.occurenceCustomer?.cart

   const theme = configOf('theme-color', 'visual')
   // const theme = settings['visual']['theme-color']

   const [isCouponListOpen, setIsCouponListOpen] = React.useState(false)
   const [isCouponFormOpen, setIsCouponFormOpen] = React.useState(false)
   const [typedCode, setTypedCode] = React.useState('')

   // Mutation
   const [createOrderCartRewards, { loading: applying }] = useMutation(
      MUTATIONS.CART_REWARDS.CREATE,
      {
         onCompleted: () => {
            addToast('Coupon applied!', { appearance: 'success' })
            setIsCouponListOpen(false)
            setIsCouponFormOpen(false)
         },
         onError: error => {
            console.log(error)
         },
      }
   )

   const [searchCoupons, { loading: searching }] = useLazyQuery(
      SEARCH_COUPONS,
      {
         onCompleted: data => {
            console.log(data)
            if (data.coupons.length) {
               const [coupon] = data.coupons
               const objects = []
               if (coupon.isRewardMulti) {
                  for (const reward of coupon.rewards) {
                     if (reward.condition.isValid) {
                        objects.push({ rewardId: reward.id, cartId: id })
                     }
                  }
               } else {
                  const firstValidCouponIndex = coupon.rewards.findIndex(
                     reward => reward.condition.isValid
                  )
                  if (firstValidCouponIndex !== -1) {
                     objects.push({
                        rewardId: coupon.rewards[firstValidCouponIndex].id,
                        cartId: id,
                     })
                  }
               }
               if (objects.length) {
                  createOrderCartRewards({
                     variables: {
                        objects,
                     },
                  })
               } else {
                  addToast('Coupon is not applicable!', { appearance: 'error' })
               }
            } else {
               addToast('Coupon is not valid!', { appearance: 'error' })
            }
         },
         onError: error => {
            console.log(error)
            addToast('Something went wrong!', { appearance: 'error' })
         },
         fetchPolicy: 'cache-and-network',
      }
   )

   const { data, error } = useSubscription(CART_REWARDS, {
      variables: {
         cartId: id,
         params: {
            cartId: id,
            keycloakId: user?.keycloakId,
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
               addToast('Coupon is not valid!', { appearance: 'error' })
               deleteCartRewards()
            }
         }
      },
   })
   if (error) {
      console.log('🚀 Coupon ~ error', error)
   }

   const [deleteCartRewards] = useMutation(MUTATIONS.CART_REWARDS.DELETE, {
      variables: {
         cartId: id,
      },
      onError: err => console.log(err),
   })

   const handleSubmit = e => {
      try {
         e.preventDefault()
         searchCoupons({
            variables: {
               typedCode,
               brandId: brand.id,
               params: {
                  cartId: id,
                  keycloakId: user?.keycloakId,
               },
            },
         })
      } catch (err) {
         console.log(err)
         addToast('Something went wrong!', { appearance: 'error' })
      }
   }

   if (isCouponFormOpen) {
      return (
         <>
            <Styles.Form onSubmit={handleSubmit}>
               <Styles.GhostButton
                  color={theme?.accent}
                  type="reset"
                  onClick={() => setIsCouponListOpen(true)}
               >
                  See All Coupons
               </Styles.GhostButton>
               <Styles.InputWrapper>
                  <Styles.Label> Coupon Code </Styles.Label>
                  <Styles.Input
                     type="text"
                     required
                     value={typedCode}
                     onChange={e =>
                        setTypedCode(e.target.value.trim().toUpperCase())
                     }
                  />
               </Styles.InputWrapper>
               <Styles.Button
                  type="submit"
                  disabled={searching || applying}
                  color={theme?.accent}
               >
                  {searching || applying ? <Loader inline /> : 'Apply'}
               </Styles.Button>
            </Styles.Form>
            <Tunnel
               isOpen={isCouponListOpen}
               toggleTunnel={setIsCouponListOpen}
               style={{ zIndex: 1030 }}
            >
               <CouponsList
                  createOrderCartRewards={createOrderCartRewards}
                  closeTunnel={() => setIsCouponListOpen(false)}
               />
            </Tunnel>
         </>
      )
   }
   return (
      <Styles.Wrapper color={theme?.accent}>
         {data?.cartRewards?.length ? (
            <Styles.CouponWrapper>
               <Styles.CouponDetails>
                  <Styles.CouponCode>
                     {data.cartRewards[0].reward.coupon.code}
                  </Styles.CouponCode>
                  <Styles.Comment>Coupon applied!</Styles.Comment>
               </Styles.CouponDetails>
               <Styles.Cross onClick={deleteCartRewards}>&times;</Styles.Cross>
            </Styles.CouponWrapper>
         ) : (
            <Styles.Button
               onClick={() => setIsCouponFormOpen(true)}
               color={theme?.accent}
            >
               Apply Coupon
            </Styles.Button>
         )}
      </Styles.Wrapper>
   )
}

const Styles = {
   Wrapper: styled.div`
      ${tw`mt-2`}
      border: 1px dashed ${props => props.color || 'teal'};
      padding: 8px;
      border-radius: 2px;
   `,
   Button: styled.button`
      color: ${props => props.color || 'teal'};
      padding: 4px;
      text-transform: uppercase;
      text-align: center;
      width: 100%;
   `,
   Cross: styled.span`
      font-size: 18px;
      cursor: pointer;
   `,
   CouponWrapper: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
   `,
   CouponDetails: styled.div``,
   CouponCode: styled.h4`
      font-weight: 700;
      text-transform: uppercase;
      padding-bottom: 0;
   `,
   Comment: styled.small`
      color: gray;
   `,
   Form: styled.form`
      ${tw`mt-2`}
      border: 1px solid #efefef;
      padding: 8px;
      border-radius: 2px;
      display: flex;
      align-items: flex-end;
      position: relative;
   `,
   InputWrapper: styled.div``,
   Label: styled.label``,
   Input: styled.input`
      border: 1px solid #cacaca;
      padding: 4px;
      border-radius: 2px;
      display: block;
   `,
   Help: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
   `,
   Small: styled.small``,
   Stat: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
   `,
   Text: styled.span``,
   Cross: styled.span`
      color: #ff5a52;
      font-size: 18px;
      cursor: pointer;
   `,
   GhostButton: styled.button`
      position: absolute;
      top: 4px;
      right: 4px;
      font-size: 12px;
      color: ${props => props.color || 'teal'};

      &:hover {
         text-decoration: underline;
      }
   `,
}
