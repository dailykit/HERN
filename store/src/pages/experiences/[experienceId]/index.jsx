import React, { useState, useEffect, useRef } from 'react'
import ReactHtmlParser from 'react-html-parser'
import styled from 'styled-components'
import { Carousel, message } from 'antd'
import { useRouter } from 'next/router'
import { useSubscription, useQuery } from '@apollo/client'
import parse from 'html-react-parser'
import {
   AboutExpert,
   Card,
   Button,
   Goodies,
   Modal,
   GridComponent,
   ReadMoreDiv,
   SEO,
   Layout,
   Booking,
   InlineLoader,
   Review,
   SignupFold
} from '../../../components'
// import Booking from "../../booking";
import { theme } from '../../../theme'
import {
   getNavigationMenuItems,
   getBannerData,
   getGlobalFooter
} from '../../../lib'
import {
   useExperienceInfo,
   useCart,
   useUser,
   useProduct
} from '../../../Providers'
import {
   EXPERIENCE,
   EXPERIENCE_PRODUCT,
   SIMILAR_CATEGORY_EXPERIENCE,
   CUSTOMER_REVIEWS
} from '../../../graphql'
import {
   useWindowDimensions,
   fileParser,
   isEmpty,
   getDate,
   useScroll
} from '../../../utils'
import SendPollComp from '../../../pageComponents/sendPollComponents'

