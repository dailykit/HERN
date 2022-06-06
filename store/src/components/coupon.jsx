import { useLazyQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import React from 'react'
import { useToasts } from 'react-toast-notifications'
import { useUser, useTranslation } from '../context'
import { CART_REWARDS, MUTATIONS, SEARCH_COUPONS } from '../graphql'
import { useConfig } from '../lib'
// import { useMenu, MenuProvider } from '../sections/select-menu'
import { CouponsList } from './coupons_list'
import { Loader } from './loader'
import { Tunnel } from '.'
import { useQueryParamState, isKiosk } from '../utils'
import { CouponIcon, ChevronIcon, CouponTicketIcon } from '../assets/icons'
import { Button } from '.'

const Coupon_ = ({
   cart,
   config,
   upFrontLayout = false,
   tunnel = false,
   listOntunnnel = true,
}) => {
   // use this component for kiosk as well
   const [orderInterfaceType] = useQueryParamState('oiType', 'Website')
   const isKioskMode = React.useMemo(() => {
      return isKiosk()
   }, [])
   const { user } = useUser()
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()
   const { id } = cart
   const { t } = useTranslation()

   const theme = configOf('theme-color', 'visual')
   // const theme = settings['visual']['theme-color']

   const [isCouponListOpen, setIsCouponListOpen] = React.useState(false)
   const [isCouponFormOpen, setIsCouponFormOpen] = React.useState(false)
   const [isCouponListTunnelOpen, setIsCouponListTunnelOpen] =
      React.useState(false)
   const [typedCode, setTypedCode] = React.useState('')

   // Mutation
   const [createOrderCartRewards, { loading: applying }] = useMutation(
      MUTATIONS.CART_REWARDS.CREATE,
      {
         refetchQueries: ['subscriptionOccurenceCustomer'],
         onCompleted: () => {
            addToast(t('Coupon applied!'), { appearance: 'success' })
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
                  addToast(t('Coupon is not applicable!'), {
                     appearance: 'error',
                  })
               }
            } else {
               addToast(t('Coupon is not valid!'), { appearance: 'error' })
            }
         },
         onError: error => {
            console.log(error)
            addToast(t('Something went wrong!'), { appearance: 'error' })
         },
         fetchPolicy: 'cache-and-network',
      }
   )

   const { data, error } = useSubscription(CART_REWARDS, {
      variables: {
         where: {
            cartId: {
               _eq: id,
            },
            cart: {
               paymentStatus: {
                  _eq: 'PENDING',
               },
               status: {
                  _eq: 'CART_PENDING',
               },
            },
         },
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
               addToast(t('Coupon is not valid!'), { appearance: 'error' })
               deleteCartRewards()
            }
         }
      },
   })
   if (error) {
      console.log('🚀 Coupon ~ error', error)
   }

   const [deleteCartRewards] = useMutation(MUTATIONS.CART_REWARDS.DELETE, {
      refetchQueries: ['subscriptionOccurenceCustomer'],
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
         addToast(t('Something went wrong!'), { appearance: 'error' })
      }
   }

   if (
      !data?.cartRewards[0]?.reward?.coupon?.code &&
      (isCouponFormOpen || isKioskMode || upFrontLayout)
   ) {
      return (
         <>
            <form
               className={
                  isKioskMode ? 'hern-kiosk-coupon__form' : 'hern-coupon__form'
               }
               onSubmit={handleSubmit}
            >
               {!isKioskMode && !upFrontLayout && (
                  <button
                     className="hern-coupon__see-all-btn"
                     style={{
                        color: `var(--hern-accent)`,
                     }}
                     type="reset"
                     onClick={() => setIsCouponListOpen(true)}
                  >
                     {t('See All Coupons')}
                  </button>
               )}
               <div
                  className={
                     isKioskMode
                        ? 'hern-kiosk-coupon__input-wrapper'
                        : upFrontLayout
                        ? 'hern-upfront-coupon__input-wrapper'
                        : 'hern-coupon__input-wrapper'
                  }
               >
                  {false && !isKioskMode && upFrontLayout && <CouponHeader />}

                  <label
                     className={
                        isKioskMode
                           ? 'hern-kiosk-coupon__input-label'
                           : upFrontLayout
                           ? 'hern-upfront-coupon__input-label'
                           : 'hern-coupon__input-label'
                     }
                     htmlFor="coupon"
                  >
                     {t('Coupon Code')}
                  </label>
                  <input
                     className={
                        isKioskMode
                           ? 'hern-kiosk-coupon__input'
                           : upFrontLayout
                           ? 'hern-upfront-coupon__input'
                           : 'hern-coupon__input'
                     }
                     type="text"
                     id="coupon"
                     placeholder={upFrontLayout ? 'enter Coupon Code' : ''}
                     required
                     value={typedCode}
                     onChange={e =>
                        setTypedCode(e.target.value.trim().toUpperCase())
                     }
                  />
               </div>
               {!upFrontLayout ? (
                  <button
                     className={
                        isKioskMode
                           ? 'hern-kiosk-coupon__form__apply-btn'
                           : 'hern-coupon__form__apply-btn'
                     }
                     type="submit"
                     disabled={searching || applying}
                     color={theme?.accent?.value}
                     style={{
                        ...(isKioskMode && {
                           border: `2px solid ${config.kioskSettings.theme.secondaryColor.value}`,
                           background: 'transparent',
                           padding: '.1em 2em',
                        }),
                     }}
                  >
                     {searching || applying ? <Loader inline /> : t('Apply')}
                  </button>
               ) : (
                  <Button
                     disabled={searching || applying}
                     type="submit"
                     variant="outline"
                  >
                     {searching || applying ? <Loader inline /> : t('Apply')}
                  </Button>
               )}
            </form>
            {!isKioskMode && (
               <Button
                  onClick={() => setIsCouponListTunnelOpen(true)}
                  variant="ghost"
               >
                  {t('View Offers')}
               </Button>
            )}
            {listOntunnnel && (
               <Tunnel.Right
                  title="Coupon"
                  visible={isCouponListTunnelOpen}
                  onClose={() => setIsCouponListTunnelOpen(false)}
               >
                  <CouponsList
                     createOrderCartRewards={createOrderCartRewards}
                     closeTunnel={() => setIsCouponListOpen(false)}
                     cart={cart}
                     config={config}
                     upFrontLayout={upFrontLayout}
                  />
               </Tunnel.Right>
            )}
            {!listOntunnnel && upFrontLayout && (
               <CouponsList
                  createOrderCartRewards={createOrderCartRewards}
                  closeTunnel={() => setIsCouponListOpen(false)}
                  cart={cart}
                  config={config}
                  upFrontLayout={upFrontLayout}
               />
            )}
            {isKioskMode && (
               <CouponsList
                  createOrderCartRewards={createOrderCartRewards}
                  closeTunnel={() => setIsCouponListOpen(false)}
                  cart={cart}
                  config={config}
                  upFrontLayout={upFrontLayout}
               />
            )}
            {!isKioskMode && !upFrontLayout && (
               <Tunnel.Wrapper
                  isOpen={isCouponListOpen}
                  toggleTunnel={setIsCouponListOpen}
                  style={{ zIndex: 1030 }}
               >
                  <CouponsList
                     createOrderCartRewards={createOrderCartRewards}
                     closeTunnel={() => setIsCouponListOpen(false)}
                     cart={cart}
                  />
               </Tunnel.Wrapper>
            )}
         </>
      )
   }
   return (
      <div
         className="hern-coupon"
         style={{
            color: `var(--hern-accent)`,
            ...(isKioskMode && {
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
                        isKioskMode
                           ? 'hern-kiosk-coupon__coupon-code'
                           : 'hern-coupon__coupon-code'
                     }
                  >
                     {data.cartRewards[0].reward.coupon.code}
                  </div>
                  <div
                     className={
                        isKioskMode
                           ? 'hern-kiosk-coupon__coupon-comment'
                           : 'hern-coupon__coupon-comment'
                     }
                  >
                     {t('Coupon applied!')}
                  </div>
               </div>
               <button
                  className={
                     isKioskMode
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
               style={{ color: `var(--hern-accent)` }}
            >
               {t('Apply Coupon')}
            </button>
         )}
      </div>
   )
}
export const Coupon = props => {
   const { tunnel = false } = props
   const [isCouponTunnelOpen, setIsCouponTunnelOpen] = React.useState(false)
   if (tunnel) {
      return (
         <>
            <CouponTunnlelTrigger
               setIsCouponTunnelOpen={setIsCouponTunnelOpen}
            />
            <Tunnel.Right
               title="Coupon"
               visible={isCouponTunnelOpen}
               onClose={() => setIsCouponTunnelOpen(false)}
            >
               <Coupon_ {...props} />
            </Tunnel.Right>
         </>
      )
   }
   return <Coupon_ {...props} />
}
export const CouponHeader = () => {
   const { t } = useTranslation()
   return (
      <div
         style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
         }}
      >
         <CouponIcon />
         <label
            className={'hern-upfront-coupon-header__label'}
            htmlFor="coupon-header"
         >
            {t('Apply Coupons')}
         </label>
      </div>
   )
}
const CouponTunnlelTrigger = ({ setIsCouponTunnelOpen }) => {
   const { t } = useTranslation()
   return (
      <div className="hern-upfront-coupon-header__tunnel">
         <div>
            <span>
               <CouponTicketIcon />
            </span>
            <div>
               <h4>{t('Apply Coupon')}</h4>
               <button onClick={() => setIsCouponTunnelOpen(true)}>
                  <span>{t('View All Offers')}</span>
                  <ChevronIcon />
               </button>
            </div>
         </div>
         <button onClick={() => setIsCouponTunnelOpen(true)}>
            <span>{t('Apply')}</span>
            <ChevronIcon />
         </button>
      </div>
   )
}
