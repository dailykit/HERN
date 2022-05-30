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
import config from './planConfig.json'

export const Plans = ({ config }) => {
   const { user } = useUser()
   const { brand } = useConfig()
   const { addToast } = useToasts()
   const [list, setList] = React.useState([])
   const [isLoading, setIsLoading] = React.useState(true)

   //Config
   const headingConfig = {
      heading: config?.data?.heading?.value ?? 'Select a plan',
      color: config?.display?.heading?.color?.value ?? '#202020',
      fontFamily:
         config?.display?.heading?.fontFamily?.value[0]?.value ?? 'Lato',
      fontSize: config?.display?.heading?.fontSize?.value ?? '1.5rem',
      fontWeight: config?.display?.heading?.fontWeight?.value ?? 'bold',
      textAlign:
         config?.display?.heading?.textAlign?.value[0]?.value ?? 'center',
      spacing: config?.display?.heading?.spacing?.value ?? '32px 0',
   }

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
         <ul className="hern-plans__skeletons">
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
         <div className="hern-plans__wrapper">
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
         <div className="hern-plans__wrapper">
            <HelperBar type="info">
               <HelperBar.SubTitle>No plans available yet!</HelperBar.SubTitle>
            </HelperBar>
         </div>
      )
   }

   return (
      <div className="hern-plans__wrapper">
         <h1
            style={{
               color: headingConfig.color,
               fontFamily: headingConfig.fontFamily,
               fontSize: headingConfig.fontSize,
               fontWeight: headingConfig.fontWeight,
               textAlign: headingConfig.textAlign,
               padding: headingConfig.spacing,
            }}
            className="hern-plans__heading"
         >
            {headingConfig.heading}
         </h1>
         <ul
            className={classNames('hern-plans', {
               'hern-plans--single': list.length === 1,
            })}
         >
            {list.map(plan => (
               <Plan
                  plan={plan}
                  key={plan.id}
                  itemCount={list.length}
                  planConfig={config}
               />
            ))}
         </ul>
      </div>
   )
}