export default function Experience({
   navigationMenuItems,
   parsedData = [],
   footerHtml = ''
}) {
   const router = useRouter()
   const scroll = useScroll()
   const { state, toggleAuthenticationModal } = useUser()
   const { isAuthenticated } = state
   const { experienceId } = router.query
   const experienceTop01 = useRef()
   const experienceTop02 = useRef()
   const experienceBottom01 = useRef()

   const { setExperienceId, isLoading } = useExperienceInfo()
   const { getCart } = useCart()
   const { addProducts, addSelectedProduct, addSelectedProductOption } =
      useProduct()
   const cart = getCart(experienceId)
   const { width } = useWindowDimensions()
   const [isSendPollModalVisible, setIsSendPollModalVisible] = useState(false)
   const [iconSize, setIconSize] = useState('14px')
   const [gridComponentData, setGridComponentData] = useState({
      videos: [],
      images: []
   })
   const [experienceInfo, setExperienceInfo] = useState({})
   const [products, setProducts] = useState([])
   const [categories, setCategories] = useState([])
   const [customerReviews, setCustomerReviews] = useState([])
   const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
   const settings = {
      arrows: true,
      dots: false,
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 3,
      itemWidth: '96% !important',
      nextArrow: <NextArrow color={theme.colors.textColor} size="48" />,
      prevArrow: <PreviousArrow color={theme.colors.textColor} size="48" />,
      responsive: [
         {
            breakpoint: 769,
            settings: {
               slidesToShow: 1,
               slidesToScroll: 1,
               arrows: false,
               dots: true
            }
         }
      ]
   }

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
   const { loading: isLoadingReviews, error: customerReviewsError } =
      useSubscription(CUSTOMER_REVIEWS, {
         variables: {
            where: {
               _or: [
                  {
                     experienceId: {
                        _eq: experienceId
                     },
                     isShown: {
                        _eq: true
                     }
                  },
                  {
                     isGlobal: {
                        _eq: true
                     }
                  }
               ]
            }
         },
         onSubscriptionData: ({
            subscriptionData: { data: { crm_customerReview = [] } = {} } = {}
         } = {}) => {
            setCustomerReviews(crm_customerReview)
         }
      })

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
            setCategories(ExperienceCategories)
         },
         onError: error => {
            console.error(error)
            // addToast('Something went wrong!', { appearance: 'error' })
         }
      }
   )

   // subscription for products linked with experience
   const { loading: isProductsLoading, error: productsError } = useSubscription(
      EXPERIENCE_PRODUCT,
      {
         variables: {
            experienceId
         },
         onSubscriptionData: async ({
            subscriptionData: { data: { products: results = [] } = {} } = {}
         } = {}) => {
            if (results.length > 0) {
               setProducts(results)
               // adding all the products(linked with experience) to the product provider
               await addProducts(results)
               const [result] = results

               // adding first product initially for selectedProduct to the product provider
               await addSelectedProduct(result)

               // adding first product option initially for selectedProductOption to the product provider
               await addSelectedProductOption(result.productOptions[0])
            }
         }
      }
   )

   const scrollRightHandler = () => {
      document.getElementById('experienceTab').scrollLeft += 20
   }
   const scrollLeftHandler = () => {
      document.getElementById('experienceTab').scrollLeft -= 20
   }

   const openBookingModal = () => {
      if (isAuthenticated) {
         setIsBookingModalOpen(true)
      } else {
         showLoginModal()
      }
   }
   const closeBookingModal = () => {
      setIsBookingModalOpen(false)
   }

   const openSendPollModal = () => {
      if (isAuthenticated) {
         setIsSendPollModalVisible(true)
      } else {
         showLoginModal()
      }
   }
   const closeSendPollModal = () => {
      setIsSendPollModalVisible(false)
   }

   const showLoginModal = () => {
      message.warning('Please login to continue')
      toggleAuthenticationModal(true)
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

   if (
      isLoading ||
      loading ||
      isSimilarExperiencesLoading ||
      isProductsLoading ||
      isLoadingReviews
   ) {
      return <InlineLoader type="full" />
   }
   if (error || productsError || customerReviewsError) {
      console.error(error || productsError || customerReviewsError)
   }

   return (
      <Layout navigationMenuItems={navigationMenuItems} footerHtml={footerHtml}>
         <SEO title={experienceInfo?.experience?.title} />
         <div ref={experienceTop01} id="experience-top-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'experience-top-01')
                     ?.content
               )}
         </div>
         <StyledWrapper
            bgMode="light"
            // isBookingPageOpen={isBookingPageOpen}
            isDesktopView={width > 769}
         >
            <div className="player-wrapper">
               <GridComponent data={gridComponentData} />
            </div>
            <TabWrapper scroll={scroll}>
               <div className="tabOptions">
                  <div className="tab" id="experienceTab">
                     {/* <CustomScrollbar> */}
                     <ul>
                        <li>
                           <a
                              href="#about-experience"
                              className={
                                 router.asPath.includes('#about-experience') &&
                                 'activeHash'
                              }
                           >
                              About this Experience
                           </a>
                        </li>
                        <li>
                           <a
                              href="#included-in-your-kit"
                              className={
                                 router.asPath.includes(
                                    '#included-in-your-kit'
                                 ) && 'activeHash'
                              }
                           >
                              Included in your Kit
                           </a>
                        </li>
                        <li>
                           <a
                              href="#supplies-&-ingredients"
                              className={
                                 router.asPath.includes(
                                    '#supplies-&-ingredients'
                                 ) && 'activeHash'
                              }
                           >
                              Supplies & Ingredients
                           </a>
                        </li>
                        {experienceInfo?.experience?.experience_headers.map(
                           header => {
                              return (
                                 <li key={header.id}>
                                    <a
                                       href={`#${header?.title}`}
                                       className={
                                          router.asPath.includes(
                                             `#${header?.title}`
                                          ) && 'activeHash'
                                       }
                                    >
                                       {header?.title}
                                    </a>
                                 </li>
                              )
                           }
                        )}
                        <li>
                           <a
                              href="#about-expert"
                              className={
                                 router.asPath.includes('#about-expert') &&
                                 'activeHash'
                              }
                           >
                              About the Expert
                           </a>
                        </li>
                        <li>
                           <a
                              href="#reviews"
                              className={
                                 router.asPath.includes('#reviews') &&
                                 'activeHash'
                              }
                           >
                              Reviews
                           </a>
                        </li>
                     </ul>
                     {/* </CustomScrollbar> */}
                  </div>
               </div>
            </TabWrapper>

            <Wrapper>
               <div ref={experienceTop02} id="experience-top-02">
                  {Boolean(parsedData.length) &&
                     ReactHtmlParser(
                        parsedData.find(fold => fold.id === 'experience-top-02')
                           ?.content
                     )}
               </div>

               <div className="info-wrapper">
                  <div className="left-container">
                     <section id="about-experience">
                        <div style={{ margin: '16px 0' }}>
                           <h1 className="sub-heading text1">
                              {experienceInfo?.experience?.title}
                           </h1>
                           {/* {width > 769 && (
                              <Button
                                 onClick={openSendPollModal}
                                 className="customPollBtn text7"
                              >
                                 SEND POLL
                              </Button>
                           )} */}
                        </div>

                        <ReadMoreDiv>
                           <p
                              className="about-exp text7"
                              style={{ marginBottom: '0' }}
                           >
                              {parse(
                                 experienceInfo?.experience?.description || ''
                              )}
                           </p>
                        </ReadMoreDiv>
                     </section>
                     <div id="included-in-your-kit">
                        <Goodies
                           products={products}
                           title="Included in your Kit"
                           ingredientView="includedWithProduct"
                        />
                     </div>
                     <div id="supplies-&-ingredients">
                        <Goodies
                           products={products}
                           title="Supplies & Ingredients"
                           ingredientView="all"
                           showTag={true}
                        />
                     </div>

                     {experienceInfo?.experience?.experience_headers.map(
                        header => {
                           return (
                              <section id={header?.title}>
                                 <h1 className="sub-heading text1">
                                    {header?.title}
                                 </h1>
                                 <p className="about-exp text7">
                                    {parse(header?.content || '')}
                                 </p>
                              </section>
                           )
                        }
                     )}
                     {!isEmpty(
                        experienceInfo?.experience?.experienceClasses[0]
                           ?.experienceClassExpert
                     ) && (
                        <section id="about-expert">
                           <h1 className="sub-heading text1">About Expert</h1>
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
                  </div>
                  <div className="right-container">
                     <Booking
                        experienceId={experienceId}
                        sendPollHandler={openSendPollModal}
                     />
                  </div>
               </div>
               <div style={{ padding: '2rem 0' }}>
                  {!isEmpty(customerReviews) && (
                     <section id="reviews">
                        <h1 className="sub-heading text1">Reviews</h1>
                        <CustomCarousel {...settings}>
                           {customerReviews.map(customerReview => (
                              <div className="item">
                                 <Review key={customerReview.id}>
                                    <Review.Content>
                                       {customerReview.review}
                                    </Review.Content>
                                    <Review.Footer>
                                       <p
                                          className="text10 Futura"
                                          style={{
                                             fontWeight: '700',
                                             margin: '0',
                                             textTransform: 'uppercase'
                                          }}
                                       >
                                          {customerReview?.customer
                                             ?.platform_customer?.fullName ||
                                             customerReview?.customerEmail ||
                                             'N/A'}
                                       </p>
                                       <p
                                          className="text10 Maven-Pro"
                                          style={{
                                             color: '#a7a7a7',
                                             marginTop: '0.5rem',
                                             fontWeight: '700'
                                          }}
                                       >
                                          {getDate(customerReview.created_at)}
                                       </p>
                                    </Review.Footer>
                                 </Review>
                              </div>
                           ))}
                        </CustomCarousel>
                     </section>
                  )}
                  {!isEmpty(categories) && (
                     <section id="section-7">
                        <h1 className="sub-heading text1">
                           Similar Experiences
                        </h1>
                        <CustomCarousel
                           {...{
                              ...settings,
                              slidesToShow: 4,
                              slidesToScroll: 4,
                              itemWidth: '95% !important',
                              itemHeight: '580px',
                              dotsBottom: '16px'
                           }}
                        >
                           {categories
                              .map(
                                 category =>
                                    category?.experience_experienceCategories
                              )
                              .flat()
                              .filter(
                                 elem => elem?.experience?.id !== +experienceId
                              )
                              .slice(0, 3)
                              .map((data, index) => (
                                 <>
                                    <div className="item">
                                       <Card
                                          key={index}
                                          boxShadow={false}
                                          backgroundMode="light"
                                          type="experience"
                                          data={data}
                                       />
                                    </div>
                                 </>
                              ))}
                           <div className="item">
                              <Card type="customExperience" />
                           </div>
                        </CustomCarousel>
                     </section>
                  )}
                  <section id="section-8">
                     {!isAuthenticated && <SignupFold bgMode="light" />}
                  </section>
               </div>
            </Wrapper>

            <div ref={experienceBottom01} id="experience-bottom-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(fold => fold.id === 'experience-bottom-01')
                        ?.content
                  )}
            </div>

            <div className="footerBtnWrapper">
               <Button
                  className="customFooterBtn text2"
                  onClick={openBookingModal}
               >
                  Book Now
               </Button>
            </div>
            {width < 769 && (
               <Modal
                  title={
                     experienceInfo?.experience?.title || 'Experience Booking'
                  }
                  type="popup"
                  isOpen={isBookingModalOpen}
                  close={closeBookingModal}
               >
                  {/* <div style={{ height: '100vh' }}> */}
                  <Booking
                     experienceId={experienceId}
                     sendPollHandler={openSendPollModal}
                  />
                  {/* </div> */}
               </Modal>
            )}

            <Modal
               title="Send Poll"
               type="popup"
               isOpen={isSendPollModalVisible}
               close={closeSendPollModal}
            >
               <SendPollComp experienceId={experienceId} />
            </Modal>
         </StyledWrapper>
         {/* {isBookingPageOpen && (
            <div style={{ height: '100vh' }}>
               <Booking experienceId={experienceId} />
            </div>
         )} */}
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

