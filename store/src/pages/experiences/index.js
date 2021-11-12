import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { useToasts } from 'react-toast-notifications'
import ReactHtmlParser from 'react-html-parser'
import { useSubscription } from '@apollo/client'
import {
   EXPERIENCES,
   EXPERIENCE_TAGS,
   GET_EXPERIENCE_CATEGORIES
} from '../../graphql'
import {
   SEO,
   Layout,
   Filters,
   InlineLoader,
   RenderCard,
   SignupFold
} from '../../components'
import { theme } from '../../theme'
import { useWindowDimensions, fileParser, isEmpty } from '../../utils'
import { ExperienceSkeleton } from '../../components'
import { useUser } from '../../Providers'
import {
   getNavigationMenuItems,
   getBannerData,
   getGlobalFooter
} from '../../lib'

export default function Experiences({
   navigationMenuItems = [],
   parsedData = [],
   footerHtml = ''
}) {
   const { addToast } = useToasts()
   const { state: userState } = useUser()
   const { user = {}, isAuthenticated } = userState
   const router = useRouter()
   const {
      tags: queryTags,
      category: queryCategory,
      startPrice,
      endPrice
   } = router.query
   const [categories, setCategories] = useState([])
   const { width } = useWindowDimensions()
   const [resultCount, setResultCount] = useState(0)
   const [iconSize, setIconSize] = useState('14px')
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

   // subscription query for getting experiences by category
   const { loading, error } = useSubscription(EXPERIENCES, {
      variables: {
         where: {
            experience: {
               experienceClasses: {
                  privateExperienceClassType: {
                     _and: [
                        {
                           minimumBookingAmount: {
                              _gte: startPrice || null
                           }
                        },
                        {
                           minimumBookingAmount: {
                              _lte: endPrice || null
                           }
                        }
                     ]
                  }
               },
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
               },
               experience_experienceCategories: {
                  experienceCategoryTitle: {
                     _in: queryCategory
                        ? Array.isArray(queryCategory)
                           ? queryCategory
                           : [queryCategory]
                        : null
                  }
               }
            }
         },
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
         console.log({ experiences: ExperienceCategories })

         const count = ExperienceCategories.reduce(
            (acc, current) => {
               const length =
                  acc.experience_experienceCategories.length +
                  current.experience_experienceCategories.length

               return length
            },
            { experience_experienceCategories: [] }
         )
         setResultCount(count)
      }
   })

   useEffect(() => {
      if (width > 769) {
         setIconSize('24px')
      } else {
         setIconSize('14px')
      }
   }, [width])

   if (loading || isTagsLoading || isCategoriesLoading) {
      return <InlineLoader type="full" />
   }
   if (error || hasTagsError || hasCategoriesError) {
      addToast('Something went wrong', { appearance: 'error' })
      console.log(error || hasTagsError || hasCategoriesError)
   }

   return (
      <Layout navigationMenuItems={navigationMenuItems} footerHtml={footerHtml}>
         <SEO title="Experiences" />
         <div id="experiences-top-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'experiences-top-01')
                     ?.content
               )}
         </div>
         <StyledWrapper bgMode="dark">
            <div className="centerDiv">
               <h1 className="heading_black_bg">Experiences</h1>
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
                  },
                  {
                     title: 'Minimum booking price',
                     type: 'multi-range',
                     option: {
                        max: 1000,
                        min: 0
                     }
                  }
               ]}
               resultCount={resultCount}
            > */}
            {!isEmpty(categories) && (
               <RenderCard
                  // data={categories
                  //    .map(
                  //       category => category?.experience_experienceCategories
                  //    )
                  //    .flat()}
                  data={categories}
                  type="experience"
                  layout="masonry"
                  showCategorywise={true}
                  keyname="experience_experienceCategories"
               />
            )}

            {loading && (
               <div className="skeleton-wrapper">
                  {[1, 2, 3, 4].map((_, index) => {
                     return <ExperienceSkeleton key={index} />
                  })}
               </div>
            )}
            {/* </Filters> */}
            {!isAuthenticated && (
               <div className="signup-wrapper">
                  <SignupFold bgMode="dark" />
               </div>
            )}

            <div id="experiences-bottom-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(
                        fold => fold.id === 'experiences-bottom-01'
                     )?.content
                  )}
            </div>
         </StyledWrapper>
      </Layout>
   )
}

export const getStaticProps = async () => {
   const domain = 'primanti.dailykit.org'
   const where = {
      id: { _in: ['experiences-top-01', 'experiences-bottom-01'] }
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
      margin: 4rem 0;
      .heading {
         font-family: 'Barlow Condensed';
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

   .signup-wrapper {
      margin-top: 4rem;
      padding: 0;
   }

   @media (max-width: 769px) {
      padding: 0 2rem;
      padding-bottom: 4rem;
   }
`
