import React, { useState, useEffect, useRef } from 'react'
import ReactHtmlParser from 'react-html-parser'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useSubscription } from '@apollo/client'
import moment from 'moment'
import { Flex } from '@dailykit/ui'
import parse from 'html-react-parser'
import {
   ChevronRight,
   ChevronLeft,
   ChevronDown,
   Clock,
   AboutExpert,
   Masonry,
   Card,
   Button,
   Goodies,
   GoodiesWrapper,
   Ingredients,
   Modal,
   useModal,
   GridComponent,
   ReadMoreDiv,
   CustomScrollbar,
   SEO,
   Layout,
   Booking,
   InlineLoader
} from '../../../components'
// import Booking from "../../booking";
import { theme } from '../../../theme'
import { getNavigationMenuItems, getBannerData } from '../../../lib'
import { useExperienceInfo, useCart } from '../../../Providers'
import {
   EXPERIENCE,
   CATEGORY_EXPERIENCE,
   EXPERIENCE_PRODUCT,
   EXPERIENCES_QUERY
} from '../../../graphql'
import { useWindowDimensions, fileParser, isEmpty } from '../../../utils'
import SendPollComp from '../../../pageComponents/sendPollComponents'

export default function Experience({ navigationMenuItems, parsedData = [] }) {
   const router = useRouter()
   const { experienceId } = router.query
   const { ModalContainer, isShow, show, hide } = useModal()
   const experienceTop01 = useRef()
   const experienceTop02 = useRef()
   const experienceBottom01 = useRef()

   const { setExperienceId, isLoading } = useExperienceInfo()
   const { getCart } = useCart()
   const cart = getCart(experienceId)
   const { width } = useWindowDimensions()
   const [iconSize, setIconSize] = useState('14px')
   const [gridComponentData, setGridComponentData] = useState({
      videos: [],
      images: []
   })
   const [experienceInfo, setExperienceInfo] = useState({})
   const [products, setProducts] = useState([])
   const [categories, setCategories] = useState([])
   const breakpointColumnsObj = {
      default: 3,
      1320: 2,
      1200: 1,
      700: 1,
      500: 1
   }
   const [isBookingPageOpen, setIsBookingPageOpen] = useState(false)

   const { loading, error } = useSubscription(EXPERIENCE, {
      variables: {
         experienceId
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { experiences_experience_experienceCategory = [] } = {}
         } = {}
      } = {}) => {
         setExperienceInfo(experiences_experience_experienceCategory[0])
         const requiredData = {
            videos:
               experiences_experience_experienceCategory[0]?.experience?.assets
                  ?.videos,
            images:
               experiences_experience_experienceCategory[0]?.experience?.assets
                  ?.images
         }
         setGridComponentData(requiredData)
      }
   })

   const { loading: otherExperiencesLoading, error: otherExperiencesError } =
      useSubscription(CATEGORY_EXPERIENCE, {
         variables: {
            tags: [1007]
         },
         onSubscriptionData: ({
            subscriptionData: {
               data: {
                  experiences_experienceCategory: ExperienceCategories = []
               } = {}
            } = {}
         } = {}) => {
            console.log('CATEGory', ExperienceCategories)
            setCategories(ExperienceCategories)
         }
      })

   // subscription for products linked with experience
   const { loading: isProductsLoading, error: productsError } = useSubscription(
      EXPERIENCE_PRODUCT,
      {
         variables: {
            experienceId
         },
         onSubscriptionData: ({
            subscriptionData: { data: { products: results = [] } = {} } = {}
         } = {}) => {
            setProducts(results)
            console.log('products', results)
         }
      }
   )

   const scrollRightHandler = () => {
      document.getElementById('experienceTab').scrollLeft += 20
   }
   const scrollLeftHandler = () => {
      document.getElementById('experienceTab').scrollLeft -= 20
   }

   const onBookClickHandler = () => {
      setIsBookingPageOpen(true)
   }

   useEffect(() => {
      if (width > 769) {
         setIconSize('24px')
      } else {
         setIconSize('14px')
      }
   }, [width])

   useEffect(() => {
      if (experienceId) {
         setExperienceId(+experienceId)
      }
   }, [experienceId])

   if (isLoading || loading || otherExperiencesLoading || isProductsLoading) {
      return <InlineLoader />
   }
   if (error || otherExperiencesError || productsError) {
      console.log(error || otherExperiencesError || productsError)
   }

   return (
      <Layout navigationMenuItems={navigationMenuItems}>
         <SEO title={experienceInfo?.experience?.title} />
         <div ref={experienceTop01} id="experience-top-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'experience-top-01')
                     ?.content
               )}
         </div>
         <StyledWrapper
            isBookingPageOpen={isBookingPageOpen}
            isDesktopView={width > 769}
         >
            <Wrapper>
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  margin="0 0 25px 0"
                  padding="0 40px"
               >
                  <h1 className="exp-heading">
                     {experienceInfo?.experience?.title}
                  </h1>
                  {width > 769 && (
                     <Button onClick={show} className="customPollBtn">
                        SEND POLL
                     </Button>
                  )}
               </Flex>
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  margin="0 0 25px 0"
                  padding="0 40px"
               >
                  <p className="category">
                     {experienceInfo?.experienceCategoryTitle}
                  </p>
                  <Flex
                     container
                     alignItems="center"
                     justifyContent="space-between"
                  >
                     <Clock
                        size={theme.sizes.h4}
                        color={theme.colors.textColor4}
                     />
                     <span className="duration">
                        {moment
                           .duration(
                              experienceInfo?.experience?.experienceClasses[0]
                                 ?.duration
                           )
                           .asMinutes()}
                        min
                     </span>
                  </Flex>
               </Flex>
               <div className="player-wrapper">
                  <GridComponent data={gridComponentData} />
               </div>
               <div ref={experienceTop02} id="experience-top-02">
                  {Boolean(parsedData.length) &&
                     ReactHtmlParser(
                        parsedData.find(fold => fold.id === 'experience-top-02')
                           ?.content
                     )}
               </div>

               <TabWrapper>
                  <div className="tabOptions">
                     <div>
                        <span
                           className="scrollBtn scrollLeftBtn"
                           onClick={scrollLeftHandler}
                        >
                           <ChevronLeft
                              size={theme.sizes.h7}
                              color={theme.colors.textColor2}
                           />
                        </span>

                        <div className="tab" id="experienceTab">
                           <CustomScrollbar>
                              <ul>
                                 <li>
                                    <a href="#section-1">
                                       <a
                                          className={
                                             router.asPath.includes(
                                                '#section-1'
                                             ) && 'activeHash'
                                          }
                                       >
                                          About Experience
                                       </a>
                                    </a>
                                 </li>
                                 <li>
                                    <a href="#section-2">
                                       <a
                                          className={
                                             router.asPath.includes(
                                                '#section-2'
                                             ) && 'activeHash'
                                          }
                                       >
                                          About the Expert
                                       </a>
                                    </a>
                                 </li>
                                 <li>
                                    <a href="#section-3">
                                       <a
                                          className={
                                             router.asPath.includes(
                                                '#section-3'
                                             ) && 'activeHash'
                                          }
                                       >
                                          Supplies & Ingredients
                                       </a>
                                    </a>
                                 </li>
                                 <li>
                                    <a href="#section-4">
                                       <a
                                          className={
                                             router.asPath.includes(
                                                '#section-4'
                                             ) && 'activeHash'
                                          }
                                       >
                                          Goodies in your Kit
                                       </a>
                                    </a>
                                 </li>
                                 {experienceInfo?.experience?.experience_headers.map(
                                    header => {
                                       return (
                                          <li key={header.id}>
                                             <a href={`#${header.id}`}>
                                                <a
                                                   className={
                                                      router.asPath.includes(
                                                         `#${header.id}`
                                                      ) && 'activeHash'
                                                   }
                                                >
                                                   {header?.title}
                                                </a>
                                             </a>
                                          </li>
                                       )
                                    }
                                 )}

                                 <li>
                                    <a href="#section-7">
                                       <a
                                          className={
                                             router.asPath.includes(
                                                '#section-7'
                                             ) && 'activeHash'
                                          }
                                       >
                                          Other Similar Experiences
                                       </a>
                                    </a>
                                 </li>
                              </ul>
                           </CustomScrollbar>
                        </div>
                        <span
                           className="scrollBtn scrollRightBtn"
                           onClick={scrollRightHandler}
                        >
                           <ChevronRight
                              size={theme.sizes.h7}
                              color={theme.colors.textColor2}
                           />
                        </span>
                     </div>
                  </div>
               </TabWrapper>
               <div className="info-wrapper">
                  <div className="left-container">
                     <section id="section-1">
                        <h1 className="sub-heading">About Experience</h1>
                        <ReadMoreDiv>
                           <p className="about-exp">
                              {parse(
                                 experienceInfo?.experience?.description || ''
                              )}
                           </p>
                        </ReadMoreDiv>
                     </section>
                     {!isEmpty(
                        experienceInfo?.experience?.experienceClasses[0]
                           ?.experienceClassExpert
                     ) && (
                        <section id="section-2">
                           <h1 className="sub-heading">About Expert</h1>
                           <AboutExpert
                              expert={
                                 experienceInfo?.experience
                                    ?.experienceClasses[0]
                                    ?.experienceClassExpert
                              }
                              expertCategory={
                                 experienceInfo?.experienceCategoryTitle
                              }
                           />
                        </section>
                     )}
                     <div id="section-3">
                        <GoodiesWrapper>
                           {products.map(product => {
                              return (
                                 <Ingredients
                                    key={product.id}
                                    options={product?.productOptions}
                                    title="Supplies & Ingredients"
                                 />
                              )
                           })}
                        </GoodiesWrapper>
                     </div>
                     <div id="section-4">
                        <Goodies
                           products={products}
                           title="Goodies in your Kit"
                        />
                     </div>

                     {experienceInfo?.experience?.experience_headers.map(
                        header => {
                           return (
                              <section id={header.id}>
                                 <h1 className="sub-heading">
                                    {header?.title}
                                 </h1>
                                 {parse(header?.content || '')}
                              </section>
                           )
                        }
                     )}
                  </div>
                  <div className="right-container">
                     <CustomScrollbar>
                        <Wrap>
                           <Booking experienceId={experienceId} />
                        </Wrap>
                     </CustomScrollbar>
                  </div>
               </div>
               <section id="section-7">
                  {categories.map(category => {
                     return (
                        <GridViewWrapper key={category?.title}>
                           <Flex
                              container
                              flexDirection="column"
                              alignItems="center"
                              justifyContent="center"
                              padding="1rem 0"
                           >
                              <h3 className="experienceHeading">
                                 Other Similar Experiences
                              </h3>
                              <ChevronDown
                                 size={iconSize}
                                 color={theme.colors.textColor4}
                              />
                           </Flex>
                           <Masonry
                              breakpointCols={breakpointColumnsObj}
                              className="my-masonry-grid"
                              columnClassName="my-masonry-grid_column"
                           >
                              {category?.experience_experienceCategories.map(
                                 (data, index) => {
                                    return (
                                       <Card
                                          key={index}
                                          type="experience"
                                          data={data}
                                       />
                                    )
                                 }
                              )}
                           </Masonry>
                        </GridViewWrapper>
                     )
                  })}
               </section>
            </Wrapper>

            <div ref={experienceBottom01} id="experience-bottom-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(fold => fold.id === 'experience-bottom-01')
                        ?.content
                  )}
            </div>

            <div className="footerBtnWrapper">
               <Link href={`/sendPoll?experienceId=${experienceId}`}>
                  <Button
                     backgroundColor={theme.colors.secondaryColor}
                     className="customFooterBtn"
                  >
                     Send Poll
                  </Button>
               </Link>

               <Button
                  backgroundColor={theme.colors.primaryColor}
                  isMainShadow
                  className="customFooterBtn"
                  onClick={onBookClickHandler}
               >
                  Book
               </Button>
            </div>
            {width > 769 && (
               <ModalContainer isShow={isShow}>
                  <Modal type="sideDrawer" isOpen={isShow} close={hide}>
                     <div className="modal-content">
                        <SendPollComp experienceId={experienceId} />
                     </div>
                  </Modal>
               </ModalContainer>
            )}
         </StyledWrapper>
         {isBookingPageOpen && (
            <div style={{ width: '100vw', height: '100vh' }}>
               <CustomScrollbar>
                  <Wrap>
                     <Booking experienceId={experienceId} />
                  </Wrap>
               </CustomScrollbar>
            </div>
         )}
      </Layout>
   )
}

