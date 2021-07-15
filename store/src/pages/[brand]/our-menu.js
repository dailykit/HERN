/* eslint-disable jsx-a11y/no-onchange */

import React from 'react'
import moment from 'moment'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { rrulestr } from 'rrule'
import tw, { styled, css } from 'twin.macro'
import ReactImageFallback from 'react-image-fallback'
import { isEmpty, uniqBy } from 'lodash'
import { useLazyQuery, useQuery } from '@apollo/react-hooks'
import { webRenderer } from '@dailykit/web-renderer'

import { useConfig } from '../../lib'
import { formatDate, getRoute, isClient } from '../../utils'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
import { Layout, SEO, Form, HelperBar, Loader, Spacer } from '../../components'
import {
   OUR_MENU,
   GET_FILEID,
   OCCURENCE_PRODUCTS_BY_CATEGORIES,
   NAVIGATION_MENU,
   WEBSITE_PAGE,
} from '../../graphql'
import { GET_FILES } from '../../graphql'
import { graphQLClient } from '../../lib'
import 'regenerator-runtime'
import { fileParser, getSettings } from '../../utils'

const OurMenu = props => {
   const { data, settings, navigationMenus } = props

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="Our Menu" />
         <Content data={data} />
      </Layout>
   )
}

export default OurMenu

