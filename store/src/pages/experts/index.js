import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { Flex } from '@dailykit/ui'
import ReactHtmlParser from 'react-html-parser'
import { useSubscription } from '@apollo/client'
import styled from 'styled-components'
import {
   Card,
   ChevronRight,
   ChevronDown,
   ExpertSkeleton,
   Layout,
   SEO,
   Filters,
   InlineLoader,
   RenderCard,
   SignupFold
} from '../../components'
import {
   EXPERT_BY_CATEGORY,
   EXPERIENCE_TAGS,
   GET_EXPERIENCE_CATEGORIES
} from '../../graphql'
import { theme } from '../../theme'
import { useUser } from '../../Providers'
import { useWindowDimensions, fileParser, isEmpty } from '../../utils'
import {
   getNavigationMenuItems,
   getBannerData,
   getGlobalFooter
} from '../../lib'

export default function Experiences({
   navigationMenuItems,
   parsedData = [],
   footerHtml = ''
}) {
   const { state } = useUser()
   const { isAuthenticated } = state
   const expertsTop01 = useRef()
   const expertsBottom01 = useRef()
   const router = useRouter()
   const { tags: queryTags, category: queryCategory } = router.query
   const [resultCount, setResultCount] = useState(0)
   const { width } = useWindowDimensions()
   const [isLoggedIn, setIsLoggedIn] = useState(false)
   const [iconSize, setIconSize] = useState('14px')
   const [expertsByCategory, setExpertsByCategory] = useState([])
   const breakpointColumnsObj = {
      default: 4,
      1100: 3,
      700: 2,
      500: 1
   }
   console.log({ queryTags, queryCategory })
   //subscription query for getting all experiences tags for filter data
   const {
      loading: isTagsLoading,
      error: hasTagsError,
      data: { experiences_experienceTags: tags = [] } = {}
   } = useSubscription(EXPERIENCE_TAGS)

   const {
      loading: isCategoriesLoading,
      error: hasCategoriesError,
      data: { experiences_experienceCategory: expCategories = [] } = {}
   } = useSubscription(GET_EXPERIENCE_CATEGORIES)

   // subscription query for getting expert by category
   const { loading, error } = useSubscription(EXPERT_BY_CATEGORY, {
      variables: {
         where: {
            title: {
               _in: queryCategory
                  ? Array.isArray(queryCategory)
                     ? queryCategory
                     : [queryCategory]
                  : null
            },
            experience_experienceCategories: {
               experience: {
                  experience_experienceTags: {
                     experienceTag: {
                        title: {
                           _in: queryTags
                              ? Array.isArray(queryTags)
                                 ? queryTags
                                 : [queryTags]
                              : null
                        }
                     }
                  }
               }
            }
         }
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { experiences_experienceCategory = [] } = {}
         } = {}
      } = {}) => {
         setExpertsByCategory(experiences_experienceCategory)
         console.log({ experiences_experienceCategory })
         if (Boolean(experiences_experienceCategory.length)) {
            const count = experiences_experienceCategory.reduce(
               (acc, current) => {
                  return acc?.experts.length + current?.experts.length
               },
               { experts: [] }
            )
            setResultCount(count)
         }
      }
   })

   useEffect(() => {
      if (width > 769) {
         setIconSize('24px')
      } else {
         setIconSize('14px')
      }
   }, [width])

   if (error || hasTagsError || hasCategoriesError) {
      console.log(error || hasTagsError || hasCategoriesError)
   }

   if (loading || isTagsLoading || isCategoriesLoading)
      return <InlineLoader type="full" />

   return (
      <Layout navigationMenuItems={navigationMenuItems} footerHtml={footerHtml}>
         <SEO title="Experts" />
         <StyledWrapper bgMode="dark">
            <div ref={expertsTop01} id="experts-top-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(fold => fold.id === 'experts-top-01')
                        ?.content
                  )}
            </div>
            <div className="centerDiv">
               <h1 className="heading text1">Experts</h1>
            </div>
            {/* <Filters
               filterOptions={[
                  { title: 'tags', type: 'checkbox', options: tags },
                  {
                     title: 'category',
                     type: 'checkbox',
                     options: expCategories.map(category => ({
                        ...category,
                        id: category?.title
                     }))
                  }
               ]}
               resultCount={resultCount}
            > */}
            {!isEmpty(expertsByCategory) && (
               <RenderCard
                  data={expertsByCategory.map(expert => expert?.experts).flat()}
                  // data={experts}
                  type="expert"
                  layout="masonry"
                  showCategorywise={false}
                  keyname="expert"
               />
            )}
            {/* </Filters> */}

            {!isAuthenticated && (
               <div className="signup-wrapper">
                  <SignupFold bgMode="dark" />
               </div>
            )}

            <div ref={expertsBottom01} id="experts-bottom-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(fold => fold.id === 'experts-bottom-01')
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
      id: { _in: ['experts-top-01', 'experts-bottom-01'] }
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
   overflow: auto; /* might need to change in future */
   padding: 0 6rem;
   padding-bottom: 4rem;
   background: ${({ bgMode }) =>
      bgMode === 'dark'
         ? theme.colors.darkBackground.darkblue
         : theme.colors.lightBackground.white};
   .skeleton-wrapper {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: 0 2rem;
   }
   .centerDiv {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 1rem;
      .heading {
         font-family: League-Gothic;
         font-style: normal;
         font-weight: normal;
         text-align: center;
         letter-spacing: 0.16em;
         color: ${theme.colors.textColor};
         margin-bottom: 4rem;
         text-transform: uppercase;
      }
      .customInput {
         width: 80%;
         color: ${theme.colors.textColor2};
         margin-bottom: 48px;
         box-shadow: -5px 5px 10px rgba(13, 15, 19, 0.2),
            5px -5px 10px rgba(13, 15, 19, 0.2),
            -5px -5px 10px rgba(53, 59, 77, 0.9),
            5px 5px 13px rgba(13, 15, 19, 0.9),
            inset 1px 1px 2px rgba(53, 59, 77, 0.3),
            inset -1px -1px 2px rgba(13, 15, 19, 0.5);
      }
      .customBtn {
         height: 48px;
         font-size: ${theme.sizes.h8};
         width: auto;
         padding: 0 1rem;
         margin: 0 0 1rem 1rem;
         text-transform: none;
         font-weight: 500;
      }
   }

   .grid-class {
      padding: 1rem;
      .gridView {
         display: grid;
         grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
         grid-auto-rows: 250px;
         grid-column-gap: 1rem;
         justify-content: space-evenly;
         justify-items: center;
         align-content: space-evenly;
         align-items: center;
         margin-bottom: 50px;
      }
      .experienceHeading {
         font-size: ${theme.sizes.h2};
         color: ${theme.colors.textColor4};
         font-weight: 400;
         margin-left: 40px;
         margin-bottom: 20px;
      }
      .explore {
         text-align: center;
         font-size: ${theme.sizes.h4};
         color: ${theme.colors.textColor};
         font-weight: 800;
         margin-right: 8px;
      }
      .customInput {
         margin-bottom: 1.5rem;
         color: ${theme.colors.textColor2};
      }
      @media (min-width: 769px) {
         grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
         grid-auto-rows: 283px;
         .exploreExperience {
            text-align: center;
            font-size: ${theme.sizes.h1};
            color: ${theme.colors.textColor};
            font-weight: 800;
         }
         .experienceHeading {
            margin-left: 40px;
            font-size: ${theme.sizes.h1};
         }
      }
   }

   .signup-wrapper {
      margin-top: 4rem;
      padding: 0;
   }

   @media (max-width: 769px) {
      padding: 0 2rem;
      padding-bottom: 4rem;
   }
`