const StyledWrapper = styled.div`
   filter: ${({ isCelebrating }) => isCelebrating && 'blur(4px)'};
   display: flex;
   ${
      '' /* display: ${({ isBookingPageOpen }) => (isBookingPageOpen ? 'none' : 'flex')}; */
   }
   flex-direction: column;
   background: ${({ bgMode }) =>
      bgMode === 'dark'
         ? theme.colors.darkBackground.darkblue
         : theme.colors.lightBackground.white};
   > main {
      height: 100%;
      width: 100%;
      text-align: left;
      padding: 1rem 6rem;
   }
   .player-wrapper {
      width: 100%;
      height: 380px;
   }
   .footerBtnWrapper {
      display: flex;
      align-items: center;
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 100;
      width: 100%;
      background: ${theme.colors.mainBackground};
      @media (min-width: 769px) {
         display: none;
      }
   }
   .customPollBtn {
      width: 150px;
      background: ${theme.colors.textColor};
      color: ${theme.colors.textColor4};
      padding: 0 20px;
      height: 32px;
   }
   .experience-title-wrap {
      .exp-heading {
         color: ${theme.colors.textColor4};
      }
      .customPollBtn {
         width: 150px;
         background: ${theme.colors.textColor};
         color: ${theme.colors.textColor4};
         padding: 0 20px;
         height: 32px;
      }
      .category {
         font-style: italic;
         color: ${theme.colors.textColor5};
      }
      .duration {
         font-weight: 500;
         color: ${theme.colors.textColor5};
         margin-left: 8px;
      }
   }
   a {
      margin: 1rem;
      width: 100%;
   }
   .customFooterBtn {
      height: 64px;
      width: 100%;
      background: ${theme.colors.textColor};
      font-family: 'Barlow Condensed';
      letter-spacing: 0.04em;
      color: ${theme.colors.textColor4};
      border-radius: 0;
   }

   @media screen and (max-width: 769px) {
      > main {
         width: 100%;
         padding: 1rem 2rem;
      }
      > aside {
         display: none;
      }
   }
`

