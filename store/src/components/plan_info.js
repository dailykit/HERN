import { useQuery } from '@apollo/react-hooks'
import React from 'react'
import { HernLazyImage } from '../utils/hernImage'
import { formatCurrency } from '../utils'
import { Cloche } from '../assets/icons'
import { Loader } from './loader'
import { GET_PLAN_INFO } from '../graphql'
import { useUser } from '../context'
import { isNull } from 'lodash'

const PlanInfo = () => {
   const { user } = useUser()
   console.log('user', user)
   const planId = localStorage.getItem('plan')
      ? Number(localStorage.getItem('plan'))
      : null

   const { loading, data: { subscription_subscriptionItemCount = [] } = {} } =
      useQuery(GET_PLAN_INFO, {
         variables: { planId },
         skip: isNull(planId) && isNull(user?.subscription),
         onError: error => console.error('error', error),
      })
   if (user?.subscription && loading) return <Loader inline={true} />

   const planInfoUser = {
      count: user?.subscription?.recipes?.count,
      price: user?.subscription?.recipes?.price,
      servingSize: user?.subscription?.recipes?.serving?.size,
      icon: user?.subscription?.subscriptionTitle?.metaDetails?.icon,
      title: user?.subscription?.subscriptionTitle?.title,
   }
   const planInfoFetched = {
      count: subscription_subscriptionItemCount[0]?.count,
      price: subscription_subscriptionItemCount[0]?.price,
      servingSize:
         subscription_subscriptionItemCount[0]?.subscriptionServing
            ?.servingSize,
      title: subscription_subscriptionItemCount[0]?.subscriptionServing
         ?.subscriptionTitle?.title,
      icon: subscription_subscriptionItemCount[0]?.subscriptionServing
         ?.subscriptionTitle?.metaDetails?.icon,
   }
   const planInfo = user?.subscription ? planInfoUser : planInfoFetched
   console.log('planInfo', planInfo)
   return (
      <div className="hern-plan-info">
         <div>
            <div className="hern-plan-info__title">
               {planInfo.icon ? (
                  <HernLazyImage
                     className="hern-plan-info__icon"
                     dataSrc={planInfo.icon}
                  />
               ) : (
                  <Cloche size={48} />
               )}

               <h3>{planInfo.title}</h3>
            </div>
            {planInfo.servingSize && (
               <div className="hern-plan-info__desc">
                  Serving size : {planInfo.servingSize}
               </div>
            )}
            {planInfo.count && (
               <div className="hern-plan-info__desc">
                  Recipes per week : {planInfo.count}
               </div>
            )}
            {planInfo.price && (
               <div className="hern-plan-info__price">
                  {formatCurrency(planInfo.price)}
               </div>
            )}
         </div>
      </div>
   )
}

export { PlanInfo }
