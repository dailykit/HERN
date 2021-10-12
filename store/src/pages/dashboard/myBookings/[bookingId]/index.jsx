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
import { UPDATE_CART, CART_SUBSCRIPTION } from '../../../../graphql'
import { useUser, useExperienceInfo } from '../../../../Providers'
import {
   getDateWithTime,
   getMinute,
   useWindowDimensions,
   fileParser
} from '../../../../utils'
import { theme } from '../../../../theme'
import { getNavigationMenuItems, getBannerData } from '../../../../lib'

export default function MyBooking({ navigationMenuItems, parsedData = [] }) {
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
      <Layout navigationMenuItems={navigationMenuItems}>
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
                     <Card experienceInfo={experienceInfo} />
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

   return {
      props: {
         navigationMenuItems,
         parsedData
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
   .experience-heading {
      font-size: ${theme.sizes.h4};
      margin-bottom: 16px;
   }
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

const CardWrapper = styled.div`
   width: 100%;
   display: flex;
   flex-direction: column;
   border-radius: 40px;
   background: ${theme.colors.lightBackground.grey};
   .boldText {
      font-weight: 600;
   }
   .proxinova_text {
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.3em;
      color: ${theme.colors.textColor5};
      margin-bottom: 0 !important;
   }
   .exp_img {
      width: 100%;
      height: 180px;
      border-radius: 40px 40px 0 0;
      flex-grow: 0 !important;
      flex-shrink: 0 !important;
      overflow: hidden !important;
      object-fit: cover;
   }
   .divider {
      color: ${theme.colors.textColor7};
      border-top-color: ${theme.colors.textColor7};
      .ant-divider-inner-text {
         font-family: Proxima Nova;
         font-style: normal;
         letter-spacing: 0.3em;
         font-size: ${theme.sizes.h8};
      }
   }
   .experience-info {
      display: flex;
      flex-direction: column;
      .experience-details {
         flex: 1;
         color: ${theme.colors.textColor5};
         .experience-heading {
            font-family: Proxima Nova;
            font-style: normal;
            font-weight: 600;
            letter-spacing: 0.3em;
            margin: 8px 0;
            color: ${theme.colors.textColor7};
         }
         .experience-date {
            display: flex;
            align-items: center;
            justify-content: space-between;
            h2 {
               font-family: League-Gothic;
               letter-spacing: 0.04em;
               color: ${theme.colors.textColor5};
               margin-bottom: 0;
            }
         }
      }
   }
   .price-details {
      display: flex;
      flex-direction: column;
      .pricing {
         display: flex;
         align-items: center;
         justify-content: space-between;
         margin-top: 16px;
      }
      .estimate-billing-div {
         display: flex;
         flex-direction: column;
         margin: 1rem 0 0 0;
         cursor: pointer;
         .billing-action {
            color: ${theme.colors.textColor};
         }
      }
   }
   .booking-done {
      margin-top: 4rem;
      padding: 1rem;
      img {
         width: 94px;
         height: 94px;
         display: block;
         margin-left: auto;
         margin-right: auto;
      }
   }
   .ant-collapse {
      background: none;
   }
   .ant-collapse {
      border: none;
      > .ant-collapse-item > .ant-collapse-header {
         padding: 0;
         font-family: Proxima Nova;
         font-style: normal;
         font-weight: 600;
         letter-spacing: 0.3em;
         color: ${theme.colors.textColor};
         font-size: ${theme.sizes.h6};
         border: none;
      }
   }
   .ant-collapse-item {
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.3em;
      color: ${theme.colors.textColor};
      font-size: ${theme.sizes.h6};
      border: none;
   }
   .ant-collapse-arrow {
      font-size: 18px;
      svg {
         color: ${theme.colors.textColor};
      }
   }

   .ant-collapse-content {
      background: none;
      > .ant-collapse-content-box {
         padding: 0;
         .estimated-billing-details {
            table {
               width: 100%;
               margin: 8px 0;
               td {
                  font-family: Proxima Nova;
                  font-style: normal;
                  font-weight: 600;
                  letter-spacing: 0.3em;
                  color: ${theme.colors.textColor5};
                  font-size: ${theme.sizes.h8};
               }
               td:nth-child(2n) {
                  text-align: right;
                  padding: 8px;
               }
            }
         }
      }
   }
`

export function Card({ experienceInfo }) {
   return (
      <CardWrapper>
         <img
            className="exp_img"
            src={experienceInfo?.assets?.images[0]}
            alt="experince-img"
         />
         <div style={{ padding: '1rem 1rem 2rem 1rem' }}>
            <div className="experience-info">
               <div className="experience-details">
                  <p className="proxinova_text text7">
                     {experienceInfo?.title}
                  </p>
                  <h2 className="experience-heading text9">Be ready on</h2>
                  <div className="experience-date">
                     <h2 className="text4">
                        {getDateWithTime(
                           experienceInfo?.experienceClass?.startTimeStamp
                        )}
                     </h2>
                  </div>
                  <p className="experience-heading text9">
                     Duration:{' '}
                     {getMinute(experienceInfo?.experienceClass?.duration)} mins
                  </p>
               </div>
            </div>
            <Divider plain className="divider" orientation="left">
               Payment details
            </Divider>
            <div className="price-details">
               <div className="pricing">
                  <p className="proxinova_text text9">Total Amount</p>
                  <p className="proxinova_text text9">
                     ${experienceInfo?.toPayByParent}
                  </p>
               </div>
               <div className="pricing">
                  <p className="proxinova_text text9">Paid Amount</p>
                  <p className="proxinova_text text9">
                     ${experienceInfo?.paidAmount}
                  </p>
               </div>
               {experienceInfo?.balancePayment > 0 ? (
                  <div className="pricing">
                     <p className="proxinova_text text8">Net Balance(USD)</p>
                     <p className="proxinova_text text8">
                        ${experienceInfo?.balancePayment}
                     </p>
                  </div>
               ) : (
                  <h2 className="full-payment-msg">
                     Hurray!! Enjoy the experience
                  </h2>
               )}
            </div>
         </div>
      </CardWrapper>
   )
}