const Content = ({ data }) => {
   const [current, setCurrent] = React.useState(0)
   const [occurences, setOccurences] = React.useState([])
   const [categories, setCategories] = React.useState([])
   const [isCategoriesLoading, setIsCategoriesLoading] = React.useState(true)
   const [isOccurencesLoading, setIsOccurencesLoading] = React.useState(true)
   const { brand, configOf, buildImageUrl, noProductImage } =
      useConfig('conventions')

   const [fetchProducts] = useLazyQuery(OCCURENCE_PRODUCTS_BY_CATEGORIES, {
      onCompleted: ({ categories = [] }) => {
         setCategories(categories)
         setIsCategoriesLoading(false)
         return
      },
      onError: () => {
         setIsCategoriesLoading(false)
      },
   })

   const [fetchSubscription, { data: { subscription = {} } = {} }] =
      useLazyQuery(OUR_MENU.SUBSCRIPTION, {
         onCompleted: ({ subscription = {} }) => {
            if (subscription.occurences.length > 0) {
               const validOccurences = subscription.occurences.filter(
                  node => node.isVisible
               )
               if (validOccurences?.length > 0) {
                  setOccurences(validOccurences)

                  let nearest
                  let nearestIndex
                  const today = moment().format('YYYY-MM-DD')
                  validOccurences.forEach(node => {
                     const { fulfillmentDate: date } = node
                     let diff = moment(date).diff(moment(today), 'days')
                     if (diff > 0) {
                        if (nearest) {
                           if (moment(date).diff(moment(nearest), 'days') < 0) {
                              nearest = node
                           }
                        } else {
                           nearest = node
                        }
                     }
                  })

                  if (nearest) {
                     const index = validOccurences.findIndex(
                        node => node.id === nearest.id
                     )
                     if (index !== -1) {
                        nearestIndex = index
                     }
                  }

                  setIsCategoriesLoading(true)
                  setCurrent(nearestIndex || 0)
                  fetchProducts({
                     variables: {
                        occurenceId: {
                           _eq: validOccurences[nearestIndex || 0].id,
                        },
                        subscriptionId: { _eq: subscription.id },
                     },
                  })
               }
            }
            setIsOccurencesLoading(false)
         },
         onError: () => {
            setIsOccurencesLoading(false)
         },
      })

   const [
      fetchItemCount,
      { loading: loadingItemCount, data: { itemCount = {} } = {} },
   ] = useLazyQuery(OUR_MENU.ITEM_COUNT, {
      onCompleted: ({ itemCount = {} }) => {
         if (itemCount.subscriptions.length > 0) {
            const [subscription] = itemCount.subscriptions
            setIsOccurencesLoading(true)
            fetchSubscription({ variables: { id: subscription.id } })
         }
      },
   })

   const [
      fetchServing,
      { loading: loadingServing, data: { serving = {} } = {} },
   ] = useLazyQuery(OUR_MENU.SERVING, {
      onCompleted: ({ serving = {} }) => {
         if (serving.counts.length > 0) {
            const [count] = serving.counts
            fetchItemCount({ variables: { id: count.id } })
         }
      },
   })

   const [fetchTitle, { loading: loadingTitle, data: { title = {} } = {} }] =
      useLazyQuery(OUR_MENU.TITLE, {
         onCompleted: ({ title = {} }) => {
            if (title?.servings.length > 0) {
               const [serving] = title?.servings
               fetchServing({ variables: { id: serving.id } })
               setCurrent(0)
            }
         },
      })

   const [fetchTitles, { loading, data: { titles = [] } = {} }] = useLazyQuery(
      OUR_MENU.TITLES,
      {
         onCompleted: ({ titles = [] }) => {
            if (titles.length > 0) {
               const [title] = titles
               fetchTitle({ variables: { id: title.id } })
            }
         },
      }
   )

   React.useEffect(() => {
      fetchTitles({
         variables: { brandId: brand.id },
      })
      return () => {
         setOccurences([])
         setCurrent(0)
         setCategories([])
      }
   }, [fetchTitles, brand.id])

   React.useEffect(() => {
      try {
         if (data.length && typeof document !== 'undefined') {
            const scripts = data.flatMap(fold => fold.scripts)
            const fragment = document.createDocumentFragment()

            scripts.forEach(script => {
               const s = document.createElement('script')
               s.setAttribute('type', 'text/javascript')
               s.setAttribute('src', script)
               fragment.appendChild(s)
            })

            document.body.appendChild(fragment)
         }
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [data])

   const next = () => {
      if (current === occurences.length - 1) return
      const nextOne = current + 1
      setCurrent(nextOne)
      fetchProducts({
         variables: {
            occurenceId: { _eq: occurences[nextOne].id },
            subscriptionId: { _eq: subscription.id },
         },
      })
   }

   const previous = () => {
      if (current === 0) return
      const previousOne = current - 1
      setCurrent(previousOne)
      fetchProducts({
         variables: {
            occurenceId: { _eq: occurences[previousOne].id },
            subscriptionId: { _eq: subscription.id },
         },
      })
   }

   const config = configOf('primary-labels')
   const theme = configOf('theme-color', 'Visual')
   const imageRatio = useConfig().configOf('image-aspect-ratio', 'Visual')

   const yieldLabel = {
      singular: config?.yieldLabel?.singular || 'serving',
      plural: config?.yieldLabel?.singular || 'servings',
   }
   const itemCountLabel = {
      singular: config?.itemLabel?.singular || 'recipe',
      plural: config?.itemLabel?.singular || 'recipes',
   }
   if (isEmpty(titles))
      return (
         <Main>
            <Spacer size="sm" />
            <HelperBar type="info">
               <HelperBar.SubTitle>No Menu Available!</HelperBar.SubTitle>
            </HelperBar>
         </Main>
      )
   return (
      <Main>
         <Header>
            <div>
               {!loading && titles.length > 0 && (
                  <SelectSection>
                     <Form.Label htmlFor="plans">Plans</Form.Label>
                     <select
                        id="plans"
                        name="plans"
                        value={title.id}
                        onChange={e =>
                           fetchTitle({ variables: { id: e.target.value } })
                        }
                     >
                        {titles.map(({ id, title }) => (
                           <option key={id} value={id}>
                              {title}
                           </option>
                        ))}
                     </select>
                  </SelectSection>
               )}

               {[!loading, !loadingTitle].every(node => node) &&
                  title?.servings?.length > 0 && (
                     <SelectSection>
                        <Form.Label htmlFor="serving">
                           {yieldLabel.plural}
                        </Form.Label>
                        <select
                           id="servings"
                           name="servings"
                           value={serving.id}
                           onChange={e =>
                              fetchServing({
                                 variables: { id: e.target.value },
                              })
                           }
                        >
                           {title?.servings.map(({ id, size }) => (
                              <option key={id} value={id}>
                                 {size}
                              </option>
                           ))}
                        </select>
                     </SelectSection>
                  )}

               {[!loading, !loadingTitle, !loadingServing].every(
                  node => node
               ) &&
                  serving?.counts?.length > 0 && (
                     <SelectSection>
                        <Form.Label htmlFor="counts">
                           {itemCountLabel.plural}
                        </Form.Label>
                        <select
                           id="counts"
                           name="counts"
                           value={itemCount.id}
                           onChange={e =>
                              fetchItemCount({
                                 variables: { id: e.target.value },
                              })
                           }
                        >
                           {serving?.counts.map(({ id, count }) => (
                              <option key={id} value={id}>
                                 {count}
                              </option>
                           ))}
                        </select>
                     </SelectSection>
                  )}
               {[
                  !loading,
                  !loadingTitle,
                  !loadingServing,
                  !loadingItemCount,
               ].every(node => node) &&
                  itemCount?.subscriptions?.length > 0 && (
                     <SelectSection>
                        <Form.Label htmlFor="subscriptions">
                           Delivery Day
                        </Form.Label>
                        <select
                           id="subscriptions"
                           name="subscriptions"
                           value={subscription.id}
                           onChange={e =>
                              fetchSubscription({
                                 variables: { id: e.target.value },
                              })
                           }
                        >
                           {itemCount?.subscriptions.map(({ id, rrule }) => (
                              <option key={id} value={id}>
                                 {rrulestr(rrule).toText()}
                              </option>
                           ))}
                        </select>
                     </SelectSection>
                  )}
            </div>
         </Header>
         {isOccurencesLoading || isCategoriesLoading ? (
            <Loader inline />
         ) : (
            <>
               {occurences.length === 0 ? (
                  <HelperBar type="info">
                     <HelperBar.SubTitle>
                        No weeks are available.
                     </HelperBar.SubTitle>
                  </HelperBar>
               ) : (
                  <Occurence>
                     <SliderButton onClick={previous} disabled={current === 0}>
                        <span>
                           <ArrowLeftIcon
                              css={[
                                 tw`stroke-current`,
                                 current === 0
                                    ? tw`text-green-300`
                                    : tw`text-green-800`,
                              ]}
                           />
                        </span>
                        Past week
                     </SliderButton>
                     {current in occurences && (
                        <span tw="flex items-center justify-center text-base text-center md:text-lg text-indigo-800">
                           Showing menu of:&nbsp;
                           {formatDate(
                              moment(occurences[current]?.fulfillmentDate)
                                 .subtract(7, 'days')
                                 .format('YYYY-MM-DD'),
                              {
                                 month: 'short',
                                 day: 'numeric',
                                 year: 'numeric',
                              }
                           )}
                           &nbsp;-&nbsp;
                           {formatDate(occurences[current]?.fulfillmentDate, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                           })}
                        </span>
                     )}

                     <SliderButton
                        hasRightIcon
                        onClick={next}
                        disabled={current === occurences.length - 1}
                     >
                        Upcoming Week
                        <span>
                           <ArrowRightIcon
                              css={[
                                 tw`stroke-current`,
                                 current === occurences.length - 1
                                    ? tw`text-green-300`
                                    : tw`text-green-800`,
                              ]}
                           />
                        </span>
                     </SliderButton>
                  </Occurence>
               )}
               <main tw="mt-3">
                  {categories.length > 0 ? (
                     categories.map(category => (
                        <section key={category.name} css={tw`mb-8`}>
                           <h4
                              css={tw`text-lg text-gray-700 my-3 pb-1 border-b`}
                           >
                              {category.name} (
                              {
                                 uniqBy(category.productsAggregate.nodes, v =>
                                    [
                                       v?.cartItem?.productId,
                                       v?.cartItem?.option?.productOptionId,
                                    ].join()
                                 ).length
                              }
                              )
                           </h4>
                           <Products>
                              {uniqBy(category.productsAggregate.nodes, v =>
                                 [
                                    v?.cartItem?.productId,
                                    v?.cartItem?.option?.productOptionId,
                                 ].join()
                              ).map((node, index) => (
                                 <Product
                                    node={node}
                                    theme={theme}
                                    key={node.id}
                                    buildImageUrl={buildImageUrl}
                                    noProductImage={noProductImage}
                                 />
                              ))}
                           </Products>
                        </section>
                     ))
                  ) : (
                     <HelperBar type="info">
                        <HelperBar.SubTitle>
                           No products available this week!
                        </HelperBar.SubTitle>
                     </HelperBar>
                  )}
               </main>
            </>
         )}
         {/* {contentLoading ? (
            <Loader inline />
         ) : (
            <div id="our-menu-bottom-01"></div>
         )} */}
         <div id="our-menu-bottom-01">
            {Boolean(data.length) &&
               ReactHtmlParser(
                  data.find(fold => fold.id === 'Our Menu')?.content
               )}
         </div>
      </Main>
   )
}

const Product = ({ node, theme, noProductImage, buildImageUrl }) => {
   const router = useRouter()

   const product = {
      name: node?.productOption?.product?.name || '',
      label: node?.productOption?.label || '',
      type: node?.productOption?.simpleRecipeYield?.simpleRecipe?.type,
      image:
         node?.productOption?.product?.assets?.images?.length > 0
            ? node?.productOption?.product?.assets?.images[0]
            : null,
      additionalText: node?.productOption?.product?.additionalText || '',
      tags: node?.productOption?.product?.tags || [],
   }

   const openRecipe = () =>
      router.push(getRoute(`/recipes/${node?.productOption?.id}`))

   return (
      <Styles.Product>
         {!!product.type && (
            <Styles.Type>
               <img
                  alt="Non-Veg Icon"
                  src={
                     product.type === 'Non-vegetarian'
                        ? '/imgs/non-veg.png'
                        : '/imgs/veg.png'
                  }
                  title={product.type}
                  tw="h-6 w-6"
               />
            </Styles.Type>
         )}
         <ImageWrapper imageRatio={imageRatio} onClick={openRecipe}>
            {product.image ? (
               <ReactImageFallback
                  src={buildImageUrl('400x300', product.image)}
                  fallbackImage={product.image}
                  initialImage={<Loader />}
                  alt={product.name}
                  className="image__thumbnail"
               />
            ) : (
               <img src={noProductImage} alt={product.name} />
            )}
         </ImageWrapper>
         {node?.addOnLabel && <Label>{node?.addOnLabel}</Label>}
         <section>
            <Styles.GhostLink theme={theme} onClick={openRecipe}>
               {product.name} - {product.label}
            </Styles.GhostLink>
         </section>
         <p>{product?.additionalText}</p>
         {product.tags.length > 0 && (
            <Styles.TagsList>
               {product.tags.map(tag => (
                  <Styles.Tags>{tag}</Styles.Tags>
               ))}
            </Styles.TagsList>
         )}
      </Styles.Product>
   )
}

const Styles = {
   Product: styled.li`
      ${tw`relative border flex flex-col bg-white p-2 rounded overflow-hidden`}
      &.active {
         ${tw`border border-2 border-red-400`}
      }
      &:hover {
         ${tw`transition-all shadow-md -top-1 border-2 border-solid border-gray-200`}
      }
   `,
   Type: styled.span`
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 1;
   `,
   GhostLink: styled.a(
      ({ theme }) => css`
         ${tw`text-gray-700 cursor-pointer`}
         &:hover {
            color: ${theme?.accent || 'teal'};
         }
      `
   ),
   TagsList: styled.ul`
      ${tw`list-none text-xs leading-6 text-gray-500 mb-3`}
   `,
   Tags: styled.li`
      ${tw` m-2 bg-red-50 text-gray-500 inline-block text-xs uppercase p-1`}
   `,
}

const ImageWrapper = styled.div(
   ({ imageRatio }) => css`
      ${tw`flex items-center justify-center bg-gray-200 mb-2 rounded overflow-hidden cursor-pointer `}
      ${imageRatio && imageRatio.width
         ? `aspect-ratio: ${imageRatio.height}/ ${imageRatio.width} }`
         : tw`aspect-w-4 aspect-h-3`}
   `
)

