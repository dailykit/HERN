import React from 'react'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'

import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { Loader } from '../../components'
import { isClient, formatCurrency, getRoute } from '../../utils'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Plan = ({ cameFrom = '', plan, handlePlanClick }) => {
   const router = useRouter()
   const { user, isAuthenticated } = useUser()
   const { addToast } = useToasts()
   const { configOf } = useConfig('conventions')
   const [defaultItemCount, setDefaultItemCount] = React.useState(null)
   const [defaultServing, setDefaultServing] = React.useState(null)

   React.useEffect(() => {
      if (
         plan.defaultServingId &&
         plan.defaultServing?.isDemo === user?.isDemo
      ) {
         setDefaultServing(plan.defaultServing)
      }
      setDefaultServing(plan.servings[0])
   }, [plan])

   React.useEffect(() => {
      if (defaultServing) {
         if (
            defaultServing.defaultItemCountId &&
            defaultServing.defaultItemCount?.isDemo === user?.isDemo
         ) {
            return setDefaultItemCount(defaultServing.defaultItemCount)
         }
         setDefaultItemCount(defaultServing.itemCounts[0])
      }
   }, [defaultServing])

   const selectPlan = () => {
      if (handlePlanClick) {
         return handlePlanClick(defaultItemCount.id)
      }
      if (isClient) {
         window.localStorage.setItem('plan', defaultItemCount.id)
      }
      addToast('Successfully selected a plan.', {
         appearance: 'success',
      })

      // fb pixel custom event for plan selection
      ReactPixel.trackCustom('selectPlan', {
         serving: defaultItemCount?.count,
         recipePerWeek: defaultServing?.size,
         totalServing: Number.parseFloat(
            (defaultItemCount?.count || 1) * (defaultServing?.size || 1)
         ).toFixed(0),
         pricePerServing: formatCurrency(
            Number.parseFloat(
               (defaultItemCount?.price || 1) /
                  ((defaultItemCount?.count || 1) * (defaultServing?.size || 1))
            ).toFixed(2)
         ),
      })
      if (isAuthenticated) {
         navigate('/get-started/select-delivery')
         return
      }
      router.push(
         getRoute(
            `/get-started/${
               cameFrom === 'our-plans' ? 'register' : 'select-delivery'
            }`
         )
      )
   }

   const config = configOf('primary-labels')
   const colorConfig = configOf('theme-color', 'Visual')
   const priceDisplay = configOf('priceDisplay', 'Visual')
   const yieldLabel = {
      singular: config?.yieldLabel?.singular || 'serving',
      plural: config?.yieldLabel?.singular || 'servings',
   }
   const itemCountLabel = {
      singular: config?.itemLabel?.singular || 'recipe',
      plural: config?.itemLabel?.singular || 'recipes',
   }
   const theme = configOf('theme-color', 'Visual')
   if (!defaultServing) return <Loader inline />
   return (
      <li css={[tw`border rounded-lg`, `height: fit-content`]}>
         {plan.metaDetails?.coverImage && (
            <CoverImage>
               <img src={plan.metaDetails?.coverImage} tw="object-cover" />
            </CoverImage>
         )}
         <div tw="px-4 pb-4 md:px-8 md:pb-8">
            <Title theme={theme}>
               {plan.title}
               {plan.metaDetails?.icon && (
                  <img
                     tw="rounded-full float-right w-8 h-8 object-cover"
                     src={plan.metaDetails?.icon}
                  />
               )}
            </Title>
            {plan?.metaDetails?.description && (
               <p tw="pb-2 mb-4 border-b-2">{plan?.metaDetails?.description}</p>
            )}
            <section css={tw`w-full mb-4 flex items-center justify-between`}>
               {plan.servings.length === 1 ? (
                  <span
                     css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium`}
                  >
                     {plan.servings[0].size}{' '}
                     {plan.servings[0].size > 1
                        ? yieldLabel.singular
                        : yieldLabel.plural}
                  </span>
               ) : (
                  <div tw="w-full flex flex-col justify-evenly">
                     <span
                        css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium mb-2`}
                     >
                        No. of {yieldLabel.plural}
                     </span>
                     <CountList>
                        {plan.servings.map(serving => (
                           <CountListItem
                              key={serving.id}
                              onClick={() => setDefaultServing(serving)}
                              className={`${
                                 serving.id === defaultServing?.id
                                    ? 'active'
                                    : ''
                              }`}
                           >
                              <div tw="text-sm w-full flex justify-evenly items-center">
                                 <div>{serving.size}</div>
                                 {serving?.metaDetails?.label && (
                                    <div>{serving?.metaDetails?.label}</div>
                                 )}
                              </div>
                           </CountListItem>
                        ))}
                     </CountList>
                  </div>
               )}
            </section>
            <section
               css={tw`w-full mb-4 flex items-center justify-between mt-3`}
            >
               {defaultServing.itemCounts.length === 1 ? (
                  <span
                     css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium my-2`}
                  >
                     {defaultServing.itemCounts[0].count}{' '}
                     {defaultServing.itemCounts[0].count === 1
                        ? itemCountLabel.singular
                        : itemCountLabel.plural}{' '}
                     per week
                  </span>
               ) : (
                  <div tw="w-full flex flex-col justify-evenly">
                     <span
                        css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium mb-2`}
                     >
                        {itemCountLabel.singular} per week
                     </span>
                     <CountList>
                        {defaultServing?.itemCounts.map(item => (
                           <CountListItem
                              key={item.id}
                              onClick={() => setDefaultItemCount(item)}
                              className={`${
                                 item.id === defaultItemCount?.id
                                    ? 'active'
                                    : ''
                              }`}
                           >
                              <div tw="w-full text-sm flex justify-evenly items-center">
                                 <div>{item.count}</div>
                                 {item?.metaDetails?.label && (
                                    <div>{item?.metaDetails?.label}</div>
                                 )}
                              </div>
                           </CountListItem>
                        ))}
                     </CountList>
                  </div>
               )}
            </section>
            <hr />
            <div tw="py-3 flex flex-col items-center w-full">
               {priceDisplay?.pricePerServing?.isVisible === true && (
                  <section tw="h-full w-full flex justify-between">
                     {priceDisplay?.pricePerServing?.prefix && (
                        <span tw="text-gray-600">
                           {priceDisplay?.pricePerServing?.prefix}{' '}
                        </span>
                     )}
                     <Price theme={theme}>
                        {formatCurrency(
                           Number.parseFloat(
                              (defaultItemCount?.price || 1) /
                                 ((defaultItemCount?.count || 1) *
                                    (defaultServing?.size || 1))
                           ).toFixed(2)
                        )}{' '}
                        <span tw="text-gray-600 text-xs">
                           {priceDisplay?.pricePerServing?.suffix ||
                              `per ${yieldLabel.singular}`}
                        </span>
                     </Price>
                  </section>
               )}
               {priceDisplay?.totalServing?.isVisible === true && (
                  <section tw="h-full w-full flex justify-between py-1">
                     {priceDisplay?.totalServing?.prefix && (
                        <span tw="text-gray-600">
                           {priceDisplay?.totalServing?.prefix}{' '}
                        </span>
                     )}
                     <Price theme={theme}>
                        {Number.parseFloat(
                           (defaultItemCount?.count || 1) *
                              (defaultServing?.size || 1)
                        ).toFixed(0)}{' '}
                     </Price>
                  </section>
               )}
               {priceDisplay?.pricePerPlan?.isVisible === true && (
                  <section tw="h-full w-full flex justify-between py-1">
                     {priceDisplay?.pricePerPlan?.prefix && (
                        <span tw="text-gray-600">
                           {priceDisplay?.pricePerPlan?.prefix}{' '}
                        </span>
                     )}
                     <div tw="flex flex-1 flex-col text-right">
                        <TotalPrice theme={theme}>
                           {formatCurrency(defaultItemCount?.price)}
                        </TotalPrice>
                        <span tw="text-gray-600 italic text-sm">
                           {defaultItemCount?.isTaxIncluded
                              ? 'Tax Inclusive'
                              : 'Tax Exclusive'}
                        </span>
                        <span tw="text-gray-600">
                           {priceDisplay?.pricePerPlan?.suffix ||
                              'Weekly total'}
                        </span>
                     </div>
                  </section>
               )}
            </div>
            <Button bg={colorConfig?.accent} onClick={() => selectPlan()}>
               Select
            </Button>
         </div>
      </li>
   )
}

