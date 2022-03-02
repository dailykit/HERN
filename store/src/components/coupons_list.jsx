import React from 'react'
import { useSubscription } from '@apollo/react-hooks'
import { useUser, useTranslation } from '../context'
import { COUPONS } from '../graphql'
import { useConfig } from '../lib'
import { useMenu, MenuProvider } from '../sections/select-menu'
import { Loader } from './loader'
import {
   ArrowLeftIcon,
   ArrowRightIcon,
   CloseIcon,
   Scissor,
} from '../assets/icons'
import classNames from 'classnames'
import { isClient, useQueryParamState, isKiosk } from '../utils'
import { Carousel } from 'antd'
import { Button } from '.'
import { useWindowSize } from '../utils'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

const Coupons_List = ({
   createOrderCartRewards,
   closeTunnel,
   cart,
   config,
   upFrontLayout = false,
}) => {
   // use this component for kiosk as well
   const brandConfig = useConfig('rewards').configOf('Coupons Availability')
   const showListOnCarousel =
      brandConfig['Coupon list orientation']?.showInCarousel?.value ?? false
   const [orderInterfaceType] = useQueryParamState('oiType', 'Website')
   const { state = {} } =
      orderInterfaceType === 'Kiosk Ordering' ? {} : useMenu()
   const { brand } = useConfig()
   const { user } = useUser()
   const { id } =
      orderInterfaceType === 'Kiosk Ordering' || upFrontLayout
         ? cart
         : state?.occurenceCustomer?.cart
   const { t } = useTranslation()

   const [availableCoupons, setAvailableCoupons] = React.useState([])
   const [applying, setApplying] = React.useState(false)
   const { width, height } = useWindowSize()
   const isKioskMode = isKiosk()

   const { loading, error } = useSubscription(COUPONS, {
      variables: {
         params: {
            cartId: id,
            ...(user?.keycloakId && { keycloakId: user?.keycloakId }),
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

   const carousalRef = React.useRef()

   const lastCarousal = e => {
      e.stopPropagation()
      carousalRef.current.prev()
   }
   const nextCarousal = e => {
      e.stopPropagation()
      carousalRef.current.next()
   }

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
   if (orderInterfaceType === 'Kiosk Ordering' || upFrontLayout) {
      const CouponCard = ({ coupon }) => {
         return (
            <div
               className={
                  !upFrontLayout
                     ? 'hern-kiosk-coupons-list__coupon'
                     : 'hern-upfront-coupons-list__coupon'
               }
            >
               <div
                  className={
                     !upFrontLayout
                        ? 'hern-kiosk-coupons-list__coupon__top'
                        : 'hern-upfront-coupons-list__coupon__top'
                  }
               >
                  {!upFrontLayout && (
                     <div className="hern-kiosk-coupons-list__coupon__code">
                        {coupon.code}
                     </div>
                  )}
                  {!upFrontLayout && (
                     <button
                        className={classNames(
                           'hern-kiosk-coupons-list__coupon__apply-btn',
                           {
                              'hern-kiosk-coupons-list__coupon__apply-btn':
                                 isButtonDisabled(coupon),
                           }
                        )}
                        style={{
                           border: `2px solid ${config?.kioskSettings?.theme?.secondaryColor?.value}`,
                        }}
                        onClick={() => handleApplyCoupon(coupon)}
                        disabled={isButtonDisabled(coupon)}
                     >
                        {t('Apply')}
                     </button>
                  )}
               </div>
               <div
                  style={{
                     margin: upFrontLayout ? '0' : '.5em 0',
                  }}
                  className={
                     upFrontLayout
                        ? 'hern-upfront-coupons-list__coupon__body-wrapper'
                        : ''
                  }
               >
                  {upFrontLayout && (
                     <div className="hern-kiosk-coupons-list__coupon__code">
                        {coupon.code}
                     </div>
                  )}
                  <p
                     className={
                        !upFrontLayout
                           ? 'hern-kiosk-coupons-list__coupon__title'
                           : 'hern-upfront-coupons-list__coupon__title'
                     }
                  >
                     {coupon.metaDetails.title}
                  </p>
                  <p
                     className={
                        !upFrontLayout
                           ? 'hern-kiosk-coupons-list__coupon__description'
                           : 'hern-upfront-coupons-list__coupon__description'
                     }
                  >
                     {coupon.metaDetails.description}
                  </p>
               </div>
               {upFrontLayout && (
                  <>
                     <div
                        style={{
                           display: 'flex',
                           alignItems: 'center',
                           flex: 1,
                        }}
                     >
                        <Button
                           type="submit"
                           className={
                              isButtonDisabled(coupon)
                                 ? 'hern-upfront-coupons-list__coupon__apply-btn'
                                 : 'hern-upfront-coupons-list__coupon__apply-btn hern-upfront-coupons-list__coupon__apply-disabled'
                           }
                           onClick={() => handleApplyCoupon(coupon)}
                           disabled={isButtonDisabled(coupon)}
                        >
                           {t('Apply')}
                        </Button>
                     </div>
                     <div className="hern-upfront-coupons-list__coupon__scissor-icon">
                        <Scissor />
                     </div>
                  </>
               )}
            </div>
         )
      }
      console.log('brand-config', brandConfig)
      return (
         <div className={upFrontLayout ? 'hern-upfront-coupons-list' : ''}>
            {!availableCoupons.length && (
               <p className="hern-kiosk__coupon-not-available">
                  {t('No coupons available!')}
               </p>
            )}

            {availableCoupons.length > 0 && (
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  {(showListOnCarousel || isKioskMode) && (
                     <ArrowLeftIcon
                        className="hern-upfront-coupons-list__carousal-left-arrow hern-upfront-coupons-list__carousal-arrow"
                        size={42}
                        onClick={lastCarousal}
                     />
                  )}
                  <div className="hern-upfront-coupons-list__carousal-wrapper">
                     {showListOnCarousel || isKioskMode ? (
                        <Carousel
                           ref={carousalRef}
                           slidesToShow={width < 1600 ? 1 : 2}
                           className={
                              upFrontLayout
                                 ? 'hern-upfront-coupons-list__coupon-wrapper'
                                 : ''
                           }
                        >
                           {availableCoupons.map(coupon => (
                              <CouponCard key={coupon.id} coupon={coupon} />
                           ))}
                        </Carousel>
                     ) : (
                        <>
                           {availableCoupons.map(coupon => (
                              <div className="hern-upfront-coupons-list-item--card">
                                 <CouponCard key={coupon.id} coupon={coupon} />
                              </div>
                           ))}
                        </>
                     )}
                  </div>
                  {(showListOnCarousel || isKioskMode) && (
                     <ArrowRightIcon
                        className="hern-upfront-coupons-list__carousal-right-arrow hern-upfront-coupons-list__carousal-arrow"
                        size={42}
                        onClick={nextCarousal}
                     />
                  )}
               </div>
            )}
         </div>
      )
   }

   return (
      <div className="hern-coupons-list">
         {orderInterfaceType !== 'Kiosk Ordering' && (
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
                     disabled={isButtonDisabled(coupon)}
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
      <Coupons_List {...props} />
   </MenuProvider>
)
