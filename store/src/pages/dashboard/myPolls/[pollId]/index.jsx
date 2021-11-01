import React, { useState, useMemo, useEffect } from 'react'
import { useSubscription } from '@apollo/client'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import ReactHtmlParser from 'react-html-parser'
import { Button, Result } from 'antd'
import styled from 'styled-components'
import {
   PollInvite,
   ChevronLeft,
   SEO,
   Layout,
   InlineLoader,
   Button as ButtonComponent
} from '../../../../components'
import PollCard from '../../../../pageComponents/PollCard'
import { EXPERIENCE_POLLS } from '../../../../graphql'
import { theme } from '../../../../theme'
import { fileParser, isEmpty } from '../../../../utils'
import {
   getNavigationMenuItems,
   getBannerData,
   getGlobalFooter,
   protectedRoute
} from '../../../../lib'
import { useExperienceInfo } from '../../../../Providers'

function ManagePoll({ navigationMenuItems, parsedData = [], footerHtml = '' }) {
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
            if (!isEmpty(bookingData)) {
               setExperienceInfo(bookingData)
            }
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
            <h1 className="h1_head text1">Manage Poll</h1>
            {!isEmpty(experienceInfo) ? (
               <div className="container">
                  <div className="left-side-container">
                     <PollInvite experienceBooking={experienceInfo} />
                  </div>
                  <div className="right-side-container">
                     <div className="sticky-card">
                        <div className="card-wrapper">
                           <PollCard experienceInfo={experienceInfo} />
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               <Result
                  status="404"
                  title="Not Found!"
                  subTitle="Sorry, the page you visited does not exist."
                  extra={
                     <ButtonComponent
                        className="back_to_home_btn"
                        onClick={() => router.push('/')}
                     >
                        Back Home
                     </ButtonComponent>
                  }
               />
            )}
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

export default protectedRoute(ManagePoll)

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
         font-family: 'Maven Pro';
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