const CoverImage = styled.div`
   height: 200px;
   width: 100%;
   padding-bottom: 16px;
   img {
      height: 100%;
      width: 100%;
      object-fit: cover;
      ${tw`rounded-t-lg`}
   }
`

const Title = styled.h2(
   ({ theme }) => css`
      ${tw`mb-2 text-2xl font-medium tracking-wide text-green-600`}
      ${theme?.accent && `color: ${theme?.accent}`}
   `
)

const Price = styled.span(
   ({ theme }) => css`
      ${tw`font-medium text-green-600`}
      ${theme?.accent && `color: ${theme?.accent}`}
   `
)

const TotalPrice = styled.span(
   ({ theme }) => css`
      ${tw`text-2xl font-medium text-green-600`}
      ${theme?.accent && `color: ${theme?.accent}`}
   `
)

const CountList = styled.ul`
   border-radius: 4px;
   ${tw`
      p-1
      border
      w-full
      flex items-center justify-between
   `}
`

const CountListItem = styled.li`
   border-radius: 2px;
   &.active {
      ${tw`text-white bg-green-600`}
   }
   min-height: 3rem;
   min-width: 7rem;
   ${tw`
      flex-1 cursor-pointer text-sm mr-1
      flex items-center justify-center
      hover:text-white hover:bg-green-300 hover:rounded
   `}
`

const Button = styled.button(
   ({ bg }) => css`
      ${tw`w-full h-12 bg-blue-400 uppercase tracking-wider font-medium text-white rounded-full`};
      ${bg && `background-color: ${bg};`}
   `
)
