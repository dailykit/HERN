import React, { useEffect, useState } from 'react'
import { useSubscription } from '@apollo/client'
import { Flex } from '@dailykit/ui'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import ReactHtmlParser from 'react-html-parser'
import styled from 'styled-components'
import { Filler, Clock, Layout, SEO, InlineLoader } from '../../components'
import { YOUR_BOOKINGS } from '../../graphql'
import { useUser, useExperienceInfo } from '../../Providers'
import {
   getDateWithTime,
   useWindowDimensions,
   getMinute,
   fileParser
} from '../../utils'
import { theme } from '../../theme'
import { getNavigationMenuItems, getBannerData } from '../../lib'

export default function MyPolls({ navigationMenuItems, parsedData = [] }) {
   const router = useRouter()
   const pollId = new URLSearchParams(router.query).get('pollId')
   const { width } = useWindowDimensions()
   const { addToast } = useToasts()
   const [polls, setPolls] = useState([])
   const [isPollsLoading, setIsPollsLoading] = useState(true)
   const [selectedPollId, setSelectedPollId] = useState(null)
   const { state: userState } = useUser()
   const { user = {} } = userState
   const { isLoading, setExperienceId } = useExperienceInfo()
   const { error: hasPollsError } = useSubscription(YOUR_BOOKINGS, {
      variables: {
         where: {
            hostKeycloakId: {
               _eq: user?.keycloakId
            },
            experienceClassId: {
               _is_null: true
            }
         }
      },
      onSubscriptionData: ({
         subscriptionData: { data: { experienceBookings = [] } = {} } = {}
      } = {}) => {
         if (experienceBookings.length) {
            const updatedPolls = experienceBookings.map(booking => {
               return {
                  id: booking?.id,
                  cutoffTime: booking?.cutoffTime,
                  created_at: booking?.created_at,
                  bookingOptionsCount: booking?.experienceBookingOptions.length,
                  experienceInfo:
                     booking?.experienceBookingOptions[0]?.experienceClass,
                  mostVotedOption: booking.experienceBookingOptions.reduce(
                     (prev, current) => {
                        return prev?.voting?.aggregate?.count >
                           current?.voting?.aggregate?.count
                           ? prev
                           : current
                     }
                  )
               }
            })
            setPolls(updatedPolls)
            if (pollId) {
               setSelectedPollId(+pollId)
            } else {
               setSelectedPollId(updatedPolls[0]?.id)
            }
         }
         setIsPollsLoading(false)
      }
   })

   useEffect(() => {
      if (polls.length) {
         setExperienceId(polls[0]?.experienceInfo?.experience?.id)
      }
   }, [polls])

   if (hasPollsError) {
      console.error(hasPollsError)
      setIsPollsLoading(false)
      addToast('Somthing went wrong!', { appearance: 'error' })
   }
   if ((polls.length > 0 && isLoading) || isPollsLoading)
      return <InlineLoader />
   return (
      <Layout navigationMenuItems={navigationMenuItems}>
         <SEO title="Polls" />
         <div id="myPolls-top-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'myPolls-top-01')?.content
               )}
         </div>
         <Wrapper>
            {polls.length > 0 ? (
               <div className="my-polls-section">
                  <h1 className="polls-head">My Polls</h1>
                  {/* {polls.map((poll) => {
            return (
              <div
                key={poll?.id}
                className="poll-button box-shadow-glow"
                onClick={() => history.push(`/polls/${poll?.id}`)}
              >
                <p>
                  {poll?.experienceInfo?.experience?.title} Poll (with{" "}
                  {poll?.bookingOptionsCount} options)
                </p>
                <p>Created at : {getDateWithTime(poll?.created_at)}</p>
              </div>
            );
          })} */}
                  {polls.map(poll => {
                     return (
                        <div
                           key={poll?.id}
                           className="poll-button box-shadow-glow"
                           onClick={() => router.push(`/myPolls/${poll?.id}`)}
                        >
                           <Flex container alignItems="center">
                              <img
                                 className="exp-booking-img"
                                 src={
                                    poll?.experienceInfo?.experience?.assets
                                       ?.images[0]
                                 }
                                 alt={`${poll?.experienceInfo?.experience?.title}-img`}
                              />
                              <Flex flexDirection="column" container flex="1">
                                 <h2 className="exp-name">
                                    {poll?.experienceInfo?.experience?.title}{' '}
                                    (created at :{' '}
                                    {getDateWithTime(poll?.created_at)})
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
                                       <div className="expertImgDiv">
                                          <img
                                             className="expert-img"
                                             src={
                                                poll?.experienceInfo
                                                   ?.experienceClassExpert
                                                   ?.assets?.images[0]
                                             }
                                             alt="expert-img"
                                          />
                                       </div>
                                       <p className="expert-name">
                                          {`${poll?.experienceInfo?.experienceClassExpert?.firstName} ${poll?.experienceInfo?.experienceClassExpert?.lastName}`}
                                       </p>
                                    </Flex>
                                    <span className="duration">
                                       <Clock
                                          size={theme.sizes.h6}
                                          color={theme.colors.textColor4}
                                       />
                                       <span>
                                          {getMinute(
                                             poll?.experienceInfo?.duration
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
                                       <span>Total poll options</span>
                                    </p>
                                    <p className="exp-info">
                                       {poll?.bookingOptionsCount}
                                    </p>
                                 </Flex>
                                 <Flex
                                    container
                                    alignItems="center"
                                    justifyContent="space-between"
                                    margin="0 0 4px 0"
                                 >
                                    <p className="exp-info">
                                       <span>Most voted option</span>
                                    </p>
                                    <p className="exp-info">
                                       {getDateWithTime(
                                          poll?.mostVotedOption?.experienceClass
                                             ?.startTimeStamp
                                       )}{' '}
                                       {console.log(poll?.mostVotedOption)}(
                                       {
                                          poll?.mostVotedOption?.voting
                                             ?.aggregate?.count
                                       }{' '}
                                       votes)
                                    </p>
                                 </Flex>
                                 {poll?.cartInfo?.balancePayment > 0 && (
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
                                          $ {poll?.cartInfo?.balancePayment}
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
                  message="You have'nt created any poll yet!"
                  linkUrl="/experiences"
                  linkText="Checkout our Experiences"
               />
            )}
         </Wrapper>
         <div id="myPolls-bottom-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'myPolls-bottom-01')
                     ?.content
               )}
         </div>
      </Layout>
   )
}

export const getStaticProps = async () => {
   const domain = 'primanti.dailykit.org'
   const where = {
      id: { _in: ['myPolls-top-01', 'myPolls-bottom-01'] }
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
   .my-polls-section {
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

   @media (max-width: 769px) {
      .my-polls-section {
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
