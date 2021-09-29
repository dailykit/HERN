import React from 'react'
import { useToasts } from 'react-toast-notifications'
import { useSubscription } from '@apollo/react-hooks'
import classNames from 'classnames'

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
         <ul className="hern-select-plan__skeletons__wrapper">
            <SkeletonPlan />
            <SkeletonPlan />
         </ul>
      )
   if (error) {
      setIsLoading(false)
      addToast('Something went wrong, please refresh the page!', {
         appearance: 'error',
      })
      return (
         <div className="hern-our-plans_plans__plans--padding">
            <HelperBar type="danger">
               <HelperBar.SubTitle>
                  Something went wrong, please refresh the page!
               </HelperBar.SubTitle>
            </HelperBar>
         </div>
      )
   }
   if (list.length === 0) {
      return (
         <div className="hern-our-plans_plans__plans--padding">
            <HelperBar type="info">
               <HelperBar.SubTitle>No plans available yet!</HelperBar.SubTitle>
            </HelperBar>
         </div>
      )
   }
   const listClasses = classNames('hern-our-plans_plans__list', {
      'hern-our-plans_plans__list--count1': list.length === 1,
   })

   return (
      <ul className={listClasses}>
         {list.map(plan => (
            <Plan
               plan={plan}
               key={plan.id}
               cameFrom={cameFrom}
               handlePlanClick={handlePlanClick}
               itemCount={list.length}
            />
         ))}
      </ul>
   )
}
