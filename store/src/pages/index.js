import React, { useEffect, useRef, useState } from 'react'
import ReactHtmlParser from 'react-html-parser'
import { useRouter } from 'next/router'
import { useSubscription } from '@apollo/client'
import { Flex } from '@dailykit/ui'
import styled from 'styled-components'
import {
   Button,
   EditIcon,
   Modal,
   SEO,
   Layout,
   Tags,
   RenderCard
} from '../components'
import { theme } from '../theme'
import { getNavigationMenuItems } from '../lib'
import { useUser } from '../Providers'
import { isEmpty, fileParser } from '../utils'
import {
   CATEGORY_EXPERIENCE,
   EXPERT_BY_CATEGORY,
   CUSTOMER_SELECTED_TAGS
} from '../graphql'
import { ExperienceSkeleton } from '../components'
import { getBannerData } from '../lib/getBannerData'

export default function Home({ navigationMenuItems = [], parsedData = [] }) {
   const { state } = useUser()
   const { user = {} } = state
   const router = useRouter()
   const [isTagsModalVisible, setTagsModalVisible] = useState(false)
   const [iconSize, setIconSize] = useState('14px')
   const [categories, setCategories] = useState([])
   const [experts, setExperts] = useState([])
   const [tagIds, setTagIds] = useState([])
   const [isLoading, setIsLoading] = useState(true)
   const homeTop01 = useRef()
   const homeTop02 = useRef()
   const homeBottom01 = useRef()

   const {
      loading: isSelectedTagsLoading,
      error: selectedTagsQueryError,
      data: { crm_customer_experienceTags: customerSelectedTags = [] } = {}
   } = useSubscription(CUSTOMER_SELECTED_TAGS, {
      skip: isEmpty(user) || isEmpty(user.keycloakId),
      onSubscriptionData: ({
         subscriptionData: {
            data: { crm_customer_experienceTags = [] } = {}
         } = {}
      } = {}) => {
         const result = crm_customer_experienceTags[0]?.tags.map(tag => tag.id)
         setTagIds(result)
      },
      variables: {
         keycloakId: user?.keycloakId
      }
   })

   const { loading, error } = useSubscription(CATEGORY_EXPERIENCE, {
      skip: isEmpty(tagIds),
      variables: {
         tags: tagIds,
         params: {
            keycloakId: user?.keycloakId || null
         }
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: {
               experiences_experienceCategory: ExperienceCategories = []
            } = {}
         } = {}
      } = {}) => {
         setCategories(ExperienceCategories)
         setIsLoading(false)
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

   if (error || expertByCategoryError || selectedTagsQueryError) {
      console.log(error || expertByCategoryError || selectedTagsQueryError)
   }

   return (
      <Layout navigationMenuItems={navigationMenuItems}>
         <SEO title="StayInSocial" />
         <StyledWrapper bgMode="dark">
            <div ref={homeTop01} id="home-top-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(fold => fold.id === 'home-top-01')?.content
                  )}
            </div>
            <div style={{ margin: '2rem' }}>
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
                     keyname="experience_experienceCategories"
                  />
               )}
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
               <h3 className="experienceHeading text2">Our Experts</h3>
               <p className="experienceHeading2 text5">
                  Our experiences will be lead by our qualified experts, who are
                  professional, highly skilled and fun to work with.
               </p>
               {!isEmpty(experts) && (
                  <RenderCard
                     data={experts.map(expert => expert?.experts).flat()}
                     // data={experts}
                     type="expert"
                     layout="carousel"
                     showCategorywise={false}
                     keyname="expert"
                  />
               )}

               {!isEmpty(customerSelectedTags) &&
                  !isEmpty(customerSelectedTags[0]?.tags) && (
                     <CategorySection>
                        <Flex
                           container
                           alignItems="center"
                           justifyContent="center"
                           padding="1rem 0"
                        >
                           <h3 className="experienceHeading text2">
                              Your personalized tags
                           </h3>
                        </Flex>
                        <CategoryTagWrap>
                           {customerSelectedTags[0]?.tags.map(tag => {
                              return (
                                 <Button
                                    key={tag?.id}
                                    isMainShadow
                                    className="categoryTag text8"
                                 >
                                    {tag?.title}
                                 </Button>
                              )
                           })}
                        </CategoryTagWrap>
                        {isSelectedTagsLoading && (
                           <div className="skeleton-wrapper">
                              {[1, 2, 3, 4].map((_, index) => {
                                 return <ExperienceSkeleton key={index} />
                              })}
                           </div>
                        )}

                        <div className="edit_tags">
                           <h1 onClick={openTagsModal} className="explore ">
                              Edit tags
                           </h1>
                           <EditIcon
                              size={iconSize}
                              color={theme.colors.textColor}
                           />
                        </div>
                     </CategorySection>
                  )}
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

   return {
      props: {
         navigationMenuItems,
         parsedData
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
      font-family: League-Gothic;
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
   @media screen and (min-width: 769px) {
      .explore__btn {
         padding: 24px 72px;
         letter-spacing: 0.3em;
      }
   }
`
const CardWrapper = styled.div`
   height: 267px;
   width: 350px;
   margin: 0 auto;
`
const CardWrapperForExpert = styled.div`
   padding: 1rem;
`

const GridViewWrapper = styled.div`
   margin-bottom: 4rem;
   a {
      position: relative;
      padding: 8px 0;
      text-decoration: none;
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
   a,
   a:before,
   a:after {
      transition: all 560ms;
   }

   .explore {
      text-align: center;
      font-size: ${theme.sizes.h4};
      color: ${theme.colors.textColor};
      font-weight: 800;
      margin-right: 8px;
   }
   .my-masonry-grid {
      display: -webkit-box; /* Not needed if autoprefixing */
      display: -ms-flexbox; /* Not needed if autoprefixing */
      display: flex;
      width: auto;
      margin-right: 40px;
   }

   .my-masonry-grid_column > div {
      margin: 0 0 40px 40px;
   }

   @media (min-width: 769px) {
      .exploreExperience {
         text-align: center;
         font-size: ${theme.sizes.h1};
         color: ${theme.colors.textColor};
         font-weight: 800;
      }
   }
   @media (max-width: 800px) {
      .my-masonry-grid {
         margin-right: 1rem;
      }
      .my-masonry-grid_column > div {
         margin: 0 0 1rem 1rem;
      }
   }
`

const GridView = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
   grid-auto-rows: 228px;
   justify-content: space-evenly;
   justify-items: center;
   align-content: space-evenly;
   align-items: center;
   @media (min-width: 769px) {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      grid-auto-rows: 283px;
   }
`
const GridViewForExpert = styled.div`
   display: flex;
   width: 100%;
   justify-content: flex-start;
   justify-items: center;
   align-content: space-evenly;
   align-items: center;
   overflow-y: auto;
`

const GreetingDiv = styled.div`
   position: relative;
   width: 100%;
   height: 400px;
   color: ${theme.colors.textColor4};
   padding: 30% 1rem;
   overflow: hidden;
   margin-bottom: 80px;
   &:after {
      width: 100%;
      height: 400px;
      content: '';
      background: url('/assets/images/Hero.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      opacity: 0.2;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      position: absolute;
      z-index: -1;
   }
   .greeting-name {
      font-size: ${theme.sizes.h2};
      font-weight: 800;
   }
   .greeting-msg {
      width: 90%;
      margin: 2rem auto 2rem 0;
      font-size: ${theme.sizes.h9};
   }
   .buttonWrapper {
      cursor: pointer;
   }
   .loginBtn {
      height: 48px;
      font-size: ${theme.sizes.h8};
   }
   .signupBtn {
      height: 48px;
      font-size: ${theme.sizes.h8};
   }
   .separatorNote {
      margin: 1rem 0;
      text-align: center;
      font-size: ${theme.sizes.h6};
      font-weight: 400;
      color: ${theme.colors.textColor4};
   }
   .forDesktop {
      display: none;
   }
   .forMobile {
      display: block;
   }
   @media (min-width: 769px) {
      height: 324px;
      padding: 4rem 1rem;
      &:after {
         height: 324px;
         padding: 15% 1rem;
      }
      .forDesktop {
         display: block;
      }
      .forMobile {
         display: none;
      }
      .greeting-name {
         font-size: ${theme.sizes.h10};
      }
      .greeting-msg {
         font-size: ${theme.sizes.h2};
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
      font-family: Proxima Nova;
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
      font-size: ${theme.sizes.h4};
      color: ${theme.colors.textColor};
      font-weight: 800;
      margin-right: 8px;
      position: relative;
      padding: 8px 0;
      text-decoration: none;
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
`
