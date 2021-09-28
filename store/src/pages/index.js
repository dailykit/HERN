import React, { useEffect, useRef, useState } from 'react'
import ReactHtmlParser from 'react-html-parser'
import NavLink from 'next/link'
import { useRouter } from 'next/router'
import { useSubscription } from '@apollo/client'
import { Flex } from '@dailykit/ui'
import styled from 'styled-components'
import {
   Card,
   ChevronDown,
   ChevronRight,
   Button,
   EditIcon,
   Masonry,
   Modal,
   useModal,
   SEO,
   Layout,
   Tags,
   UpcomingExperience,
   InvitePollFeed
} from '../components'
import {
   PollRecyclerView,
   BookingRecyclerView
} from '../pageComponents/homeComponents'
import { theme } from '../theme'
import { getNavigationMenuItems, getWebPageModule } from '../lib'
import { useUser, useCustomWebpageModuleQuery } from '../Providers'
import { useWindowDimensions, isEmpty, fileParser } from '../utils'
import {
   CATEGORY_EXPERIENCE,
   EXPERT_BY_CATEGORY,
   CUSTOMER_SELECTED_TAGS
} from '../graphql'
import { ExperienceSkeleton, ExpertSkeleton } from '../components'
import { getBannerData } from '../lib/getBannerData'

