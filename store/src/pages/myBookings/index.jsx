import React, { useEffect, useState } from 'react'
import { Flex } from '@dailykit/ui'
import { useSubscription } from '@apollo/client'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import ReactHtmlParser from 'react-html-parser'
import styled from 'styled-components'
import { Filler, Clock, Layout, SEO, InlineLoader } from '../../components'
import { YOUR_BOOKINGS } from '../../graphql'
import { useUser, useExperienceInfo } from '../../Providers'
import {
   getDateWithTime,
   getMinute,
   useWindowDimensions,
   fileParser
} from '../../utils'
import { theme } from '../../theme'
import { getNavigationMenuItems, getBannerData } from '../../lib'

export default function MyBookings({ navigationMenuItems, parsedData = [] }) {
   const router = useRouter()
   const bookingId = new URLSearchParams(router.query).get('bookingId')
   const { width } = useWindowDimensions()
   const { addToast } = useToasts()
   const [bookings, setBookings] = useState([])
   const [isBookingLoading, setIsBookingLoading] = useState(true)
   const [selectedBookingId, setSelectedBookingId] = useState(null)
   const { state: userState } = useUser()
   const { user = {} } = userState
   const { isLoading, setExperienceId } = useExperienceInfo()
   const { error: hasBookingsError } = useSubscription(YOUR_BOOKINGS, {
      variables: {
         where: {
            hostKeycloakId: {
               _eq: user?.keycloak
            },
            experienceClassId: {
               _is_null: false
            },
            _or: [
               {
                  parentCart: {
                     cartPayments: {
                        paymentStatus: {
                           _eq: 'SUCCEEDED'
                        }
                     }
                  }
               },
               {
                  experienceClass: {
                     experienceBookingId: {
                        _is_null: false
                     }
                  }
               }
            ]
         }
      },
      onSubscriptionData: ({
         subscriptionData: { data: { experienceBookings = [] } = {} } = {}
      } = {}) => {
         if (experienceBookings.length) {
            const updatedBookings = experienceBookings.map(booking => {
               return {
                  id: booking?.id,
                  cutoffTime: booking?.cutoffTime,
                  created_at: booking?.created_at,
                  experienceClassId: booking?.experienceClassId,
                  experienceInfo: booking?.experienceClass,
                  cartInfo: booking?.parentCart
               }
            })
            setBookings(updatedBookings)
            if (bookingId) {
               setSelectedBookingId(+bookingId)
            } else {
               setSelectedBookingId(updatedBookings[0]?.id)
            }
         }
         setIsBookingLoading(false)
      }
   })

   useEffect(() => {
      console.log('Booking Length', bookings)
      if (bookings.length) {
         setExperienceId(bookings[0]?.experienceInfo?.experience?.id)
      }
   }, [bookings])

   if (hasBookingsError) {
      console.error(hasBookingsError)
      setIsBookingLoading(false)
      addToast('Somthing went wrong!', { appearance: 'error' })
   }

   if ((bookings.length > 0 && isLoading) || isBookingLoading)
      return <InlineLoader type="full" />

   return (
      <Layout navigationMenuItems={navigationMenuItems}>
         <SEO title="Bookings" />
         <div id="myBookings-top-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'myBookings-top-01')
                     ?.content
               )}
         </div>
         <Wrapper>
            {bookings.length > 0 ? (
               <div className="my-bookings-section">
                  <h1 className="booking-head">My Bookings</h1>
                  {bookings.map(booking => {
                     return (
                        <div
                           key={booking?.id}
                           className="poll-button box-shadow-glow"
                           onClick={() =>
                              router.push(`/myBookings/${booking?.id}`)
                           }
                        >
                           <Flex container alignItems="center">
                              <img
                                 className="exp-booking-img"
                                 src={
                                    booking?.experienceInfo?.experience?.assets
                                       ?.images[0]
                                 }
                                 alt={`${booking?.experienceInfo?.experience?.title}-img`}
                              />
                              <Flex flexDirection="column" container flex="1">
                                 <h2 className="exp-name">
                                    {booking?.experienceInfo?.experience?.title}{' '}
                                    (Booked at :{' '}
                                    {getDateWithTime(booking?.created_at)})
                                 </h2>

                                 <Flex
                                    container
                                    justifyContent="space-between"
                                    margin="0 0 4px 0"
                                 >
                                    <Flex
                                       container
                                       justifyContent="space-between"
                                       alignItems="center"
                                    >
                                       {booking?.experienceInfo
                                          ?.experienceClassExpert?.assets &&
                                          booking?.experienceInfo
                                             ?.experienceClassExpert?.assets
                                             ?.images.length > 0 && (
                                             <div className="expertImgDiv">
                                                <img
                                                   className="expert-img"
                                                   src={
                                                      booking?.experienceInfo
                                                         ?.experienceClassExpert
                                                         ?.assets?.images[0]
                                                   }
                                                   alt="expert-img"
                                                />
                                             </div>
                                          )}
                                       <p className="expert-name">
                                          {`${booking?.experienceInfo?.experienceClassExpert?.firstName} ${booking?.experienceInfo?.experienceClassExpert?.lastName}`}
                                       </p>
                                    </Flex>
                                    <span className="duration">
                                       <Clock
                                          size={theme.sizes.h6}
                                          color={theme.colors.textColor4}
                                       />
                                       <span>
                                          {getMinute(
                                             booking?.experienceInfo?.duration
                                          )}
                                          min
                                       </span>
                                    </span>
                                 </Flex>
                                 <Flex
                                    container
                                    alignItems="center"
                                    justifyContent="space-between"
                                    margin="0 0 4px 0"
                                 >
                                    <p className="exp-info">
                                       <span>Total Paid</span>
                                    </p>
                                    <p className="exp-info">
                                       $ {booking?.cartInfo?.paidAmount}
                                    </p>
                                 </Flex>
                                 {booking?.cartInfo?.balancePayment > 0 && (
                                    <Flex
                                       container
                                       alignItems="center"
                                       justifyContent="space-between"
                                       margin="0 0 4px 0"
                                    >
                                       <p className="exp-info">
                                          <span>Net Balance Amount</span>
                                       </p>
                                       <p className="exp-info">
                                          $ {booking?.cartInfo?.balancePayment}
                                       </p>
                                    </Flex>
                                 )}
                              </Flex>
                           </Flex>
                        </div>
                     )
                  })}
               </div>
            ) : (
               <Filler
                  message="You have'nt booked any experience yet!"
                  linkUrl="/experiences"
                  linkText="Checkout our Experiences"
               />
            )}
         </Wrapper>
         <div id="myBookings-bottom-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'myBookings-bottom-01')
                     ?.content
               )}
         </div>
      </Layout>
   )
}