export const getStaticProps = async ({ params }) => {
   const domain = 'primanti.dailykit.org'
   const navigationMenuItems = await getNavigationMenuItems(domain)
   const where = {
      id: {
         _in: ['experience-top-01', 'experience-top-02', 'experience-bottom-01']
      },
      _or: [
         { experienceId: { _eq: +params.experienceId } },
         { experienceId: { _is_null: true } }
      ]
   }
   const bannerData = await getBannerData(where)
   const parsedData = await fileParser(bannerData)

   return {
      props: {
         navigationMenuItems,
         parsedData
      }
   }
}

export const getStaticPaths = async () => {
   return {
      paths: [],
      fallback: 'blocking'
   }
}

const StyledWrapper = styled.div`
   filter: ${({ isCelebrating }) => isCelebrating && 'blur(4px)'};
   display: ${({ isBookingPageOpen }) => (isBookingPageOpen ? 'none' : 'flex')};

   > main {
      height: 100%;
      width: 100%;
      text-align: left;
      padding: 1rem;
   }

   .footerBtnWrapper {
      display: flex;
      align-items: center;
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 5;
      width: 100%;
      background: ${theme.colors.mainBackground};
      @media (min-width: 769px) {
         display: none;
      }
   }
   a {
      margin: 1rem;
      width: 100%;
   }
   .customFooterBtn {
      height: 48px;
      width: 100%;
   }
   .modal-content {
      padding: 1rem;
      height: 100%;
      width: 100%;
   }

   @media screen and (max-width: 769px) {
      > main {
         width: 100%;
      }
      > aside {
         display: none;
      }
   }
`

