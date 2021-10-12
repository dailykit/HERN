import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Confetti from 'react-confetti'
import { useToasts } from 'react-toast-notifications'
import ReactHtmlParser from 'react-html-parser'
import { Button } from 'antd'
import { useSubscription, useMutation } from '@apollo/client'
import { Card } from '../../pageComponents/checkoutComponent'
import {
   ChevronLeft,
   Payment,
   BackDrop,
   Address,
   SpinnerIcon,
   Layout,
   SEO,
   InlineLoader
} from '../../components'
import Participant from '../../components/Booking/components/Participant'
import { CART_SUBSCRIPTION, UPDATE_CART } from '../../graphql'
import { theme } from '../../theme'
import { useExperienceInfo, useUser, useCart } from '../../Providers'
import {
   getDateWithTime,
   getTime,
   useWindowDimensions,
   fileParser
} from '../../utils'
import { getNavigationMenuItems, getBannerData } from '../../lib'

export default function Checkout({ navigationMenuItems, parsedData = [] }) {
   const { width, height } = useWindowDimensions()
   const router = useRouter()
   console.log('Routerrrr', router)
   const { addToast } = useToasts()
   const cartId = new URLSearchParams(router.query).get('cartId')
   const { state, addHostCart, addCurrentCart } = useCart()
   const { state: { user = {} } = {} } = useUser()
   const { state: experienceState, updateExperienceInfo } = useExperienceInfo()
   const { selectedSlot, experienceClasses } = useMemo(() => {
      return experienceState
   }, [experienceState])
   const [experienceInfo, setExperienceInfo] = useState(null)
   const [isCelebrating, setIsCelebrating] = useState(false)
   const [loading, setLoading] = useState(true)
   const { error } = useSubscription(CART_SUBSCRIPTION, {
      variables: {
         where: {
            id: {
               _eq: +cartId
            }
         }
      },
      onSubscriptionData: async ({
         subscriptionData: { data: { carts = [] } = {} } = {}
      } = {}) => {
         const [cart] = carts
         const hostCartObj = cart?.childCarts.find(
            childCart => childCart?.isHostCart
         )
         const hostCart =
            hostCartObj === undefined ? cart?.childCarts[0] : hostCartObj
         setExperienceInfo({
            ...cart,
            ...cart?.experienceClass?.experience,
            experienceClass: cart?.experienceClass,
            experienceClassType: cart?.experienceClassType
         })
         console.log('from checkout ->cart', cart)
         await updateExperienceInfo({
            participants: cart?.totalParticipants,
            totalPrice: cart?.balancePayment
         })
         await updateExperienceInfo({
            participants: cart?.totalParticipants,
            totalPrice: cart?.balancePayment,
            isHostParticipant: cart?.isHostParticipant
         })
         await addCurrentCart(cart)
         await addHostCart(hostCart)
         setLoading(false)
      }
   })

   const [updateCart, { loading: isCartUpdating }] = useMutation(UPDATE_CART, {
      refetchQueries: ['CART_INFO'],
      onError: error => {
         addToast('Opps! Something went wrong!', { appearance: 'error' })
         console.log(error)
      }
   })

   const stopCelebration = () => {
      setTimeout(setIsCelebrating(false), 5000)
      router.push('/myBookings')
   }
   const startCelebration = () => {
      setIsCelebrating(true)
      setTimeout(stopCelebration, 30000)
   }

   const onPayHandler = async () => {
      console.log('onPayHandler function')
      await updateCart({
         variables: {
            cartId,
            _inc: {
               paymentRetryAttempt: 1
            },
            _set: {
               stripeCustomerId: user?.stripeCustomerId,
               paymentMethodId: user?.defaultPaymentMethodId
            }
         }
      })
      startCelebration()
   }

   if (loading) return <InlineLoader type="full" />
   if (error) {
      console.error(error)
      setLoading(false)
   }

   return (
      <Layout navigationMenuItems={navigationMenuItems}>
         <SEO title="Checkout" />
         <div id="checkout-top-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'checkout-top-01')
                     ?.content
               )}
         </div>
         <Wrapper
            isCelebrating={isCelebrating}
            bgMode="light"
            bgImage={experienceInfo?.assets?.images[0]}
         >
            <div className="container">
               <div className="left-side-container">
                  <div className="checkout-heading">
                     <Button
                        shape="circle"
                        icon={
                           <ChevronLeft
                              size="24"
                              color={theme.colors.textColor5}
                           />
                        }
                        size="middle"
                        onClick={() =>
                           router.push(
                              `/experiences/${experienceInfo?.experienceId}`
                           )
                        }
                     />
                     <p className="go_back text10"> Back to experience </p>
                  </div>
                  <h1 className="h1_head text1">Checkout</h1>
                  <Payment
                     type="checkout"
                     onPay={onPayHandler}
                     isOnPayDisabled={Boolean(
                        !user?.defaultPaymentMethodId || isCartUpdating
                     )}
                  />
               </div>
               <div className="right-side-container">
                  <div className="sticky-card">
                     <div className="card-wrapper">
                        <Card experienceInfo={experienceInfo} />
                     </div>
                  </div>
               </div>
            </div>
         </Wrapper>
         <BackDrop show={isCelebrating}>
            <div className="booking-done">
               <img
                  src="/assets/images/celebration.png"
                  alt="celebration-emoji"
               />
               <p>Your're BOOKED!</p>
               <div
                  style={{
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center'
                  }}
               >
                  <SpinnerIcon size="64" color="#fff" backgroundColor="none" />
               </div>
            </div>
            <Confetti width={width} height={height} />
         </BackDrop>
         <div id="checkout-bottom-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'checkout-bottom-01')
                     ?.content
               )}
         </div>
      </Layout>
   )
}