const Main = styled.main`
   max-width: 1180px;
   margin: 0 auto;
   width: calc(100% - 40px);
   min-height: calc(100vh - 128px);
`

const SelectSection = styled.section`
   ${tw`flex flex-col px-3`}
`

const Header = styled.header`
   ${tw`w-full border-b flex justify-center`}
   div {
      ${tw`flex items-center space-x-3 divide-x py-3`}
      @media screen and (max-width: 768px) {
         ${tw`grid w-full divide-x-0 space-x-0`};
         grid-gap: 16px;
         grid-template-areas:
            'header header'
            'aside1 aside2'
            'footer footer';
         select {
            ${tw`border h-10 rounded px-2`}
         }
         > section {
            ${tw`px-0`}
         }
         > section:nth-of-type(1) {
            grid-area: header;
         }
         > section:nth-of-type(2) {
            grid-area: aside1;
         }
         > section:nth-of-type(3) {
            grid-area: aside2;
         }
         > section:nth-of-type(4) {
            grid-area: footer;
         }
      }
   }
`

const Occurence = styled.div`
   width: 100%;
   height: 64px;
   display: grid;
   margin: auto;
   grid-template-columns: auto 1fr auto;
   @media (max-width: 567px) {
      height: auto;
      grid-gap: 14px;
      padding-top: 14px;
      grid-template-rows: 48px;
      grid-template-columns: 1fr;
   }
`

