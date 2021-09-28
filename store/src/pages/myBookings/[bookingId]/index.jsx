import React, { useState } from 'react'
import Confetti from 'react-confetti'
import { useSubscription, useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import styled from 'styled-components'
import ReactHtmlParser from 'react-html-parser'
import {
   BookingInvite,
   ChevronLeft,
   BackDrop,
   Payment,
   SpinnerIcon,
   SEO,
   Layout,
   InlineLoader
} from '../../../components'
import { UPDATE_CART, CART_SUBSCRIPTION } from '../../../graphql'
import { useUser, useExperienceInfo } from '../../../Providers'
import {
   getDateWithTime,
   getMinute,
   useWindowDimensions,
   fileParser
} from '../../../utils'
import { theme } from '../../../theme'
import { getNavigationMenuItems, getBannerData } from '../../../lib'

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

   if (loading) return <InlineLoader />
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
               <span
                  className="back-button"
                  onClick={() => router.push(`/myBookings`)}
               >
                  <ChevronLeft size="20" color={theme.colors.textColor4} />
               </span>
               <h1>My Booking</h1>
            </div>
            <h2 className="experience-heading">Your Experience</h2>
            <div className="experience-date">
               <h4>Date</h4>
               <p>
                  {getDateWithTime(
                     experienceInfo?.experienceClass?.startTimeStamp
                  )}
               </p>
            </div>
            <div className="container">
               <div className="left-side-container">
                  <BookingInvite experienceBookingId={bookingId} />
               </div>
               <div className="right-side-container">
                  <div className="sticky-card">
                     <div className="card-wrapper">
                        <Card experienceInfo={experienceInfo} />
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
   padding: 0 80px;
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
   .checkout-heading {
      padding: 64px 0;
      display: flex;
      align-items: center;
      .back-button {
         width: 48px;
         height: 48px;
         border-radius: 50%;
         background: ${theme.colors.mainBackground};
         margin-right: 16px;
         position: relative;
         &:hover {
            cursor: pointer;
         }
         svg {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
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
            background: ${theme.colors.mainBackground};
            position: sticky !important;
            top: 80px !important;
            z-index: 1 !important;
            display: inline-block !important;
            width: 100% !important;
            padding-right: 1px !important;
            .card-wrapper {
               background: ${theme.colors.mainBackground};
               padding: 24px;
               border: 1px solid ${theme.colors.textColor4};
               border-radius: 4px;
               margin-bottom: 1rem;
            }
         }
      }
   }
   @media (max-width: 769px) {
      padding: 0 26px;
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
   border-radius: 4px;
   .boldText {
      font-weight: 600;
   }
   .experience-info {
      display: flex;
      margin-top: 24px;
      img {
         width: 106px;
         height: 106px;
         border-radius: 4px;
         flex-grow: 0 !important;
         flex-shrink: 0 !important;
         overflow: hidden !important;
         object-fit: cover;
      }
      .experience-details {
         padding-left: 16px;
         flex: 1;
         color: ${theme.colors.textColor4};
      }
   }
   .price-details {
      display: flex;
      flex-direction: column;
      margin-top: 24px;
      .pricing {
         display: flex;
         align-items: center;
         justify-content: space-between;
         margin-top: 24px;
      }
   }
   .full-payment-msg {
      text-align: center;
      font-size: ${theme.sizes.h8};
      font-style: italic;
      margin: 1rem;
      color: ${theme.colors.textColor};
   }
`

export function Card({ experienceInfo }) {
   return (
      <CardWrapper>
         <div className="experience-info">
            <img src={experienceInfo?.assets?.images[0]} alt="experince-img" />
            <div className="experience-details">
               <p>
                  Duration:{' '}
                  {getMinute(experienceInfo?.experienceClass?.duration)} mins
               </p>
               <p>{experienceInfo?.title}</p>
            </div>
         </div>
         <div className="price-details">
            <h2>Price details</h2>
            <div className="pricing">
               <p>Total Amount</p>
               <p>${experienceInfo?.toPayByParent}</p>
            </div>
            <div className="pricing">
               <p>Paid Amount</p>
               <p>${experienceInfo?.paidAmount}</p>
            </div>
            {experienceInfo?.balancePayment > 0 ? (
               <>
                  <hr style={{ marginTop: '16px' }} />
                  <div className="pricing boldText">
                     <p>Net Balance(USD)</p>
                     <p>${experienceInfo?.balancePayment}</p>
                  </div>
               </>
            ) : (
               <h2 className="full-payment-msg">
                  Hurray!! Enjoy the experience
               </h2>
            )}
         </div>
      </CardWrapper>
   )
}