export const getStaticProps = async () => {
   const domain = 'primanti.dailykit.org'
   const where = {
      id: { _in: ['checkout-top-01', 'checkout-bottom-01'] }
   }
   const navigationMenuItems = await getNavigationMenuItems(domain)
   const bannerData = await getBannerData(where)
   const parsedData = await fileParser(bannerData)

   return {
      props: {
         navigationMenuItems,
         parsedData
      }
   }
}

const Wrapper = styled.div`
   width: 100%;
   color: ${theme.colors.textColor4};
   padding: 64px 80px;
   filter: ${({ isCelebrating }) => isCelebrating && 'blur(4px)'};
   background: ${({ bgMode }) =>
      bgMode === 'dark'
         ? theme.colors.darkBackground.darkblue
         : theme.colors.lightBackground.white};
   .h1_head {
      color: ${theme.colors.textColor5};
      font-weight: 400;
      text-align: left;
      text-transform: uppercase;
      font-family: League-Gothic;
      margin-bottom: 0 !important;
   }
   .checkout-heading {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      .go_back {
         color: ${theme.colors.textColor7};
         font-family: Proxima Nova;
         font-style: normal;
         font-weight: 600;
         letter-spacing: 0.3em;
         margin-bottom: 0 !important;
         margin-left: 1rem;
      }
      .ant-btn {
         display: flex;
         align-items: center;
         justify-content: center;
         background: ${theme.colors.textColor4};
         &:hover {
            color: ${theme.colors.textColor5};
            border-color: ${theme.colors.textColor5};
            background: ${theme.colors.textColor4};
            svg {
               stroke: ${theme.colors.textColor5};
            }
         }
      }
   }

   .container {
      width: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: stretch;
      margin: 0 auto;
      .left-side-container {
         position: relative !important;
         width: 50% !important;
         margin-left: 0% !important;
         margin-right: 0% !important;

         .select-participants {
            margin-top: 16px;
            border: 1px solid ${theme.colors.textColor4};
            border-radius: 4px;
         }
         .payment-div {
            padding: 32px 0;
            .payment-icon-wrapper {
               display: flex;
               align-items: center;
               .payment-icon {
                  margin-right: 8px;
               }
            }
         }
      }
      .right-side-container {
         position: relative !important;
         width: 41.6667% !important;
         margin-left: 8.33333% !important;
         margin-right: 0% !important;
         .sticky-card {
            position: sticky !important;
            top: 80px !important;
            z-index: 1 !important;
            display: inline-block !important;
            width: 100% !important;
            padding-right: 1px !important;
         }
      }
   }

   @media (max-width: 769px) {
      padding: 32px 26px;
      .container {
         width: 100%;
         display: flex;
         flex-direction: column;
         justify-content: flex-start;
         align-items: stretch;
         margin: 0 auto;
         .left-side-container {
            width: 100% !important;
         }
         .right-side-container {
            order: -1;
            margin: 0 0 1rem 0 !important;
            position: relative !important;
            width: 100% !important;
            .sticky-card {
               .card-wrapper {
                  padding: 0;
                  border: none;
               }
            }
         }
      }
   }
`
