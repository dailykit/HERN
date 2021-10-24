import React, { useEffect, useState } from 'react'
import ReactHtmlParser from 'react-html-parser'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useToasts } from 'react-toast-notifications'
import jwt_decode from 'jwt-decode'
import { useSubscription, useQuery } from '@apollo/client'
import styled from 'styled-components'
import { theme } from '../../theme'
import { SIMILAR_CATEGORY_EXPERIENCE } from '../../graphql'
import {
   Invite,
   SubmitResponse
} from '../../pageComponents/pollInviteResponseComponents'
import {
   BackDrop,
   SEO,
   Layout,
   InlineLoader,
   Button,
   RenderCard
} from '../../components'
import { useUser } from '../../Providers'
import {
   getNavigationMenuItems,
   getBannerData,
   getGlobalFooter
} from '../../lib'
import {
   useWindowDimensions,
   isExpired,
   isEmpty,
   fileParser
} from '../../utils'
import {
   EXPERIENCE_BOOKING_PARTICIPANT_INFO,
   EXPERIENCE_POLLS
} from '../../graphql'

export default function PollResponse({
   navigationMenuItems,
   parsedData = [],
   footerHtml = ''
}) {
   const router = useRouter()
   const { token } = router.query // get encrypted token from query
   const { isAuthenticated } = useUser()
   const { addToast } = useToasts()
   const { width } = useWindowDimensions()

   const decodedToken = jwt_decode(token) // decode token to get most of the info.
   const [isCelebrating, setIsCelebrating] = useState(false)
   const [isPollClosed, setIsPollClosed] = useState(false)
   const [categories, setCategories] = useState([])
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

   // Similar experiences query
   const { loading: isSimilarExperiencesLoading } = useQuery(
      SIMILAR_CATEGORY_EXPERIENCE,
      {
         // skip: isEmpty(tagIds),
         variables: {
            tags: [1006] // need to have this tagsIds  dynamic later on
         },
         onCompleted: ({
            experiences_experienceCategory: ExperienceCategories = []
         } = {}) => {
            console.log('Similar Experiences', ExperienceCategories)
            setCategories(ExperienceCategories)
         },
         onError: error => {
            console.error(error)
            addToast('Something went wrong!', { appearance: 'error' })
         }
      }
   )

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

      router.push('/pollInviteResponse/thankyou')
   }
   const startCelebration = () => {
      setIsCelebrating(true)
      setTimeout(stopCelebration, 2000)
   }
   const handleExperienceExploreMore = () => {
      router.push('/experiences')
   }

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
   if (
      isExperienceBookingLoading ||
      isParticipantInfoLoading ||
      isSimilarExperiencesLoading
   ) {
      return <InlineLoader type="full" />
   }
   return (
      <Layout navigationMenuItems={navigationMenuItems} footerHtml={footerHtml}>
         <SEO title="Poll Rsvp" />
         <StyledWrap bgMode="dark">
            <Wrapper isCelebrating={isCelebrating || isPollClosed}>
               <h1 className="heading_h1 text2">
                  <span className="invited_by">
                     {decodedToken.invitedBy?.name ||
                        decodedToken.invitedBy?.email}
                  </span>{' '}
                  WANTS TO KNOW YOUR AVAILABILITY
               </h1>
               <div className="main_container">
                  <Invite
                     invitedBy={decodedToken?.invitedBy}
                     cardData={experienceBooking}
                     isPollClosed={isPollClosed}
                  />
                  <p className="League-Gothic text6 normal-heading">
                     Select below the date and time slot that best suits your
                     availability.
                  </p>

                  <SubmitResponse
                     decodedToken={decodedToken}
                     startCelebration={startCelebration}
                     options={experienceBooking?.experienceBookingOptions}
                     isPollClosed={isPollClosed}
                     localStorageData={localStorageData}
                     experienceBookingParticipant={experienceBookingParticipant}
                  />
               </div>
            </Wrapper>
            <div style={{ margin: '6rem 0' }}>
               {!isEmpty(categories) && (
                  <RenderCard
                     data={categories
                        .map(
                           category => category?.experience_experienceCategories
                        )
                        .flat()}
                     // data={categories}
                     type="experience"
                     layout="carousel"
                     showCategorywise={false}
                     showWishlist={false}
                     keyname="experience_experienceCategories"
                  />
               )}
               <Button
                  className="explore__btn text9"
                  onClick={handleExperienceExploreMore}
               >
                  Explore More
               </Button>
               <div id="pollInviteResponse-top-02">
                  {Boolean(parsedData.length) &&
                     ReactHtmlParser(
                        parsedData.find(fold => fold.id === 'home-top-02')
                           ?.content
                     )}
               </div>
            </div>

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
   const where = {
      id: {
         _in: [
            'pollInviteResponse-top-01',
            'pollInviteResponse-top-02',
            'pollInviteResponse-bottom-01'
         ]
      }
   }
   const navigationMenuItems = await getNavigationMenuItems(domain)
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

const Wrapper = styled.div`
   width: 100%;
   height: 100%;
   position: relative;
   filter: ${({ isCelebrating }) => isCelebrating && 'blur(4px)'};
   padding-top: 4rem;
   .proxinova_text {
      font-family: Proxima Nova;
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
   }

   @media (min-width: 769px) {
      width: 70%;
      height: 100%;
      margin: 0 auto;
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
   .explore__btn {
      width: auto;
      margin: 4rem auto 6rem auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 800;
      color: ${theme.colors.textColor};
      padding: 24px 64px;
      letter-spacing: 0.16em;
   }
`
