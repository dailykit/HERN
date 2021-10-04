import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { useToasts } from 'react-toast-notifications'
import ReactHtmlParser from 'react-html-parser'
import { Flex } from '@dailykit/ui'
import { useSubscription } from '@apollo/client'
import {
   EXPERIENCES,
   EXPERIENCE_TAGS,
   GET_EXPERIENCE_CATEGORIES
} from '../../graphql'
import {
   Card,
   ChevronRight,
   Masonry,
   SEO,
   Layout,
   Filters,
   InlineLoader
} from '../../components'
import { theme } from '../../theme'
import { useWindowDimensions, fileParser } from '../../utils'
import { ExperienceSkeleton } from '../../components'
import { useUser } from '../../Providers'
import { getNavigationMenuItems, getBannerData } from '../../lib'

export default function Experiences({
   navigationMenuItems = [],
   parsedData = [],
   bannerId = ''
}) {
   const { addToast } = useToasts()
   const { state: userState } = useUser()
   const { user = {} } = userState
   const router = useRouter()
   const experiencesTop01 = useRef()
   const experiencesBottom01 = useRef()
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
      return <InlineLoader />
   }
   if (error || hasTagsError || hasCategoriesError) {
      addToast('Something went wrong', { appearance: 'error' })
      console.log(error || hasTagsError || hasCategoriesError)
   }

   return (
      <Layout navigationMenuItems={navigationMenuItems}>
         <SEO title="Experiences" />
         <StyledWrapper bgMode="dark">
            <div ref={experiencesTop01} id="experiences-top-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(fold => fold.id === 'experiences-top-01')
                        ?.content
                  )}
            </div>

            <div className="centerDiv">
               <h1 className="heading">Experiences</h1>
            </div>
            <Filters
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
            >
               {categories.map(category => {
                  return (
                     <GridViewWrapper key={category.title}>
                        {category.experience_experienceCategories.length >
                           0 && (
                           <>
                              <h3 className="experienceHeading">
                                 {category?.title}
                                 {/* {category?.experience_experienceCategories?.length ||
                "coming soon"}
              ) */}
                              </h3>
                              <Masonry
                                 breakpointCols={breakpointColumnsObj}
                                 className="my-masonry-grid"
                                 columnClassName="my-masonry-grid_column"
                              >
                                 {category?.experience_experienceCategories.map(
                                    data => {
                                       return (
                                          <Card
                                             onClick={() =>
                                                router.push(
                                                   `/experiences/${data?.experience?.id}`
                                                )
                                             }
                                             boxShadow={true}
                                             key={`${data?.experience?.title}-${data?.experience?.id}`}
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
                                 <h1 className="explore">View all</h1>
                                 <ChevronRight
                                    size={iconSize}
                                    color={theme.colors.textColor}
                                 />
                              </Flex>
                           </>
                           // ) : (
                           //   <div className="emptyCard">
                           //     <Card
                           //       type="empty"
                           //       data={{ name: "Experiences arriving soon.." }}
                           //     />
                           //   </div>
                        )}
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
            </Filters>

            <div ref={experiencesBottom01} id="experiences-bottom-01">
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
   .skeleton-wrapper {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: 0 2rem;
   }
   .centerDiv {
      display: flex;
      flex-direction: column;
      align-items: center;
      .heading {
         font-size: ${theme.sizes.h1};
         color: ${theme.colors.textColor4};
         font-weight: 400;
         margin-bottom: 80px;
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
   margin-bottom: 1rem;
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
   .my-masonry-grid {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      width: auto;
      margin-right: 40px;
   }

   .my-masonry-grid_column > div {
      margin: 0 0 40px 40px;
   }
   .emptyCard {
      width: 100%;
      padding: 1rem;
   }

   @media (min-width: 769px) {
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
   @media (max-width: 800px) {
      .my-masonry-grid {
         margin-right: 1rem;
      }
      .my-masonry-grid_column > div {
         margin: 0 0 1rem 1rem;
      }
      .emptyCard {
         margin-right: 1rem;
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
   }
`
