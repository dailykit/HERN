import React from 'react'
import { useSubscription } from '@apollo/react-hooks'
import { useUser, useTranslation } from '../context'
import { COUPONS } from '../graphql'
import { useConfig } from '../lib'
import { useMenu, MenuProvider } from '../sections/select-menu'
import { Loader } from './loader'
import { CloseIcon } from '../assets/icons'
import classNames from 'classnames'
import { isClient, useQueryParamState } from '../utils'
import { Carousel } from 'antd'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

const Coupons_List = ({
   createOrderCartRewards,
   closeTunnel,
   cart,
   config,
   upFrontLayout = true,
}) => {
   // use this component for kiosk as well
   const [orderInterfaceType] = useQueryParamState('oiType', 'Website')
   const { state = {} } = orderInterfaceType === 'Kiosk' ? {} : useMenu()
   const { brand } = useConfig()
   const { user } = useUser()
   const { id } =
      orderInterfaceType === 'Kiosk' || upFrontLayout
         ? cart
         : state?.occurenceCustomer?.cart
   const { t } = useTranslation()

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

         // fb pixel custom event for coupon list
         ReactPixel.trackCustom('showCouponList', {
            coupons: [
               ...coupons.filter(coupon => coupon.visibilityCondition.isValid),
            ],
         })
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
         // FB pixel custom event for coupon applied
         ReactPixel.trackCustom('couponApplied', coupon)

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
   if (orderInterfaceType === 'Kiosk') {
      return (
         <>
            {!availableCoupons.length && (
               <p className="hern-kiosk__coupon-not-available">
                  {t('No coupons available!')}
               </p>
            )}

            {availableCoupons.length > 0 && (
               <Carousel slidesToShow={2}>
                  {availableCoupons.map(coupon => (
                     <div
                        className="hern-kiosk-coupons-list__coupon"
                        key={coupon.id}
                     >
                        <div className="hern-kiosk-coupons-list__coupon__top">
                           <div className="hern-kiosk-coupons-list__coupon__code">
                              {coupon.code}{' '}
                           </div>
                           <button
                              className={classNames(
                                 'hern-kiosk-coupons-list__coupon__apply-btn',
                                 {
                                    'hern-kiosk-coupons-list__coupon__apply-btn':
                                       isButtonDisabled(coupon),
                                 }
                              )}
                              style={{
                                 border: `2px solid ${config.kioskSettings.theme.secondaryColor.value}`,
                              }}
                              onClick={() => handleApplyCoupon(coupon)}
                           >
                              {t('Apply')}
                           </button>
                        </div>
                        <div style={{ margin: '.5em 0' }}>
                           <p className="hern-kiosk-coupons-list__coupon__title">
                              {coupon.metaDetails.title}
                           </p>
                           <p className="hern-kiosk-coupons-list__coupon__description">
                              {coupon.metaDetails.description}
                           </p>
                        </div>
                     </div>
                  ))}
               </Carousel>
            )}
         </>
      )
   }
   return (
      <div className="hern-coupons-list">
         {orderInterfaceType !== 'Kiosk' && (
            <div className="hern-coupons-list__header">
               <div className="hern-coupons-list__heading">
                  {t('Available Coupons')}
               </div>
               <button className="hern-coupons-list__close-btn">
                  <CloseIcon
                     size={16}
                     className="hern-coupons-list__close-btn__icon"
                     onClick={closeTunnel}
                  />
               </button>
            </div>
         )}
         {!availableCoupons.length && <p>{t('No coupons available!')}</p>}
         {availableCoupons.map(coupon => (
            <div className="hern-coupons-list__coupon" key={coupon.id}>
               <div className="hern-coupons-list__coupon__top">
                  <div className="hern-coupons-list__coupon__code">
                     {coupon.code}{' '}
                  </div>
                  <button
                     className={classNames(
                        'hern-coupons-list__coupon__apply-btn',
                        {
                           'hern-coupons-list__coupon__apply-btn':
                              isButtonDisabled(coupon),
                        }
                     )}
                     onClick={() => handleApplyCoupon(coupon)}
                  >
                     {t('Apply')}
                  </button>
               </div>
               <div>
                  <p className="hern-coupons-list__coupon__title">
                     {coupon.metaDetails.title}
                  </p>
                  <p className="hern-coupons-list__coupon__description">
                     {coupon.metaDetails.description}
                  </p>
               </div>
            </div>
         ))}
      </div>
   )
}

export const CouponsList = props => (
   <MenuProvider>
      {' '}
      <Coupons_List {...props} />
   </MenuProvider>
)
