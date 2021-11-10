import React, { useEffect, useRef, useState } from 'react'
import ReactHtmlParser from 'react-html-parser'
import { Empty } from 'antd'
import { useRouter } from 'next/router'
import { useSubscription, useQuery } from '@apollo/client'
import { Flex } from '@dailykit/ui'
import styled from 'styled-components'
import {
   Button,
   EditIcon,
   Modal,
   SEO,
   Layout,
   Tags,
   RenderCard,
   SignupFold
} from '../components'
import { theme } from '../theme'
import { getNavigationMenuItems, getBannerData, getGlobalFooter } from '../lib'
import { useUser } from '../Providers'
import { isEmpty, fileParser } from '../utils'
import {
   CATEGORY_EXPERIENCE,
   EXPERT_BY_CATEGORY,
   CUSTOMER_SELECTED_TAGS
} from '../graphql'
import { ExperienceSkeleton } from '../components'

export default function Home({
   navigationMenuItems = [],
   parsedData = [],
   footerHtml = ''
}) {
   const { state } = useUser()
   const { user = {}, isAuthenticated } = state
   const router = useRouter()
   const [isTagsModalVisible, setTagsModalVisible] = useState(false)
   const [iconSize, setIconSize] = useState('14px')
   const [categories, setCategories] = useState([])
   const [experts, setExperts] = useState([])
   const [selectedTags, setSelectedTags] = useState([])
   const [isLoading, setIsLoading] = useState(true)
   const homeTop01 = useRef()
   const homeTop02 = useRef()
   const homeBottom01 = useRef()

   const { loading: isSelectedTagsLoading, error: selectedTagsQueryError } =
      useSubscription(CUSTOMER_SELECTED_TAGS, {
         skip: isEmpty(user) || isEmpty(user.keycloakId),
         onSubscriptionData: ({
            subscriptionData: {
               data: { crm_customer_experienceTags_by_pk = {} } = {}
            } = {}
         } = {}) => {
            setSelectedTags(crm_customer_experienceTags_by_pk?.tags)
         },
         variables: {
            keycloakId: user?.keycloakId
         }
      })

   const { loading } = useQuery(CATEGORY_EXPERIENCE, {
      variables: {
         params: {
            keycloakId: user?.keycloakId || null
         }
      },
      onCompleted: ({
         experiences_experienceCategory: ExperienceCategories = []
      } = {}) => {
         console.log({ ExperienceCategories })
         setCategories(ExperienceCategories)
         setIsLoading(false)
      },
      onError: error => {
         console.log(error)
      }
   })

   const { loading: expertByCategoryLoading, error: expertByCategoryError } =
      useSubscription(EXPERT_BY_CATEGORY, {
         variables: {
            where: {
               title: {
                  _in: ['Mixology']
               }
            }
         },
         onSubscriptionData: ({
            subscriptionData: {
               data: { experiences_experienceCategory = [] } = {}
            } = {}
         } = {}) => {
            setExperts(experiences_experienceCategory)
         }
      })

   // handler for experience-explore more button
   const handleExperienceExploreMore = () => {
      router.push('/experiences')
   }

   const openTagsModal = () => {
      setTagsModalVisible(true)
   }
   const closeTagsModal = () => {
      setTagsModalVisible(false)
   }

   useEffect(() => {
      if (parsedData.length && typeof document !== 'undefined') {
         /*Filter undefined scripts*/
         const scripts = parsedData.flatMap(fold => fold.scripts)
         const filterScripts = scripts.filter(Boolean)
         if (Boolean(filterScripts.length)) {
            const fragment = document.createDocumentFragment()
            filterScripts.forEach(script => {
               const s = document.createElement('script')
               s.setAttribute('type', 'text/javascript')
               s.setAttribute('src', script)
               fragment.appendChild(s)
            })
            document.body.appendChild(fragment)
         }
      }
   }, [parsedData])

   if (expertByCategoryError || selectedTagsQueryError) {
      console.log(expertByCategoryError || selectedTagsQueryError)
   }

   return (
      <Layout navigationMenuItems={navigationMenuItems} footerHtml={footerHtml}>
         <SEO title="StayInSocial" />
         <StyledWrapper bgMode="dark">
            <div ref={homeTop01} id="home-top-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(fold => fold.id === 'home-top-01')?.content
                  )}
            </div>
            <div className="content-container">
               <section id="explore-experiences">
                  {!isEmpty(categories) && (
                     <RenderCard
                        data={categories
                           .map(
                              category =>
                                 category?.experience_experienceCategories
                           )
                           .flat()}
                        // data={categories}
                        type="experience"
                        layout="carousel"
                        showCategorywise={false}
                        keyname="experience_experienceCategories"
                     />
                  )}
               </section>
               <Button
                  className="explore__btn text9"
                  onClick={handleExperienceExploreMore}
               >
                  Explore More
               </Button>
               <div ref={homeTop02} id="home-top-02">
                  {Boolean(parsedData.length) &&
                     ReactHtmlParser(
                        parsedData.find(fold => fold.id === 'home-top-02')
                           ?.content
                     )}
               </div>
               <h3 className="heading_black_bg">
                  Virtual Experience Creators & Industry Experts
               </h3>
               <p className="experienceHeading2 text5">
                  Our experiences will be lead by our qualified experts, who are
                  professional, highly skilled and fun to work with.
               </p>
               <section id="explore-expert">
                  {!isEmpty(experts) && (
                     <RenderCard
                        data={experts.map(expert => expert?.experts).flat()}
                        // data={experts}
                        type="expert"
                        layout="masonry"
                        showCategorywise={false}
                        keyname="expert"
                     />
                  )}
               </section>

               {/* signup fold */}
               {!isAuthenticated && <SignupFold bgMode="dark" />}
            </div>
            <Modal
               title="Tell us what you’re interested in"
               type="popup"
               isOpen={isTagsModalVisible}
               close={closeTagsModal}
            >
               <Tags onSubmit={closeTagsModal} />
            </Modal>
            <div ref={homeBottom01} id="home-bottom-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(fold => fold.id === 'home-bottom-01')
                        ?.content
                  )}
            </div>
         </StyledWrapper>
      </Layout>
   )
}