const SliderButton = styled.button`
   ${tw`
      h-12
      mx-2
      self-center
      rounded-full
      hover:bg-gray-100
      border border-green-800 
      flex items-center justify-center 
   `}
   ${({ hasRightIcon }) =>
      hasRightIcon
         ? tw`pl-3`
         : tw`
      pr-3`}
   span {
      ${tw`h-12 w-12 flex items-center justify-center`}
   }
   :disabled {
      ${tw`cursor-not-allowed border-gray-300 text-gray-300 hover:bg-white`}
   }
`

const Products = styled.ul`
   ${tw`grid gap-3`}
   grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`

const Label = styled.span`
   top: 16px;
   ${tw`
      px-2
      absolute 
      rounded-r
      bg-green-500 
      text-sm uppercase font-medium tracking-wider text-white 
   `}
`
export async function getStaticProps({ params }) {
   const client = await graphQLClient()
   const data = await client.request(GET_FILES, {
      divId: ['our-menu-bottom-01'],
   })
   const dataByRoute = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/our-menu',
   })
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/')

   //navigation menu
   const navigationMenu = await client.request(NAVIGATION_MENU, {
      navigationMenuId:
         dataByRoute.website_websitePage[0]['website']['navigationMenuId'],
   })

   const parsedData = await fileParser(data.content_subscriptionDivIds)
   const navigationMenus = navigationMenu.website_navigationMenuItem

   return {
      props: { data: parsedData, seo, settings, navigationMenus },
      revalidate: 60, // will be passed to the page component as props
   }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
