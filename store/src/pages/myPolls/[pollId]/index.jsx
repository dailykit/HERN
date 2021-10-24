import React, { useState, useMemo, useEffect } from 'react'
import { useSubscription } from '@apollo/client'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import ReactHtmlParser from 'react-html-parser'
import styled from 'styled-components'
import {
   PollInvite,
   ChevronLeft,
   SEO,
   Layout,
   InlineLoader
} from '../../../components'
import { EXPERIENCE_POLLS } from '../../../graphql'
import { theme } from '../../../theme'
import { fileParser, getMinute, getDateWithTime } from '../../../utils'
import {
   getNavigationMenuItems,
   getBannerData,
   getGlobalFooter
} from '../../../lib'
import { useExperienceInfo } from '../../../Providers'

export default function MyBooking({
   navigationMenuItems,
   parsedData = [],
   footerHtml = ''
}) {
   const router = useRouter()
   const { pollId } = router.query
   const { addToast } = useToasts()
   const { setExperienceId, isLoading } = useExperienceInfo()
   const [experienceInfo, setExperienceInfo] = useState(null)
   const [loading, setLoading] = useState(true)
   const { error: hasExperienceBookingError } = useSubscription(
      EXPERIENCE_POLLS,
      {
         skip: !pollId,
         variables: {
            id: pollId
         },
         onSubscriptionData: ({
            subscriptionData: {
               data: { experienceBooking: bookingData = {} } = {}
            } = {}
         } = {}) => {
            if (bookingData && Object.keys(bookingData).length) {
               setExperienceInfo(bookingData)
            }
            console.log('bookingData', bookingData)
            setLoading(false)
         }
      }
   )
   useEffect(() => {
      if (experienceInfo) {
         setExperienceId(
            experienceInfo?.experienceBookingOptions[0]?.experienceClass
               ?.experienceId
         )
      }
   }, [experienceInfo])

   if (loading || isLoading) return <InlineLoader type="full" />
   if (hasExperienceBookingError) {
      setLoading(false)
      addToast('Opps! Something went wrong!', { appearance: 'error' })
      console.error(hasExperienceBookingError)
   }

   return (
      <Layout navigationMenuItems={navigationMenuItems} footerHtml={footerHtml}>
         <div id="myPoll-top-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'myPoll-top-01')?.content
               )}
         </div>
         <SEO title={`Poll-${pollId}`} />
         <Wrapper>
            <div className="checkout-heading">
               <span
                  className="back-button"
                  onClick={() => router.push(`/myPolls`)}
               >
                  <ChevronLeft size="20" color={theme.colors.textColor4} />
               </span>
               <h1>My Poll</h1>
            </div>
            <div className="container">
               <div className="left-side-container">
                  <PollInvite experienceBooking={experienceInfo} />
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
         <div id="myPoll-bottom-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'myPoll-bottom-01')
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
         _in: ['myPoll-top-01', 'myPoll-bottom-01']
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

export function Card({ experienceInfo = null }) {
   const experience =
      experienceInfo?.experienceBookingOptions[0]?.experienceClass?.experience
   const experienceClass =
      experienceInfo?.experienceBookingOptions[0]?.experienceClass
   const totalPollOptions = experienceInfo?.experienceBookingOptions.length
   const mostVotedOption = useMemo(() => {
      const result = experienceInfo?.experienceBookingOptions.reduce(
         (prev, current) => {
            return prev?.voting?.aggregate?.count >
               current?.voting?.aggregate?.count
               ? prev
               : current
         }
      )
      return result
   }, [experienceInfo])

   return (
      <CardWrapper>
         <div className="experience-info">
            <img src={experience?.assets?.images[0]} alt="experince-img" />
            <div className="experience-details">
               <p>Duration: {getMinute(experienceClass?.duration)} mins</p>
               <p>{experience?.title}</p>
            </div>
         </div>
         <div className="price-details">
            <h2>Poll details</h2>
            <div className="pricing">
               <p>Created at</p>
               <p> {getDateWithTime(experienceInfo?.created_at)}</p>
            </div>
            <div className="pricing">
               <p>Total poll options</p>
               <p>{totalPollOptions}</p>
            </div>
            <div className="pricing">
               <p>Most voted option</p>
               <p>
                  {getDateWithTime(
                     mostVotedOption?.experienceClass?.startTimeStamp
                  )}{' '}
                  ({mostVotedOption?.voting?.aggregate?.count} votes)
               </p>
            </div>
         </div>
      </CardWrapper>
   )
}
