import { useQuery } from '@apollo/react-hooks'
import React from 'react'
import { HernLazyImage } from '../utils/hernImage'
import { formatCurrency } from '../utils'
import { Cloche } from '../assets/icons'
import { Loader } from './loader'
import { GET_PLAN_INFO } from '../graphql'

const PlanInfo = () => {
   const planId = localStorage.getItem('plan')
      ? Number(localStorage.getItem('plan'))
      : null
   console.log('planId', planId)
   const {
      error,
      loading,
      data: { subscription_subscriptionItemCount = [] } = {},
   } = useQuery(GET_PLAN_INFO, {
      variables: { planId },
      skip: !planId,
   })
   if (loading) return <Loader inline={true} />
   if (error) {
      console.error(error)
      return null
   }
   const planInfo = {
      count: subscription_subscriptionItemCount[0]?.count,
      price: subscription_subscriptionItemCount[0]?.price,
      servingSize:
         subscription_subscriptionItemCount[0]?.subscriptionServing
            ?.servingSize,
      subscriptionTitle:
         subscription_subscriptionItemCount[0]?.subscriptionServing
            ?.subscriptionTitle?.title,
      icon: subscription_subscriptionItemCount[0]?.subscriptionServing
         ?.subscriptionTitle?.metaDetails?.icon,
   }

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

               <h3>{planInfo.subscriptionTitle}</h3>
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
