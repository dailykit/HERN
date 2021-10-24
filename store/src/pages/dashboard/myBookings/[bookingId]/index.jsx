import React, { useState } from 'react'
import Confetti from 'react-confetti'
import { useSubscription, useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import styled from 'styled-components'
import ReactHtmlParser from 'react-html-parser'
import { Button, Divider, Badge } from 'antd'
import {
   BookingInvite,
   ChevronLeft,
   BackDrop,
   Payment,
   SpinnerIcon,
   SEO,
   Layout,
   InlineLoader
} from '../../../../components'
import BookingCard from '../../../../pageComponents/BookingCard'
import { UPDATE_CART, CART_SUBSCRIPTION } from '../../../../graphql'
import { useUser, useExperienceInfo } from '../../../../Providers'
import {
   getDateWithTime,
   getMinute,
   useWindowDimensions,
   fileParser
} from '../../../../utils'
import { theme } from '../../../../theme'
import {
   getNavigationMenuItems,
   getBannerData,
   getGlobalFooter
} from '../../../../lib'

export default function MyBooking({
   navigationMenuItems,
   parsedData = [],
   footerHtml = ''
}) {
   const router = useRouter()
   const { bookingId } = router.query
   const { width, height } = useWindowDimensions()
   const { addToast } = useToasts()
   const { state: userState } = useUser()
   const { user = {} } = userState
   const [experienceInfo, setExperienceInfo] = useState(null)
   const [isCelebrating, setIsCelebrating] = useState(false)
   const [loading, setLoading] = useState(true)
   const { error: cartSubscriptionError } = useSubscription(CART_SUBSCRIPTION, {
      variables: {
         where: {
            experienceBooking: {
               id: {
                  _eq: bookingId
               }
            }
         }
      },
      onSubscriptionData: async ({
         subscriptionData: { data: { carts = [] } = {} } = {}
      } = {}) => {
         const [cart] = carts
         setExperienceInfo({
            ...cart,
            ...cart?.experienceClass?.experience,
            experienceClass: cart?.experienceClass,
            experienceClassType: cart?.experienceClassType
         })

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
      setTimeout(setIsCelebrating(false), 12000)
      router.push('/myBookings')
   }
   const startCelebration = () => {
      setIsCelebrating(true)
      setTimeout(stopCelebration, 5000)
   }

   const onPayHandler = async () => {
      await updateCart({
         variables: {
            cartId: experienceInfo?.cartId,
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
   if (cartSubscriptionError) {
      setLoading(false)
      addToast('Opps! Something went wrong!', { appearance: 'error' })
      console.error(cartSubscriptionError)
   }

   return (
      <Layout navigationMenuItems={navigationMenuItems} footerHtml={footerHtml}>
         <SEO title={`Booking-${bookingId}`} />
         <div id="myBooking-top-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'myBooking-top-01')
                     ?.content
               )}
         </div>
         <Wrapper isCelebrating={isCelebrating}>
            <div className="checkout-heading">
               <Button
                  shape="circle"
                  icon={
                     <ChevronLeft size="24" color={theme.colors.textColor5} />
                  }
                  size="middle"
                  onClick={() =>
                     router.push(`/experiences/${experienceInfo?.experienceId}`)
                  }
               />
               <p className="go_back text10"> Back to bookings </p>
            </div>
            <h1 className="h1_head text1">Manage Booking</h1>
            <div className="container">
               <div className="left-side-container">
                  <BookingInvite experienceBookingId={bookingId} />
                  {experienceInfo?.balancePayment > 0 && (
                     <Payment
                        type="checkout"
                        onPay={onPayHandler}
                        isOnPayDisabled={Boolean(
                           !user?.defaultPaymentMethodId || isCartUpdating
                        )}
                     />
                  )}
               </div>
               <div className="right-side-container">
                  <div className="sticky-card">
                     <BookingCard experienceInfo={experienceInfo} />
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
         <div id="myBooking-bottom-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'myBooking-bottom-01')
                     ?.content
               )}
         </div>
      </Layout>
   )
}

export const getStaticProps = async () => {
   const domain = 'primanti.dailykit.org'
   const navigationMenuItems = await getNavigationMenuItems(domain)
   const where = {
      id: {
         _in: ['myBooking-top-01', 'myBooking-bottom-01']
      }
   }
   const bannerData = await getBannerData(where)
   const parsedData = await fileParser(bannerData)
   const footerHtml = await getGlobalFooter()
   return {
      props: {
         navigationMenuItems,
         parsedData,
         footerHtml
      }
   }
}

export const getStaticPaths = async () => {
   return {
      paths: [],
      fallback: 'blocking'
   }
}

const Wrapper = styled.div`
   width: 100%;
   color: ${theme.colors.textColor4};
   padding: 64px 80px;
   filter: ${({ isCelebrating }) => isCelebrating && 'blur(4px)'};
   .experience-date {
      h4 {
         font-size: ${theme.sizes.h8};
      }
      p {
         font-size: ${theme.sizes.h8};
      }
   }
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
      margin-bottom: 2rem;
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
         .left-side-heading {
            font-size: ${theme.sizes.h4};
            margin-bottom: 32px;
         }
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
         .sticky-payment {
            position: sticky !important;
            top: 80px !important;
            z-index: 1 !important;
            display: inline-block !important;
            width: 100% !important;
            padding-right: 1px !important;
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
            margin-bottom: 64px;
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