export const getStaticProps = async () => {
   const domain = 'primanti.dailykit.org'
   const where = {
      id: { _in: ['home-top-01', 'home-top-02', 'home-bottom-01'] }
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

const StyledWrapper = styled.div`
   width: 100%;
   height: 100%;
   overflow: auto;
   background: ${({ bgMode }) =>
      bgMode === 'dark'
         ? theme.colors.darkBackground.darkblue
         : theme.colors.lightBackground.white};
   .content-container {
      margin: 2rem;
   }
   .explore__btn {
      width: auto;
      margin: 4rem auto 6rem auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Maven Pro';
      font-style: normal;
      font-weight: 800;
      color: ${theme.colors.textColor};
      padding: 24px 64px;
      letter-spacing: 0.16em;
   }
   .skeleton-wrapper {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: 0 2rem;
   }
   .experienceHeading {
      color: ${theme.colors.textColor};
      font-weight: 400;
      text-align: center;
      margin-bottom: 20px;
      text-transform: uppercase;
      font-family: 'Barlow Condensed';
   }
   .experienceHeading2 {
      color: ${theme.colors.textColor4};
      font-weight: 400;
      text-align: center;
      margin-bottom: 4rem;
   }
   .upcomingExperience-div {
      padding: 0;
      box-shadow: none;
      border-radius: 0;
   }
   .chooseTagBtn {
      height: 48px;
      width: auto;
      text-transform: none;
      font-weight: 500;
      background: ${theme.colors.textColor4};
      font-family: 'Maven Pro';
      font-style: normal;
      font-weight: 800;
      color: ${theme.colors.textColor};
      padding: 0 2rem;
      letter-spacing: 0.16em;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
   }
   @media screen and (min-width: 769px) {
      .content-container {
         margin: 2rem 6rem;
      }
      .explore__btn {
         padding: 24px 72px;
         letter-spacing: 0.3em;
      }
   }
`

const CategoryTagWrap = styled.div`
   display: flex;
   flex-wrap: wrap;
   justify-content: center;
   gap: 1rem;
   .categoryTag {
      height: 48px;
      width: auto;
      text-transform: none;
      font-weight: 500;
      background: ${theme.colors.textColor4};
      font-family: 'Maven Pro';
      font-style: normal;
      font-weight: 800;
      color: ${theme.colors.textColor};
      padding: 0 2rem;
      letter-spacing: 0.16em;
   }
   @media screen and (min-width: 769px) {
      .categoryTag {
         letter-spacing: 0.3em;
      }
   }
`

const CategorySection = styled.div`
   margin: 4rem 0;
   .explore {
      text-align: center;
      color: ${theme.colors.textColor};
      font-weight: 800;
      margin-left: 8px;
      position: relative;
      padding: 8px 0;
      text-decoration: none;
      margin-bottom: 0;
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
   .explore,
   .explore:before,
   .explore:after {
      transition: all 560ms;
   }
   .edit_tags {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem 0;
      margin: 0 0 2rem 0;
      cursor: pointer;
   }

   .ant-empty {
      margin: 0 0 1rem 0;
   }
`
