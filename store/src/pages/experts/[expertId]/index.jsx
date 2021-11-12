import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import ReactHtmlParser from 'react-html-parser'
import styled from 'styled-components'
import { EXPERT_INFO } from '../../../graphql'
import { useWindowDimensions, isEmpty, fileParser } from '../../../utils'
import { theme } from '../../../theme.js'
import {
   getNavigationMenuItems,
   graphqlClient,
   getBannerData,
   getGlobalFooter
} from '../../../lib'
import {
   Card,
   Masonry,
   SEO,
   Layout,
   InstagramCircle,
   FacebookCircle,
   TwitterCircle,
   LinkedinCircle
} from '../../../components'

export default function Expert({
   navigationMenuItems,
   expert,
   category,
   parsedData = [],
   footerHtml = ''
}) {
   const router = useRouter()
   const expertTop01 = useRef()
   const expertBottom01 = useRef()
   const { expertId } = router.query
   const { width } = useWindowDimensions()
   const [iconSize, setIconSize] = useState('14px')
   // const [expert, setExpert] = useState({});
   // const [category, setCategory] = useState("");
   const breakpointColumnsObj = {
      default: 4,
      1100: 3,
      700: 2,
      500: 1
   }

   useEffect(() => {
      if (width > 769) {
         setIconSize('24px')
      } else {
         setIconSize('14px')
      }
   }, [width])

   return (
      <Layout navigationMenuItems={navigationMenuItems} footerHtml={footerHtml}>
         <SEO title={`${expert?.firstName} ${expert?.lastName}`} />
         <Wrapper coverImage={expert?.assets?.cover}>
            <div ref={expertTop01} id="expert-top-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(fold => fold.id === 'expert-top-01')
                        ?.content
                  )}
            </div>
            <div className="expert_coverBanner">
               <div className="expert_info">
                  <img
                     className="expert_profileImg"
                     src={
                        !isEmpty(expert?.assets?.images)
                           ? expert?.assets?.images[0]
                           : `https://ui-avatars.com/api/?name=${expert?.firstName}+${expert?.lastName}&background=eee&color=15171F&size=250&rounded=false`
                     }
                     alt="expert-profile"
                  />
                  <h3
                     className="expert_Heading text_align text1_secondary"
                     style={{
                        marginBottom: '0'
                     }}
                  >{`${expert?.firstName} ${expert?.lastName}`}</h3>

                  <div className="expert_social">
                     <a
                        href={expert?.instaUrl || 'https://www.instagram.com/'}
                        target="_blank"
                        rel="noreferrer"
                     >
                        <InstagramCircle
                           size={theme.sizes.h1}
                           color={theme.colors.textColor}
                        />
                     </a>
                     <a
                        href={
                           expert?.facebookUrl || 'https://www.facebook.com/'
                        }
                        target="_blank"
                        rel="noreferrer"
                     >
                        <FacebookCircle
                           size={theme.sizes.h1}
                           color={theme.colors.textColor}
                        />
                     </a>
                     <a
                        href={expert?.twitterUrl || 'https://www.twitter.com/'}
                        target="_blank"
                        rel="noreferrer"
                     >
                        <TwitterCircle
                           size={theme.sizes.h1}
                           color={theme.colors.textColor}
                        />
                     </a>
                     <a
                        href={
                           expert?.linkedinUrl || 'https://www.linkedin.com/'
                        }
                        target="_blank"
                        rel="noreferrer"
                     >
                        <LinkedinCircle
                           size={theme.sizes.h1}
                           color={theme.colors.textColor}
                        />
                     </a>
                  </div>
               </div>
            </div>
            <div className="expert_main_div">
               <div className="expert_aboutUs_div">
                  <h3 className="expert_Heading text1_secondary">
                     About the expert
                  </h3>
                  <p className="expert_para text7">
                     {ReactHtmlParser(expert?.description)}
                  </p>
               </div>
               <GridViewWrapper>
                  <h3 className="expert_Heading text1_secondary">
                     Experts Experiences(
                     {Object.keys(expert).length &&
                        expert.experience_experts.length}
                     )
                  </h3>
                  {/* {!isEmpty(expert) && (
                  <RenderCard
                     // data={expert?.experience_experts
                     //    .map(expert => expert?.experience)
                     //    .flat()}
                     data={expert?.experience_experts}
                     type="expert"
                     layout="carousel"
                     showCategorywise={false}
                     keyname="expert"
                  />
               )} */}
                  <Masonry
                     breakpointCols={breakpointColumnsObj}
                     className="my-masonry-grid"
                     columnClassName="my-masonry-grid_column"
                  >
                     {Object.keys(expert).length &&
                        expert?.experience_experts.map((data, index) => {
                           return (
                              <Card
                                 onClick={() =>
                                    router.push(
                                       `/experiences/${data?.experience?.id}`
                                    )
                                 }
                                 key={index}
                                 type="experience"
                                 data={data}
                                 backgroundMode="light"
                                 boxShadow={false}
                              />
                           )
                        })}
                  </Masonry>
               </GridViewWrapper>
            </div>
            <div ref={expertBottom01} id="expert-bottom-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(fold => fold.id === 'expert-bottom-01')
                        ?.content
                  )}
            </div>
         </Wrapper>
      </Layout>
   )
}