export default function Home({ navigationMenuItems = [], parsedData = [] }) {
   const {
      ModalContainer: TagsModalContainer,
      isShow: isTagsShow,
      show: showTags,
      hide: hideTags
   } = useModal()
   const { state } = useUser()

   const { isAuthenticated = false, user = {} } = state
   const router = useRouter()
   const { width } = useWindowDimensions()
   const [iconSize, setIconSize] = useState('14px')
   const [categories, setCategories] = useState([])
   const [experts, setExperts] = useState([])
   const [tagIds, setTagIds] = useState([])
   const breakpointColumnsObj = {
      default: 4,
      1100: 3,
      700: 2,
      500: 1
   }
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
            setExperts(experiences_experienceCategory[0]?.experts)
         }
      })

   if (error || expertByCategoryError || selectedTagsQueryError) {
      console.log(error || expertByCategoryError || selectedTagsQueryError)
   }

   return (
      <Layout navigationMenuItems={navigationMenuItems}>
         <SEO title="StayInSocial" />
         <StyledWrapper>
            <div ref={homeTop01} id="home-top-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(fold => fold.id === 'home-top-01')?.content
                  )}
            </div>
            <GreetingDiv>
               <div className="forDesktop">
                  {isAuthenticated ? (
                     <>
                        <h1 className="greeting-name">Hey {user?.email}</h1>
                        <p className="greeting-msg">
                           Check out these experiences we handpicked for you.
                           You can also manage your booked events below.
                        </p>
                     </>
                  ) : (
                     <>
                        <h1 className="greeting-name">
                           Welcome to StayInSocial
                        </h1>
                        <p className="greeting-msg">
                           Discover and book unique experiences hosted in your
                           home.
                        </p>
                     </>
                  )}
               </div>
               <div className="forMobile">
                  {isAuthenticated ? (
                     <>
                        <h1 className="greeting-name">Hey {user?.email}</h1>
                        <p className="greeting-msg">
                           Check out these experiences we handpicked for you.
                           You can also manage your booked events below.
                        </p>
                     </>
                  ) : (
                     <>
                        <NavLink href="/login" className="buttonWrapper">
                           <Button className="loginBtn">Log in</Button>
                        </NavLink>
                        <p className="separatorNote">
                           Already have an account?
                        </p>
                        <NavLink href="/signup" className="buttonWrapper">
                           <Button
                              backgroundColor={theme.colors.secondaryColor}
                              className="signupBtn"
                           >
                              Sign Up
                           </Button>
                        </NavLink>
                     </>
                  )}
               </div>
            </GreetingDiv>
            <div ref={homeTop02} id="home-top-02">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(fold => fold.id === 'home-top-02')?.content
                  )}
            </div>
            {/* <PollRecyclerView keycloakId={user?.keycloakId} />
        <BookingRecyclerView keycloakId={user?.keycloakId} /> */}
            <div style={{ padding: '1rem' }}>
               {!isEmpty(categories) && (
                  <Flex
                     container
                     flexDirection="column"
                     alignItems="center"
                     justifyContent="center"
                     padding="1rem 0"
                  >
                     <h3 className="experienceHeading">
                        Experiences we think you’d like.
                     </h3>
                     <ChevronDown
                        size={iconSize}
                        color={theme.colors.textColor4}
                     />
                  </Flex>
               )}
               {categories.map(category => {
                  return (
                     <GridViewWrapper key={category.title}>
                        <h3 className="experienceHeading2">{category.title}</h3>

                        <Masonry
                           breakpointCols={breakpointColumnsObj}
                           className="my-masonry-grid"
                           columnClassName="my-masonry-grid_column"
                        >
                           {category?.experience_experienceCategories.map(
                              (data, index) => {
                                 return (
                                    <Card
                                       onClick={() =>
                                          router.push(
                                             `/experiences/${data?.experience?.id}`
                                          )
                                       }
                                       boxShadow="true"
                                       key={index}
                                       type="experience"
                                       data={data}
                                    />
                                 )
                              }
                           )}
                        </Masonry>
                        <Flex
                           container
                           alignItems="center"
                           justifyContent="center"
                           padding="1rem 0"
                           margin="0 0 2rem 0"
                        >
                           <NavLink href="/experiences">
                              <h1 className="explore">
                                 Explore more Experiences
                              </h1>
                           </NavLink>
                           <ChevronRight
                              size={iconSize}
                              color={theme.colors.textColor}
                           />
                        </Flex>
                     </GridViewWrapper>
                  )
               })}
               {loading && (
                  <div className="skeleton-wrapper">
                     {[1, 2, 3, 4].map((_, index) => {
                        return <ExperienceSkeleton key={index} />
                     })}
                  </div>
               )}
               <GridViewWrapper>
                  <Flex
                     container
                     flexDirection="column"
                     alignItems="center"
                     justifyContent="center"
                     padding="1rem 0"
                  >
                     <h3 className="experienceHeading">
                        {experts.length} Experts you might like to explore
                     </h3>
                     <ChevronDown
                        size={iconSize}
                        color={theme.colors.textColor4}
                     />
                  </Flex>
                  <GridViewForExpert>
                     {experts.map((data, index) => {
                        return (
                           <CardWrapperForExpert key={index}>
                              <Card type="expert" data={data} />
                           </CardWrapperForExpert>
                        )
                     })}
                  </GridViewForExpert>
                  {expertByCategoryLoading && (
                     <div className="skeleton-wrapper">
                        {[1, 2, 3, 4].map((_, index) => {
                           return <ExpertSkeleton key={index} />
                        })}
                     </div>
                  )}
                  <Flex
                     container
                     alignItems="center"
                     justifyContent="center"
                     padding="1rem 0"
                     margin="0 0 2rem 0"
                  >
                     <NavLink href="/experts">
                        <h1 className="explore ">Explore more Experts</h1>
                     </NavLink>
                     <ChevronRight
                        size={iconSize}
                        color={theme.colors.textColor}
                     />
                  </Flex>
               </GridViewWrapper>
               {!isEmpty(customerSelectedTags) &&
                  !isEmpty(customerSelectedTags[0]?.tags) && (
                     <CategorySection>
                        <Flex
                           container
                           alignItems="center"
                           justifyContent="center"
                           padding="1rem 0"
                        >
                           <h3 className="experienceHeading">
                              Your personalized tags
                           </h3>
                        </Flex>
                        <CategoryTagWrap>
                           {customerSelectedTags[0]?.tags.map(tag => {
                              return (
                                 <Button
                                    backgroundColor={
                                       theme.colors.mainBackground
                                    }
                                    key={tag?.id}
                                    isMainShadow
                                    className="categoryTag"
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
                           <h1
                              onClick={() =>
                                 width > 769 ? showTags() : router.push('/tags')
                              }
                              className="explore "
                           >
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
            <TagsModalContainer isShow={isTagsShow}>
               <Modal
                  type={width > 769 ? 'sideDrawer' : 'bottomDrawer'}
                  isOpen={isTagsShow}
                  close={hideTags}
               >
                  <div style={{ padding: '1rem' }}>
                     <Tags onSubmit={hideTags} />
                  </div>
               </Modal>
            </TagsModalContainer>
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
   .skeleton-wrapper {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: 0 2rem;
   }
   .experienceHeading {
      font-size: ${theme.sizes.h8};
      color: ${theme.colors.textColor4};
      font-weight: 400;
      text-align: center;
      margin-bottom: 20px;
   }
   .experienceHeading2 {
      font-size: ${theme.sizes.h8};
      color: ${theme.colors.textColor4};
      font-weight: 400;
      text-align: left;
      margin-bottom: 2rem;
      padding-left: 3rem;
   }
   .upcomingExperience-div {
      padding: 0;
      box-shadow: none;
      border-radius: 0;
   }

   @media (min-width: 769px) {
      .experienceHeading,
      .experienceHeading2 {
         font-size: ${theme.sizes.h1};
      }
      .upcomingExperience-div {
         padding: 1.5rem;
         background: ${theme.colors.mainBackground};
         box-shadow: 1px 1px 2px rgba(36, 41, 53, 0.3),
            -1px -1px 2px rgba(30, 33, 43, 0.5),
            inset -4px 4px 8px rgba(30, 33, 43, 0.2),
            inset 4px -4px 8px rgba(30, 33, 43, 0.2),
            inset -4px -4px 8px rgba(36, 41, 53, 0.9),
            inset 4px 4px 10px rgba(30, 33, 43, 0.9);
         border-radius: 4px;
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
   .categoryTag {
      height: 48px;
      font-size: ${theme.sizes.h8};
      width: auto;
      padding: 0 1rem;
      margin: 0 0 1rem 1rem;
      text-transform: none;
      font-weight: 500;
   }
`

const CategorySection = styled.div`
   margin-bottom: 6rem;
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
