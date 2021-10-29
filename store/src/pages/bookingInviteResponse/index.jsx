import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Link from 'next/link'
import { useToasts } from 'react-toast-notifications'
import jwt_decode from 'jwt-decode'
import { useSubscription, useQuery } from '@apollo/client'
import {
   Invite,
   ResponseForm,
   AddKit,
   AddAddress,
   FooterButton
} from '../../pageComponents/bookingInviteResponseComponents'
import {
   BackDrop,
   ChevronLeft,
   Layout,
   SEO,
   InlineLoader
} from '../../components'
import { useCustomMutation } from '../../customMutations/useBookingInviteResponseCustomMutation'
import { useUser, useRsvp } from '../../Providers'
import { isExpired, isEmpty } from '../../utils'
import { getNavigationMenuItems, getGlobalFooter } from '../../lib'
import { theme } from '../../theme'
import {
   EXPERIENCE_BOOKING,
   EXPERIENCE_BOOKING_PARTICIPANT_INFO
} from '../../graphql'

export default function PollResponse({ navigationMenuItems, footerHtml = '' }) {
   const { PARTICIPANT } = useCustomMutation()
   const router = useRouter()
   const { token } = router.query
   const { state: userState } = useUser()
   const { state: rsvpState, updateRsvpInfo, previousRsvpStep } = useRsvp()
   const { rsvpStepIndex } = rsvpState
   const { isAuthenticated, user } = userState
   const { addToast } = useToasts()
   const decodedToken = jwt_decode(token)
   console.log(decodedToken)
   const [isCelebrating, setIsCelebrating] = useState(false)
   const [isPollClosed, setIsPollClosed] = useState(false)
   const participantInfo = localStorage.getItem('participantInfo')
   const localStorageData = JSON.parse(participantInfo)
   const {
      loading: isExperienceBookingLoading,
      error: hasExperienceBookingError,
      data: { experienceBooking = {} } = {}
   } = useSubscription(EXPERIENCE_BOOKING, {
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
      router.push('/bookingInviteResponse/thankyou')
   }
   const startCelebration = () => {
      setIsCelebrating(true)
      setTimeout(stopCelebration, 2000)
   }

   useEffect(() => {
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

   // ask for login only when parent share is not 100 (percent) and if not authenticated
   useEffect(() => {
      const setUrlToLocalStorage = async () => {
         localStorage.setItem('bookingInviteUrl', `${window.location.href}`)
      }
      if (decodedToken?.parentShare !== 100 && !isAuthenticated) {
         setUrlToLocalStorage()
         router.push('/')
      }
   }, [])

   useEffect(() => {
      if (!isExperienceBookingLoading && !isParticipantInfoLoading) {
         updateRsvpInfo({
            experienceBooking,
            experienceBookingParticipant,
            decodedToken,
            isPollClosed,
            isPublicUrl: Boolean(!decodedToken?.participantId),
            participantId: experienceBookingParticipant?.id,
            responseDetails: {
               email: {
                  value:
                     experienceBookingParticipant?.email ||
                     user?.email ||
                     decodedToken?.invitee?.email ||
                     '',
                  error: ''
               },
               phone: {
                  value:
                     experienceBookingParticipant?.phone ||
                     user?.phone ||
                     decodedToken?.invitee?.phone ||
                     '',
                  error: ''
               }
            }
         })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      experienceBooking,
      experienceBookingParticipant,
      isParticipantInfoLoading,
      isExperienceBookingLoading,
      isPollClosed
   ])

   useEffect(() => {
      if (!isPollClosed) {
         if (
            !localStorageData?.participantId &&
            Boolean(!decodedToken?.participantId)
         ) {
            // if we don't have participantId in localStorage/token
            // it means the invite url is a public url
            // hence we create participant as soon as they open the invite url

            PARTICIPANT.create.mutation({
               variables: {
                  object: {
                     experienceBookingId: decodedToken?.experienceBookingId,
                     keycloakId: user.keycloakId ? user?.keycloakId : null,
                     childCart: {
                        data: {
                           parentCartId: decodedToken?.experienceBookingCartId,
                           experienceClassId:
                              experienceBooking?.parentCart?.experienceClassId,
                           experienceClassTypeId:
                              experienceBooking?.parentCart
                                 ?.experienceClassTypeId
                        }
                     }
                  }
               }
            })
         }
      }
   }, [])

   if (hasExperienceBookingError) {
      console.log(hasExperienceBookingError)
      addToast('Something went wrong!', { appearance: 'error' })
   }
   if (isExperienceBookingLoading || isParticipantInfoLoading) {
      return <InlineLoader type="full" />
   }
   return (
      <Layout navigationMenuItems={navigationMenuItems} footerHtml={footerHtml}>
         <SEO title="Booking Rsvp" />
         <StyledWrap bgMode="dark">
            <Wrapper isCelebrating={isCelebrating || isPollClosed}>
               <h1 className="heading_h1 text2">
                  You are invited by{' '}
                  <span className="invited_by">
                     {decodedToken.invitedBy?.name ||
                        decodedToken.invitedBy?.email}
                  </span>
               </h1>
               <div className="main_container">
                  {rsvpStepIndex === 0 ? (
                     <>
                        <Invite
                           invitedBy={decodedToken?.invitedBy}
                           cardData={{
                              ...experienceBooking?.experienceClass?.experience,
                              experienceClass:
                                 experienceBooking?.experienceClass
                           }}
                           isPollClosed={isPollClosed}
                        />
                        <ResponseForm decodedToken={decodedToken} />
                     </>
                  ) : (
                     <>
                        <span
                           className="previousBtn"
                           onClick={() => previousRsvpStep(rsvpStepIndex)}
                        >
                           <ChevronLeft
                              size={theme.sizes.h3}
                              color={theme.colors.textColor7}
                           />
                        </span>
                        <AddKit decodedToken={decodedToken} />
                        <AddAddress />
                     </>
                  )}

                  <FooterButton
                     startCelebration={startCelebration}
                     decodedToken={decodedToken}
                  />
               </div>
            </Wrapper>

            <BackDrop show={isCelebrating}>
               <div className="response-done">
                  <img src="/assets/images/celebration.png" alt="pin-emoji" />
                  <h2>You’re BOOKED!</h2>
                  <p>
                     We have emailed you the invite as well as created calendar
                     invite for you with all of the details!
                  </p>
               </div>
            </BackDrop>
            <BackDrop show={isPollClosed}>
               <div className="response-done">
                  <img src="/assets/images/pin.png" alt="pin-emoji" />
                  <h2>
                     Sorry, we're no longer accepting RSVPs for this event.
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
   const footerHtml = await getGlobalFooter()
   return {
      props: {
         navigationMenuItems,
         footerHtml
      }
   }
}

const Wrapper = styled.div`
   filter: ${({ isCelebrating }) => isCelebrating && 'blur(4px)'};
   position: relative;
   padding-top: 4rem;
   .proxinova_text {
      font-family: 'Maven Pro';
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.16em;
      color: ${theme.colors.textColor5};
   }
   .normal-heading {
      color: ${theme.colors.textColor5};
      margin: 2rem 0;
      padding: 0 1rem;
   }
   .heading_h1 {
      font-family: League-Gothic;
      font-style: normal;
      font-weight: normal;
      text-align: center;
      color: ${theme.colors.textColor4};
      .invited_by {
         font-size: inherit;
         font-family: League-Gothic;
         font-style: normal;
         font-weight: normal;
         text-align: center;
         color: ${theme.colors.textColor};
      }
   }

   .main_container {
      background: ${theme.colors.lightBackground.grey};
      border-radius: 40px;
      position: relative;
   }

   .previousBtn {
      margin: 0;
      position: absolute;
      top: 2rem;
      left: 1rem;
      cursor: pointer;
      &:hover {
         svg {
            stroke: ${theme.colors.textColor};
         }
      }
   }

   @media (min-width: 769px) {
      width: 70%;
      height: 100%;
      margin: 0 auto;
      .footer-sticky-btn-div {
         bottom: 2rem;
      }
   }
`

const StyledWrap = styled.div`
   background: ${({ bgMode }) =>
      bgMode === 'dark'
         ? theme.colors.darkBackground.darkblue
         : theme.colors.lightBackground.white};
   padding: 4rem 2rem;
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