export const getStaticProps = async () => {
   const domain = 'primanti.dailykit.org'
   const where = {
      id: { _in: ['myBookings-top-01', 'myBookings-bottom-01'] }
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
   display: flex;
   justify-content: space-between;
   padding: 1rem;
   color: ${theme.colors.textColor4};
   .my-bookings-section {
      height: 100%;
      width: 100%;
      text-align: left;
      padding: 1rem;
      .booking-head {
         text-align: center;
         margin-bottom: 2rem;
      }

      .poll-button {
         border: 1px solid ${theme.colors.textColor4};
         height: auto;
         color: ${theme.colors.textColor4};
         font-size: ${theme.sizes.h8};
         padding: 1rem;
         margin: 1rem 0;

         .exp-booking-img {
            width: 25%;
            height: 120px;
            object-fit: cover;
            margin-right: 1rem;
            border-radius: 4px;
         }
         .exp-name {
            margin: 4px 0 4px 0;
            font-size: ${theme.sizes.h8};
            font-weight: 500;
            text-align: left;
         }
         .exp-info {
            font-weight: 800;
            font-size: ${theme.sizes.h7};
            span {
               font-weight: 600;
               font-size: ${theme.sizes.h6};
            }
         }

         .book-exp {
            text-align: center;
            font-weight: 800;
            font-size: ${theme.sizes.h8};
            color: ${theme.colors.tertiaryColor};
            text-transform: uppercase;
            cursor: pointer;
         }
         .duration {
            display: flex;
            align-items: center;
            span {
               margin-left: 8px;
               font-size: ${theme.sizes.h7};
            }
         }
         .expertImgDiv {
            width: 14px;
            height: 14px;
            margin: 0 4px 0 0;
         }
         .expert-img {
            width: 100%;
            height: 100%;
            border-radius: 50px;
         }
         @media (min-width: 769px) {
            .exp-name {
               margin: 1rem 0 0.5rem 0;
               font-size: ${theme.sizes.h4};
            }
            .exp-info {
               font-size: ${theme.sizes.h8};
               font-weight: 600;
            }
            .duration {
               span {
                  font-size: ${theme.sizes.h8};
               }
            }
            .book-exp {
               font-size: ${theme.sizes.h8};
            }
            .expertImgDiv {
               width: 30px;
               height: 30px;
               margin: 0 8px 0 0;
            }
         }
      }
   }
   .poll-invite-section {
      height: 680px;
      width: 30%;
      overflow-y: auto;
      background: ${theme.colors.mainBackground};
      box-shadow: -12px 12px 24px rgba(18, 21, 27, 0.2),
         12px -12px 24px rgba(18, 21, 27, 0.2),
         -12px -12px 24px rgba(48, 53, 69, 0.9),
         12px 12px 30px rgba(18, 21, 27, 0.9),
         inset 1px 1px 2px rgba(48, 53, 69, 0.3),
         inset -1px -1px 2px rgba(18, 21, 27, 0.5);
   }

   @media (max-width: 769px) {
      .my-bookings-section {
         height: 100%;
         width: 100%;
         padding: 0;
         margin-right: 0;
         .poll-button {
            flex-direction: column;
            height: max-content;
            align-items: flex-start;
         }

         p {
            margin-bottom: 8px;
            text-align: left;
         }
      }
      .poll-invite-section {
         display: none;
      }
   }
`
