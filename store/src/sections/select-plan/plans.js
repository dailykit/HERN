import React from 'react'
import { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useSubscription } from '@apollo/react-hooks'

import { Plan } from './plan'
import { PLANS } from '../../graphql'
import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { SkeletonPlan } from './skeletons'
import { HelperBar } from '../../components'

export const Plans = ({ cameFrom = '', handlePlanClick }) => {
   const { user } = useUser()
   const { brand } = useConfig()
   const { addToast } = useToasts()
   const [list, setList] = React.useState([])
   const [isLoading, setIsLoading] = React.useState(true)
   const { error } = useSubscription(PLANS, {
      variables: {
         isDemo: user?.isDemo,
         where: {
            isDemo: { _eq: user?.isDemo },
            isActive: { _eq: true },
            brands: { brandId: { _eq: brand.id }, isActive: { _eq: true } },
         },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { plans = [] } = {} } = {},
      }) => {
         if (plans.length > 0) {
            const filtered = plans
               .map(plan => ({
                  ...plan,
                  servings: plan.servings.filter(
                     serving => serving.itemCounts.length > 0
                  ),
               }))
               .filter(plan => plan.servings.length > 0)
            setList(filtered)
            setIsLoading(false)
         } else {
            setIsLoading(false)
         }
      },
   })

   if (isLoading)
      return (
         <List>
            <SkeletonPlan />
            <SkeletonPlan />
         </List>
      )
   if (error) {
      setIsLoading(false)
      addToast('Something went wrong, please refresh the page!', {
         appearance: 'error',
      })
      return (
         <Wrapper tw="py-3">
            <HelperBar type="danger">
               <HelperBar.SubTitle>
                  Something went wrong, please refresh the page!
               </HelperBar.SubTitle>
            </HelperBar>
         </Wrapper>
      )
   }
   if (list.length === 0) {
      return (
         <Wrapper tw="py-3">
            <HelperBar type="info">
               <HelperBar.SubTitle>No plans available yet!</HelperBar.SubTitle>
            </HelperBar>
         </Wrapper>
      )
   }
   return (
      <List count={list.length}>
         {list.map(plan => (
            <Plan
               plan={plan}
               key={plan.id}
               cameFrom={cameFrom}
               handlePlanClick={handlePlanClick}
            />
         ))}
      </List>
   )
}

const Wrapper = styled.div`
   margin: auto;
   max-width: 980px;
   width: calc(100vw - 40px);
`

const List = styled.ul(
   ({ count }) => css`
      margin: auto;
      max-width: 980px;
      width: calc(100vw - 40px);

      ${count === 1
         ? css`
              display: flex;
              justify-content: center;
              > li {
                 width: 100%;
                 max-width: 490px;
              }
           `
         : css`
              display: grid;
              grid-gap: 24px;
              grid-template-columns: 1fr 1fr;
           `}

      padding: 24px 0;
      @media (max-width: 768px) {
         grid-template-columns: 1fr;
      }
   `
)
