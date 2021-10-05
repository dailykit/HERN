import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useToasts } from 'react-toast-notifications'
import jwt_decode from 'jwt-decode'
import { useSubscription, useQuery } from '@apollo/client'
import styled from 'styled-components'
import { theme } from '../../theme'
import {
   Invite,
   SubmitResponse
} from '../../pageComponents/pollInviteResponseComponents'
import { BackDrop, SEO, Layout, InlineLoader } from '../../components'
import { useUser } from '../../Providers'
import { getNavigationMenuItems } from '../../lib'
import { useWindowDimensions, isExpired, isEmpty } from '../../utils'
import {
   EXPERIENCE_BOOKING_PARTICIPANT_INFO,
   EXPERIENCE_POLLS
} from '../../graphql'

export default function PollResponse({ navigationMenuItems }) {
   const router = useRouter()
   const { token } = router.query // get encrypted token from query
   const { isAuthenticated } = useUser()
   const { addToast } = useToasts()
   const { width } = useWindowDimensions()

   const decodedToken = jwt_decode(token) // decode token to get most of the info.
   const [isCelebrating, setIsCelebrating] = useState(false)
   const [isPollClosed, setIsPollClosed] = useState(false)
   const participantInfo = localStorage.getItem('participantInfo')
   const localStorageData = JSON.parse(participantInfo)

   const {
      loading: isExperienceBookingLoading,
      error: hasExperienceBookingError,
      data: { experienceBooking = {} } = {}
   } = useSubscription(EXPERIENCE_POLLS, {
      variables: {
         id: decodedToken?.experienceBookingId
      }
   })

   const {
      data: { experienceBookingParticipant = {} } = {},
      loading: isParticipantInfoLoading
   } = useQuery(EXPERIENCE_BOOKING_PARTICIPANT_INFO, {
      skip: !Boolean(
         decodedToken?.participantId || localStorageData?.participantId
      ),
      variables: {
         id: decodedToken?.participantId || localStorageData?.participantId
      },
      onError: error => {
         console.error(error)
         addToast('Something went wrong!', { appearance: 'error' })
      }
   })

   const stopCelebration = () => {
      setTimeout(setIsCelebrating(false), 2000)
      if (isAuthenticated) {
         router.push('/')
      } else {
         router.push('/intro')
      }
   }
   const startCelebration = () => {
      setIsCelebrating(true)
      setTimeout(stopCelebration, 2000)
   }
   console.log(decodedToken)

   useEffect(() => {
      //setting poll closed to true when cut off time is reached or public url is not active
      if (decodedToken?.cutoffDate && !isEmpty(experienceBooking)) {
         if (
            !experienceBooking?.isPublicUrlActive ||
            isExpired(decodedToken?.cutoffDate, new Date())
         ) {
            setIsPollClosed(true)
         } else {
            setIsPollClosed(false)
         }
      }
   }, [decodedToken, experienceBooking])

   if (hasExperienceBookingError) {
      console.log(hasExperienceBookingError)
      addToast('Something went wrong!', { appearance: 'error' })
   }
   if (isExperienceBookingLoading || isParticipantInfoLoading) {
      return <InlineLoader type="full" />
   }
   return (
      <Layout navigationMenuItems={navigationMenuItems}>
         <SEO title="Poll Rsvp" />
         <StyledWrap>
            <Wrapper isCelebrating={isCelebrating || isPollClosed}>
               <Invite
                  invitedBy={decodedToken?.invitedBy}
                  cardData={
                     experienceBooking?.experienceBookingOptions[0]
                        ?.experienceClass
                  }
                  isPollClosed={isPollClosed}
               />
               <p className="normal-heading">
                  Select the dates and times that work for you.
               </p>

               <SubmitResponse
                  decodedToken={decodedToken}
                  startCelebration={startCelebration}
                  options={experienceBooking?.experienceBookingOptions}
                  isPollClosed={isPollClosed}
                  localStorageData={localStorageData}
                  experienceBookingParticipant={experienceBookingParticipant}
               />
            </Wrapper>

            <BackDrop show={isCelebrating}>
               <div className="response-done">
                  <img src="/assets/images/pin.png" alt="pin-emoji" />
                  <h2>Your Response is submitted!</h2>
                  <p>See you with the flock soon</p>
               </div>
            </BackDrop>
            <BackDrop show={isPollClosed}>
               <div className="response-done">
                  <img src="/assets/images/pin.png" alt="pin-emoji" />
                  <h2>
                     Hey, thanks for visiting Poll invite! The poll is closed
                     now, but
                  </h2>
                  <h3>keep an eye on the next one!</h3>
                  <Link href="/experiences">
                     <p className="linkToExperiences">
                        Checkout our experiences
                     </p>
                  </Link>
               </div>
            </BackDrop>
         </StyledWrap>
      </Layout>
   )
}

export const getStaticProps = async () => {
   const domain = 'primanti.dailykit.org'
   const navigationMenuItems = await getNavigationMenuItems(domain)
   return {
      props: {
         navigationMenuItems
      }
   }
}

const Wrapper = styled.div`
   width: 100%;
   height: 100%;
   position: relative;
   filter: ${({ isCelebrating }) => isCelebrating && 'blur(4px)'};
   .normal-heading {
      font-size: ${theme.sizes.h8};
      font-weight: 600;
      color: ${theme.colors.textColor4};
      margin: 2rem 0;
      text-align: center;
   }

   @media (min-width: 769px) {
      width: 60%;
      height: 100%;
      margin: 2rem auto;
      background: #212530;
      box-shadow: 1px 1px 2px rgba(38, 43, 56, 0.3),
         -1px -1px 2px rgba(28, 31, 40, 0.5),
         inset -16px 16px 32px rgba(28, 31, 40, 0.2),
         inset 16px -16px 32px rgba(28, 31, 40, 0.2),
         inset -16px -16px 32px rgba(38, 43, 56, 0.9),
         inset 16px 16px 40px rgba(28, 31, 40, 0.9);

      position: relative;
      .footer-sticky-btn-div {
         bottom: 0;
      }
   }
`

const StyledWrap = styled.div`
   .response-done {
      margin-top: 4rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      img {
         width: 94px;
         height: 94px;
         display: block;
         margin-left: auto;
         margin-right: auto;
      }
      h2 {
         font-size: ${theme.sizes.h3};
         font-weight: 700;
         color: ${theme.colors.textColor4};
         text-align: center;
         margin-bottom: 25px;
      }
      h3 {
         font-size: ${theme.sizes.h4};
         font-weight: 700;
         color: ${theme.colors.textColor4};
         text-align: center;
         margin-bottom: 25px;
      }
      p {
         font-size: ${theme.sizes.h8};
         font-weight: 600;
         color: ${theme.colors.textColor4};
         text-align: center;
      }
      .linkToExperiences {
         font-size: ${theme.sizes.h8};
         font-weight: 600;
         color: ${theme.colors.textColor};
         text-align: center;
         text-decoration: none;

         position: relative;
         padding: 8px 0;

         &:after {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
            width: 0%;
            content: '';
            color: ${theme.colors.textColor};
            background: ${theme.colors.textColor};
            height: 2px;
         }
         &:hover {
            color: ${theme.colors.textColor};
            &:after {
               width: 100%;
            }
         }
      }
      .linkToExperiences,
      .linkToExperiences:before,
      .linkToExperiences:after {
         transition: all 560ms;
      }
   }
`
