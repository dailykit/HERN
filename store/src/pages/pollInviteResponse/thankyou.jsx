import React, { useState } from 'react'
import { useSubscription, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import ReactHtmlParser from 'react-html-parser'
import { useToasts } from 'react-toast-notifications'
import styled from 'styled-components'
import { SIMILAR_CATEGORY_EXPERIENCE } from '../../graphql'
import { getNavigationMenuItems, getBannerData } from '../../lib'
import { fileParser, isEmpty } from '../../utils'
import { theme } from '../../theme'
import { useUser } from '../../Providers'
import {
   BackDrop,
   SEO,
   Layout,
   InlineLoader,
   Button,
   RenderCard,
   SignupFold
} from '../../components'

export default function PollInviteThankyou({
   navigationMenuItems = [],
   parsedData = []
}) {
   const { state } = useUser()
   const { isAuthenticated } = state
   const router = useRouter()
   const { addToast } = useToasts()
   const [categories, setCategories] = useState([])
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

   const handleExperienceExploreMore = () => {
      router.push('/experiences')
   }

   if (isSimilarExperiencesLoading) {
      return <InlineLoader type="full" />
   }
   return (
      <Layout navigationMenuItems={navigationMenuItems}>
         <SEO title="Poll Rsvp" />
         <div id="pollInviteResponseThankyou-top-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(
                     fold => fold.id === 'pollInviteResponseThankyou-top-01'
                  )?.content
               )}
         </div>
         <Wrapper bgMode="dark">
            <h1 className="heading text1">THANK YOU FOR YOUR VOTE!</h1>
            <h1 className="heading text1">
               DISCOVER & BOOK UNIQUE VIRTUAL EXPERIENCES HOSTED IN YOUR HOME
            </h1>
            {!isEmpty(categories) && (
               <RenderCard
                  data={categories
                     .map(category => category?.experience_experienceCategories)
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

            {!isAuthenticated && <SignupFold bgMode="dark" />}

            <div id="pollInviteResponseThankyou-bottom-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(
                        fold =>
                           fold.id === 'pollInviteResponseThankyou-bottom-01'
                     )?.content
                  )}
            </div>
         </Wrapper>
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
   return {
      props: {
         navigationMenuItems,
         parsedData
      }
   }
}

const Wrapper = styled.div`
   padding: 6rem 2rem;
   background: ${({ bgMode }) =>
      bgMode === 'dark'
         ? theme.colors.darkBackground.darkblue
         : theme.colors.lightBackground.white};
   .heading {
      font-family: League-Gothic;
      font-style: normal;
      font-weight: normal;
      text-align: center;
      letter-spacing: 0.08em;
      width: 80%;
      margin: 4rem auto;
      color: ${theme.colors.textColor};
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
