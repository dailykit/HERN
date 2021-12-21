import { useLazyQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import React from 'react'
import { useToasts } from 'react-toast-notifications'
import { useUser, useTranslation } from '../context'
import { CART_REWARDS, MUTATIONS, SEARCH_COUPONS } from '../graphql'
import { useConfig } from '../lib'
import { useMenu } from '../sections/select-menu'
import { CouponsList } from './coupons_list'
import { Loader } from './loader'
import { Tunnel } from './tunnel'
import { useQueryParamState } from '../utils'

export const Coupon = ({ cart, config }) => {
   // use this component for kiosk as well
   const [orderInterfaceType] = useQueryParamState('oiType', 'Website')
   const { state = {} } =
      orderInterfaceType === 'Kiosk Ordering' ? {} : useMenu()
   const { user } = useUser()
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()
   const { id } =
      orderInterfaceType === 'Kiosk Ordering'
         ? cart
         : state?.occurenceCustomer?.cart
   const { t } = useTranslation()

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

   if (
      !data?.cartRewards[0]?.reward?.coupon?.code &&
      (isCouponFormOpen || orderInterfaceType === 'Kiosk Ordering')
   ) {
      return (
         <>
            <form
               className={
                  orderInterfaceType === 'Kiosk Ordering'
                     ? 'hern-kiosk-coupon__form'
                     : 'hern-coupon__form'
               }
               onSubmit={handleSubmit}
            >
               {orderInterfaceType !== 'Kiosk' && (
                  <button
                     className="hern-coupon__see-all-btn"
                     style={{
                        color: `${theme?.accent ? theme?.accent : 'teal'}`,
                     }}
                     type="reset"
                     onClick={() => setIsCouponListOpen(true)}
                  >
                     {t('See All Coupons')}
                  </button>
               )}
               <div
                  className={
                     orderInterfaceType === 'Kiosk Ordering'
                        ? 'hern-kiosk-coupon__input-wrapper'
                        : 'hern-coupon__input-wrapper'
                  }
               >
                  <label
                     className={
                        orderInterfaceType === 'Kiosk Ordering'
                           ? 'hern-kiosk-coupon__input-label'
                           : 'hern-coupon__input-label'
                     }
                     htmlFor="coupon"
                  >
                     {t('Coupon Code')}
                  </label>
                  <input
                     className={
                        orderInterfaceType === 'Kiosk Ordering'
                           ? 'hern-kiosk-coupon__input'
                           : 'hern-coupon__input'
                     }
                     type="text"
                     id="coupon"
                     required
                     value={typedCode}
                     onChange={e =>
                        setTypedCode(e.target.value.trim().toUpperCase())
                     }
                  />
               </div>
               <button
                  className={
                     orderInterfaceType === 'Kiosk Ordering'
                        ? 'hern-kiosk-coupon__form__apply-btn'
                        : 'hern-coupon__form__apply-btn'
                  }
                  type="submit"
                  disabled={searching || applying}
                  color={theme?.accent}
                  style={{
                     ...(orderInterfaceType === 'Kiosk' && {
                        border: `2px solid ${config.kioskSettings.theme.secondaryColor.value}`,
                        background: 'transparent',
                        padding: '.1em 2em',
                     }),
                  }}
               >
                  {searching || applying ? <Loader inline /> : t('Apply')}
               </button>
            </form>
            {orderInterfaceType === 'Kiosk' && (
               <CouponsList
                  createOrderCartRewards={createOrderCartRewards}
                  closeTunnel={() => setIsCouponListOpen(false)}
                  cart={cart}
                  config={config}
               />
            )}
            {orderInterfaceType !== 'Kiosk' && (
               <Tunnel
                  isOpen={isCouponListOpen}
                  toggleTunnel={setIsCouponListOpen}
                  style={{ zIndex: 1030 }}
               >
                  <CouponsList
                     createOrderCartRewards={createOrderCartRewards}
                     closeTunnel={() => setIsCouponListOpen(false)}
                     cart={cart}
                  />
               </Tunnel>
            )}
         </>
      )
   }
   return (
      <div
         className="hern-coupon"
         style={{
            color: `${theme?.accent ? theme?.accent : 'teal'}`,
            ...(orderInterfaceType === 'Kiosk' && {
               borderRadius: '1em',
               marginTop: '2.5em',
            }),
         }}
      >
         {data?.cartRewards?.length ? (
            <div className="hern-coupon__wrapper">
               <div>
                  <div
                     className={
                        orderInterfaceType === 'Kiosk Ordering'
                           ? 'hern-kiosk-coupon__coupon-code'
                           : 'hern-coupon__coupon-code'
                     }
                  >
                     {data.cartRewards[0].reward.coupon.code}
                  </div>
                  <div
                     className={
                        orderInterfaceType === 'Kiosk Ordering'
                           ? 'hern-kiosk-coupon__coupon-comment'
                           : 'hern-coupon__coupon-comment'
                     }
                  >
                     {t('Coupon applied!')}
                  </div>
               </div>
               <button
                  className={
                     orderInterfaceType === 'Kiosk Ordering'
                        ? 'hern-kiosk-coupon__coupon__cancel-btn'
                        : 'hern-coupon__coupon__cancel-btn'
                  }
                  onClick={deleteCartRewards}
               >
                  &times;
               </button>
            </div>
         ) : (
            <button
               className="hern-coupon__apply-btn"
               onClick={() => setIsCouponFormOpen(true)}
               style={{ color: `${theme?.accent ? theme?.accent : 'teal'}` }}
            >
               {t('Apply Coupon')}
            </button>
         )}
      </div>
   )
}