const Wrapper = styled.main`
   width: 100%;
   height: 100%;

   .player-wrapper {
      width: 100%;
      height: 320px;
      margin-bottom: 4rem;
   }
   .info-wrapper {
      padding: 0 40px;
      display: flex;
      justify-content: flex-start;
      width: 100%;
      .left-container {
         height: 100%;
         width: 100%;
         text-align: left;
         padding: 1rem;
         margin-right: 1rem;
      }
      .right-container {
         margin-top: 48px;
         top: 150px;
         position: sticky;
         height: 700px;
         width: 0%;
         display: none;
         overflow-y: auto;
         padding: 1rem;
         flex-direction: column;
         background: ${theme.colors.mainBackground};
         box-shadow: -12px 12px 24px rgba(18, 21, 27, 0.2),
            12px -12px 24px rgba(18, 21, 27, 0.2),
            -12px -12px 24px rgba(48, 53, 69, 0.9),
            12px 12px 30px rgba(18, 21, 27, 0.9),
            inset 1px 1px 2px rgba(48, 53, 69, 0.3),
            inset -1px -1px 2px rgba(18, 21, 27, 0.5);
      }
   }
   .exp-heading {
      font-size: ${theme.sizes.h2};
      color: ${theme.colors.textColor4};
      font-weight: 800;
   }
   .customPollBtn {
      width: auto;
      background: ${theme.colors.secondaryColor};
      padding: 0 20px;
      height: 32px;
   }
   .category {
      font-style: italic;
      font-size: ${theme.sizes.h6};
      color: ${theme.colors.textColor4};
   }
   .duration {
      font-weight: 500;
      font-size: ${theme.sizes.h8};
      color: ${theme.colors.textColor4};
      margin-left: 8px;
   }

   @media (min-width: 769px) {
      .player-wrapper {
         height: 380px;
      }
      .exp-heading {
         font-size: ${theme.sizes.h1};
      }
      .category {
         font-size: ${theme.sizes.h8};
      }
      .duration {
         font-size: ${theme.sizes.h9};
      }

      .info-wrapper {
         .left-container {
            width: 70%;
         }
         .right-container {
            width: 30%;
            display: block;
         }
      }
   }
   section {
      position: relative;
      text-align: center;
      padding: 2rem 0;
      .sub-heading {
         font-size: ${theme.sizes.h3};
         color: ${theme.colors.textColor4};
         font-weight: 400;
         text-align: center;
         margin-bottom: 20px;
      }
      .subsub-heading {
         font-size: ${theme.sizes.h6};
         color: ${theme.colors.textColor4};
         font-weight: 700;
         text-align: center;
         margin-bottom: 20px;
      }
      .box-open-img {
         margin-bottom: 80px;
      }
      .goodiesImgWrapper {
         width: 100px;
         background: none;
         .goodieName {
            font-size: ${theme.sizes.h7};
            color: ${theme.colors.textColor4};
            text-align: center;
         }
      }
      .about-exp {
         text-align: justify;
         font-size: ${theme.sizes.h6};
         color: ${theme.colors.textColor4};
         font-weight: 400;
      }
      .readMore {
         border: none;
         text-align: center;
         text-transform: uppercase;
         font-weight: 800;
         font-size: ${theme.sizes.h4};
         color: ${theme.colors.textColor};
         background: none;
         cursor: pointer;
         margin-bottom: 56px;
         position: relative;
         text-decoration: none;
         padding: 4px 0;
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
      .readMore,
      .readMore:before,
      .readMore:after {
         transition: all 560ms;
      }
      @media (min-width: 769px) {
         .sub-heading {
            font-size: ${theme.sizes.h2};
         }
         .subsub-heading {
            font-size: ${theme.sizes.h9};
         }
         .about-exp {
            font-size: ${theme.sizes.h9};
         }
         .readMore {
            font-size: ${theme.sizes.h3};
         }
      }
   }
`

