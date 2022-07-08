import React from 'react'
import { useToasts } from 'react-toast-notifications'
import { useSubscription } from '@apollo/react-hooks'
import classNames from 'classnames'

import { Plan } from './plan'
import { PLANS } from '../../graphql'
import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { SkeletonPlan } from './skeletons'
import { HelperBar } from '../../components'
import { PlateIllustration } from '../../assets/icons/PlateIllustration'

export const Plans = ({ config }) => {
   const { user } = useUser()
   const { brand } = useConfig()
   const { addToast } = useToasts()
   const [list, setList] = React.useState([])
   const [isLoading, setIsLoading] = React.useState(true)
   const { t, dynamicTrans, locale } = useTranslation()

   // Plan view Config
   const planViewConfig = config?.display?.planView?.value?.value ?? 'card'

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

   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

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

   if (planViewConfig === 'list') {
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

   if (planViewConfig === 'card') {
      return (
         <div className="hern-plans__card__wrapper">
            <h1
               style={{
                  color: headingConfig.color,
                  fontFamily: headingConfig.fontFamily,
                  fontSize: headingConfig.fontSize,
                  fontWeight: headingConfig.fontWeight,
                  textAlign: headingConfig.textAlign,
                  padding: headingConfig.spacing,
               }}
               className="hern-plans__card__heading"
            >
               {headingConfig.heading}
            </h1>
            <ul
               className={classNames('hern-plans__card', {
                  'hern-plans--single': list.length === 1,
               })}
            >
               {list.map(plan => (
                  <Plan
                     plan={plan}
                     key={plan.id}
                     itemCount={list.length}
                     planConfig={config}
                     planViewConfig={planViewConfig}
                  />
               ))}
            </ul>
         </div>
      )
   }

   if (planViewConfig === 'aggregated') {
      return (
         <div className="hern-plans__aggregate__wrapper">
            <h1
               style={{
                  color: headingConfig.color,
                  fontFamily: headingConfig.fontFamily,
                  fontSize: headingConfig.fontSize,
                  fontWeight: headingConfig.fontWeight,
                  textAlign: headingConfig.textAlign,
                  padding: headingConfig.spacing,
               }}
               className="hern-plans__aggregate__heading"
            >
               {headingConfig.heading}
            </h1>

            <AggregatedView
               list={list}
               config={config}
               planViewConfig={planViewConfig}
            />
         </div>
      )
   }
}

// Aggregated View
const AggregatedView = ({ list, config, planViewConfig }) => {
   const [selectedPlan, setSelectedPlan] = React.useState(list[0])

   const handleSelectedPlan = planId => {
      let plan = list.filter(item => item.id === planId)[0]
      setSelectedPlan(plan)
   }

   return (
      <div className="hern-plans__aggregate">
         {/* TODO-
         - Create a green border around PlansCards when clicked
       */}
         <PlansCards
            list={list}
            config={config}
            planViewConfig={planViewConfig}
            handleSelectedPlan={handleSelectedPlan}
            selectedPlan={selectedPlan}
         />

         {/* <div className="hern-plans__aggregate__divider"></div> */}

         <PlansDetails
            selectedPlan={selectedPlan}
            list={list}
            config={config}
            planViewConfig={planViewConfig}
         />
      </div>
   )
}

// plan cards component
const PlansCards = ({
   list,
   config,
   planViewConfig,
   handleSelectedPlan,
   selectedPlan,
}) => {
   const { t, dynamicTrans, locale } = useTranslation()
   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   return (
      <div className="hern-plans__aggregate__left">
         <div className="hern-plans__aggregate__title-wrapper">
            <span>1</span>{' '}
            <p className="hern-plans__aggregate__title">
               {t('Choose your plan')}
            </p>
         </div>
         <div className="hern-plans__aggregate__cards-wrapper">
            {list.map(plan => (
               <div
                  style={{
                     border:
                        plan.id === selectedPlan.id ? '2px solid #11823B' : '',
                     padding: '5px',
                     borderRadius: '6px',
                  }}
                  className="hern-plans__aggregate__card"
                  key={plan.id}
                  onClick={() => handleSelectedPlan(plan.id)}
               >
                  <Plan
                     plan={plan}
                     itemCount={list.length}
                     planConfig={config}
                     planViewConfig={planViewConfig}
                     showSelectPlanButton={false}
                     showPlanPrice={false}
                     showPlanRecipes={false}
                     showPlanServings={false}
                     showPlanCoverImage={true}
                     showPlanIcon={false}
                     showPlanTitle={true}
                     showOveralay={true}
                  />
               </div>
            ))}
         </div>
      </div>
   )
}

// planDetails component
const PlansDetails = ({ selectedPlan, list, config, planViewConfig }) => {
   const { t, dynamicTrans, locale } = useTranslation()
   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   return (
      <div className="hern-plans__aggregate__right">
         <div className="hern-plans__aggregate__title-wrapper">
            <span>2</span>{' '}
            <p className="hern-plans__aggregate__title">
               {t('Choose your quantity')}
            </p>
         </div>
         <div>
            <div
               className="hern-plans__aggregate__plan-details"
               style={{
                  marginLeft: '25px',
               }}
            >
               <p className="hern-plans__aggregate__selectedPlan-title">
                  {/* TODO-
                  - Include plateIllustration
                */}
                  <span>
                     <PlateIllustration />
                  </span>
                  {selectedPlan.title}
               </p>
               <Plan
                  plan={selectedPlan}
                  itemCount={list.length}
                  planConfig={config}
                  planViewConfig={planViewConfig}
                  showSelectPlanButton={true}
                  showPlanPrice={true}
                  showPlanRecipes={true}
                  showPlanServings={true}
                  showPlanCoverImage={false}
                  showPlanIcon={true}
                  showPlanTitle={false}
                  showOveralay={false}
               />
            </div>
         </div>
      </div>
   )
}