const Wrapper = styled.main`
   width: 100%;
   height: 100%;

   .info-wrapper {
      display: flex;
      justify-content: flex-start;
      width: 100%;
      .left-container {
         height: 100%;
         width: 100%;
         text-align: left;
      }
      .right-container {
         margin-top: 48px;
         top: 150px;
         position: sticky;
         height: 610px;
         width: 100%;
         display: none;
         overflow: hidden;
         background: ${theme.colors.lightBackground.grey};
         border-radius: 40px;
         .experienceTitleHead {
            color: ${theme.colors.textColor7};
            font-family: 'Barlow Condensed';
            margin: 1rem 0;
            text-align: left;
            height: 48px;
         }
      }
      .sub-heading {
         color: ${theme.colors.textColor5};
         font-weight: 400;
         text-align: left;
         text-transform: uppercase;
         font-family: 'Barlow Condensed';
         margin-bottom: 1rem;
      }
   }

   @media (min-width: 769px) {
      .player-wrapper {
         height: 380px;
      }
      .exp-heading {
         font-size: ${theme.sizes.h1};
      }

      .info-wrapper {
         .left-container {
            width: 65%;
            margin-right: 4rem;
         }
         .right-container {
            width: 35%;
            display: block;
         }
      }
   }
   section {
      position: relative;
      padding: 2rem 0;
      .sub-heading {
         color: ${theme.colors.textColor5};
         font-weight: 400;
         text-align: left;
         margin-bottom: 0;
         text-transform: uppercase;
         font-family: 'Barlow Condensed';
         margin-bottom: 1rem;
      }
      .subsub-heading {
         color: ${theme.colors.textColor5};
         font-weight: 700;
         text-align: left;
         text-transform: uppercase;
         margin-bottom: 0.5rem;
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
      .about-exp,
      .about-exp p {
         text-align: left;
         color: ${theme.colors.lightGreyText};
         font-weight: 500;
         margin-bottom: 1rem;
      }
      .about-exp p i {
         margin-right: 0.5rem;
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
         .readMore {
            font-size: ${theme.sizes.h3};
         }
      }
   }
`