const TabWrapper = styled.div`
   background: ${theme.colors.mainBackground};
   position: sticky;
   top: 0;
   z-index: 4;
   @media (min-width: 769px) {
      top: 64px;
   }
   .tabOptions {
      position: relative;
      .scrollBtn {
         position: absolute;
         padding: 8px;
         cursor: pointer;
         z-index: 4;
         margin: 0 -8px;
         top: 0;
      }

      .scrollLeftBtn {
         left: 8px;
      }
      .scrollRightBtn {
         right: 8px;
      }
      .tab {
         position: relative;
         overflow: auto;
         width: 90%;
         height: 56px;
         scrollbar-width: none;
         margin: 0 auto;
         padding-left: 0;
         ul {
            width: max-content;
            list-style: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0;
            margin: 0;
            padding-left: 0;
         }
         li {
            list-style: none;
            font-size: ${theme.sizes.h6};
            padding: 8px;
            margin-right: 28px;
            .activeHash {
               border-bottom: 2px solid ${theme.colors.textColor};
               color: ${theme.colors.textColor};
               padding-bottom: 4px;
               &:after,
               &:before {
                  content: none;
               }
               &:hover {
                  &:after {
                     content: none;
                  }
               }
            }
            a {
               position: relative;
               text-decoration: none;
               color: ${theme.colors.textColor2};
               padding: 4px 0;
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
         }
      }
   }
`

const GridViewWrapper = styled.div`
   margin-bottom: 1rem;
   .experienceHeading {
      font-size: ${theme.sizes.h3};
      color: ${theme.colors.textColor4};
      font-weight: 700;
      text-align: center;
      margin-bottom: 20px;
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
      .experienceHeading {
         font-size: ${theme.sizes.h1};
      }
   }
   @media (max-width: 769px) {
      .my-masonry-grid {
         margin-right: 1rem;
      }
      .my-masonry-grid_column > div {
         margin: 0 0 1rem 1rem;
      }
   }
`

const Wrap = styled.div`
   .booking-done {
      margin-top: 4rem;
      padding: 1rem;
      img {
         width: 94px;
         height: 94px;
         display: block;
         margin-left: auto;
         margin-right: auto;
      }
      p {
         font-size: ${theme.sizes.h3};
         font-weight: 700;
         color: ${theme.colors.textColor4};
         text-align: center;
      }
   }
`