export const getStaticProps = async ({ params }) => {
   const domain = 'primanti.dailykit.org'
   const navigationMenuItems = await getNavigationMenuItems(domain)
   const where = {
      id: {
         _in: ['expert-top-01', 'expert-bottom-01']
      },
      _or: [
         { expertId: { _eq: +params.expertId } },
         { expertId: { _is_null: true } }
      ]
   }
   const bannerData = await getBannerData(where)
   const parsedData = await fileParser(bannerData)
   const footerHtml = await getGlobalFooter()
   const client = await graphqlClient()
   const { data: { experts_expert_by_pk: expert = {} } = {} } =
      await client.query({
         query: EXPERT_INFO,
         variables: { expertId: +params.expertId }
      })

   // const category =
   //    expert.experience_experts[0]?.experience
   //       .experience_experienceCategories[0]?.experienceCategoryTitle || null
   return {
      props: {
         navigationMenuItems,
         expert,
         category: null,
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
   height: 100%;
   overflow: auto;
   .expert_coverBanner {
      background-image: url(${({ coverImage }) =>
         coverImage ? coverImage : 'https://via.placeholder.com/1350x360'});
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      height: 360px;
      margin-bottom: 220px;
      position: relative;
      .expert_info {
         position: absolute;
         bottom: -240px;
         left: 50%;
         transform: translate(-50%, 0);
      }
      .expert_profileImg {
         width: 250px;
         height: 250px;
         border-radius: 50%;
         object-fit: cover;
      }
   }
   .expert_main_div {
      padding: 4rem 2rem;
   }
   .expert_Heading {
      color: ${theme.colors.textColor5};
      font-weight: 600;
      text-align: left;
      margin-bottom: 0;
      text-transform: uppercase;
      font-family: 'Barlow Condensed';
      margin-bottom: 2rem;
      letter-spacing: 0.08em;
   }
   .text_align {
      @media (max-width: 769px) {
         text-align: center;
      }
   }
   .expert_para {
      font-family: Futura;
      font-style: normal;
      font-weight: 500;
      color: ${theme.colors.textColor7};
      margin-bottom: 0;
   }
   .expert_social {
      margin: 1rem 0;
      display: flex;
      align-items: center;
      gap: 1rem;
      svg {
         :hover {
            cursor: pointer;
         }
      }
   }
   .expert_aboutUs_div {
      margin-bottom: 4rem;
   }
   @media (min-width: 769px) {
      .expert_main_div {
         padding: 6rem;
      }
      .expert_coverBanner {
         margin-bottom: 220px;
         .expert_info {
            bottom: -240px;
            left: 6rem;
            transform: unset;
         }
         .expert_profileImg {
            width: 250px;
            height: 250px;
         }
      }
   }
`

const GridViewWrapper = styled.div`
   .explore {
      text-align: center;
      font-size: ${theme.sizes.h4};
      color: ${theme.colors.textColor};
      font-weight: 800;
      margin-right: 8px;
   }
   .my-masonry-grid {
      display: flex;
      width: auto;
      column-gap: 2rem;
      ${'' /* margin-right: 40px; */}
   }

   .my-masonry-grid_column > div {
      margin: 0 0 2rem 0;
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
   @media (max-width: 800px) {
      .my-masonry-grid {
         margin-right: 0;
      }
      .my-masonry-grid_column > div {
         margin: 0;
      }
   }
`