const TabWrapper = styled.div`
   background: ${theme.colors.lightBackground.grey};
   position: sticky;
   top: 0;
   z-index: 100;
   transition: all 150ms;

   .tabOptions {
      position: relative;
      display: flex;
      align-items: center;
      .scrollBtn {
         padding: 8px;
         cursor: pointer;
         height: 100%;
         justify-content: center;
         display: flex;
         align-items: center;
         background: ${theme.colors.lightBackground.grey};
      }

      .scrollLeftBtn {
         left: 8px;
      }
      .scrollRightBtn {
         right: 8px;
      }
      .tab {
         position: relative;
         overflow-x: auto;
         width: 100%;
         height: 56px;
         scrollbar-width: none;
         margin: 0 2rem;
         padding-left: 0;
         ul {
            width: 100%;
            list-style: none;
            display: flex;
            justify-content: normal;
            align-items: center;
            padding: 0;
            margin: 0;
            padding-left: 0;
            height: 100%;
            white-space: nowrap;
         }
         li {
            list-style: none;
            font-size: ${theme.sizes.h4};
            font-weight: 500;
            text-transform: uppercase;
            margin-right: 8.4rem;
            :last-child {
               margin-right: 0;
            }
            .activeHash {
               border-bottom: 2px solid ${theme.colors.textColor5};
               color: ${theme.colors.textColor5};
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
               color: ${theme.colors.textColor};
               padding: 0;
               margin: 0;
               font-family: 'Barlow Condensed';
               &:hover {
                  color: ${theme.colors.textColor5};
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
   @media (min-width: 769px) {
      top: ${({ scroll }) => (scroll.direction === 'down' ? '0px' : '64px')};
      .tabOptions {
         .tab {
            margin: 0 6rem;
         }
      }
   }
`

const CustomCarousel = styled(Carousel)`
   :hover {
      .slick-next,
      .slick-prev {
         display: block !important;
      }
      .slick-prev {
         background: linear-gradient(
            -91.76deg,
            rgba(255, 255, 255, 0) 26.86%,
            #ffffff 98.63%
         );
      }
      .slick-next {
         background: linear-gradient(
            91.76deg,
            rgba(255, 255, 255, 0) 26.86%,
            #ffffff 98.63%
         );
      }
   }

   .slick-slide:first-child {
      .item {
         width: 96% !important;
      }
   }

   .text {
      position: absolute;
      top: 20%;
      left: 6rem;
      z-index: 5;
      color: #fff;
   }
   .slick-prev {
      left: 0 !important;
      background: linear-gradient(
         -91.76deg,
         rgba(255, 255, 255, 0) 26.86%,
         #ffffff 98.63%
      );
   }
   .slick-next {
      right: 0 !important;
      background: linear-gradient(
         91.76deg,
         rgba(255, 255, 255, 0) 26.86%,
         #ffffff 98.63%
      );
   }
   .slick-next,
   .slick-prev {
      display: none !important;
      height: 100%;
      width: 48px;
      top: 0;
      margin: 0;
      ::before {
         content: none !important;
      }
   }
   .item {
      width: 100% !important;
      position: relative;
   }

   .item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
   }
   .slick-dots {
      margin: 0;
      padding: 0;
      bottom: ${({ dotsBottom = '-24px' }) => dotsBottom};
   }
   .slick-dots li.slick-active {
      width: 12px;
   }
   .slick-dots li,
   .slick-dots li button {
      width: 12px;
      height: 12px;
      cursor: pointer;
      border-radius: 50%;
   }
   .slick-dots li {
      position: relative;
      display: inline-block;
      margin: 0 5px;
      padding: 0;
   }
   .slick-dots li button {
      background: ${theme.colors.textColor7};
   }
   .slick-dots li.slick-active button {
      background: ${theme.colors.textColor};
   }

   @media (min-width: 769px) {
      .item {
         width: ${({ itemWidth = '100%' }) => itemWidth};
         position: relative;
      }
   }
`
const NextArrow = props => {
   const { className, style, onClick, size, color } = props
   return (
      <div
         className={className}
         style={{ ...style, position: 'absolute', right: '1rem', zIndex: '3' }}
         onClick={onClick}
      >
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', top: '50%' }}
         >
            <path d="M9 18l6-6-6-6" />
         </svg>
      </div>
   )
}

const PreviousArrow = props => {
   const { className, style, onClick, size, color } = props
   return (
      <div
         className={className}
         style={{ ...style, position: 'absolute', left: '1rem', zIndex: '3' }}
         onClick={onClick}
      >
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', top: '50%' }}
         >
            <path d="M15 18l-6-6 6-6" />
         </svg>
      </div>
   )
}
