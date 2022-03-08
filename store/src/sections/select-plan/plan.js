import React from 'react'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import classNames from 'classnames'

import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { Loader } from '../../components'
import { isClient, formatCurrency, getRoute, LoginWrapper } from '../../utils'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Plan = ({ cameFrom = '', plan, handlePlanClick, itemCount }) => {
   const router = useRouter()
   const { user, isAuthenticated, isLoading } = useUser()
   const { addToast } = useToasts()
   const { configOf } = useConfig('conventions')
   const { t, dynamicTrans } = useTranslation()
   const [defaultItemCount, setDefaultItemCount] = React.useState(null)
   const [defaultServing, setDefaultServing] = React.useState(null)
   const [showLoginPopup, setShowLoginPopup] = React.useState(false)
   const [selectedPlan, setSelectedPlan] = React.useState(null)

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
   React.useEffect(() => {
      if (isAuthenticated && !isLoading && selectedPlan) {
         router.push(getRoute('/get-started/select-delivery'))
      }
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [isAuthenticated, isLoading, selectedPlan])
   const selectPlan = () => {
      if (handlePlanClick) {
         return handlePlanClick(defaultItemCount.id)
      }
      if (isClient) {
         window.localStorage.setItem('plan', defaultItemCount.id)
      }
      addToast(t('Successfully selected a plan.'), {
         appearance: 'success',
      })
      setSelectedPlan(defaultItemCount.id)

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
      if (!isAuthenticated && !isLoading) {
         // router.push(getRoute('/get-started/register'))
         setShowLoginPopup(true)
      } else {
         router.push(getRoute('/get-started/select-delivery'))
      }
      // router.push(
      //    getRoute(
      //       `/get-started/${
      //          cameFrom === 'our-plans' ? 'register' : 'select-delivery'
      //       }`
      //    )
      // )
   }

   const config = configOf('primary-labels')?.primaryLabels
   const colorConfig = configOf('theme-color', 'Visual')?.themeColor
   const priceDisplay = configOf('priceDisplay', 'Visual')?.priceDisplay

   const yieldLabel = {
      singular: config?.yieldLabel?.singular?.value || 'serving',
      plural: config?.yieldLabel?.singular?.value || 'servings',
   }
   const itemCountLabel = {
      singular: config?.itemLabel?.singular?.value || 'recipe',
      plural: config?.itemLabel?.singular?.value || 'recipes',
   }

   if (!defaultServing) return <Loader inline />

   const planClasses = classNames('hern-our-plans__plan', {
      'hern-our-plans_plan--count1': itemCount === 1,
   })

   return (
      <>
         <li className={planClasses}>
            {plan.metaDetails?.coverImage && (
               <div className="hern-our-plans__img__wrapper">
                  <img
                     src={plan.metaDetails?.coverImage}
                     className="hern-our-plans__plan__img"
                  />
               </div>
            )}
            <div className="hern-our-plans__plan__body">
               <h2
                  className="hern-our-plans__plan__title"
                  style={{
                     color: `${colorConfig?.accent?.value
                        ? colorConfig?.accent?.value
                        : 'rgba(5, 150, 105, 1)'
                        }`,
                  }}
               >
                  <span data-translation="true"
                     data-original-value={plan.title}>{plan.title}</span>

                  {plan.metaDetails?.icon && (
                     <img
                        className="hern-our-plans__plan__icon"
                        src={plan.metaDetails?.icon}
                     />
                  )}
               </h2>
               {plan?.metaDetails?.description && (
                  <p className="hern-our-plans__plan__description" data-translation="true"
                     data-original-value={plan?.metaDetails?.description}>

                     {plan?.metaDetails?.description}
                  </p>
               )}
               <section className="hern-our-plans__plan__servings">
                  {plan.servings.length === 1 ? (
                     <span className="hern-our-plans__plan__servings__label">
                        <span data-translation="true"
                           data-original-value={plan.servings[0].size}>
                           {plan.servings[0].size}
                        </span>
                        <span data-translation="true"
                           data-original-value={plan.servings[0].size > 1
                              ? yieldLabel.singular
                              : yieldLabel.plural}>
                           {plan.servings[0].size > 1
                              ? yieldLabel.singular
                              : yieldLabel.plural}</span>
                     </span>
                  ) : (
                     <div className="hern-our-plans__plan__servings__wrapper">
                        <span className="hern-our-plans__plan__servings__label--multi">
                           <span>{t('No. of')}</span> <span data-translation="true"
                              data-original-value={yieldLabel.plural}>{yieldLabel.plural}</span>
                        </span>
                        <ul className="hern-our-plans__plan__servings__count-list">
                           {plan.servings.map(serving => {
                              const countListClasses = classNames(
                                 'hern-our-plans__plan__servings__count-list-item',
                                 {
                                    'hern-our-plans__plan__servings__count-list-item--active':
                                       serving.id === defaultServing?.id,
                                 }
                              )
                              return (
                                 <li
                                    className={countListClasses}
                                    key={serving.id}
                                    onClick={() => setDefaultServing(serving)}
                                 >
                                    <div className="hern-our-plans__plan__servings-size">
                                       <div data-translation="true"
                                          data-original-value={serving.size}>{serving.size}</div>
                                       {serving?.metaDetails?.label && (
                                          <div data-translation="true"
                                             data-original-value={serving?.metaDetails?.label}>
                                             {serving?.metaDetails?.label}
                                          </div>
                                       )}
                                    </div>
                                 </li>
                              )
                           })}
                        </ul>
                     </div>
                  )}
               </section> <section className="hern-our-plans__plan__items-per-week">
                  {defaultServing.itemCounts.length === 1 ? (
                     <span className="hern-our-plans__plan__items-per-week__label">
                        <span data-translation="true"
                           data-original-value={defaultServing.itemCounts[0].count}>
                           {defaultServing.itemCounts[0].count
                           }</span>
                        <span data-translation="true"
                           data-original-value={defaultServing.itemCounts[0].count === 1
                              ? itemCountLabel.singular
                              : itemCountLabel.plural}>
                           {defaultServing.itemCounts[0].count === 1
                              ? itemCountLabel.singular
                              : itemCountLabel.plural}</span>
                        {t('per week')}
                     </span>
                  ) : (
                     <div className="hern-our-plans__plan__items-per-week__wrapper">
                        <span className="hern-our-plans__plan__items-per-week__label">
                           <span data-translation="true"
                              data-original-value={itemCountLabel.singular}>
                              {itemCountLabel.singular}
                           </span> {t('per week')}
                        </span>
                        <ul className="hern-our-plans__plan__items-per-week__count-list">
                           {defaultServing?.itemCounts.map(item => {
                              const countListClasses = classNames(
                                 'hern-our-plans__plan__items-per-week__count-list-item',
                                 {
                                    'hern-our-plans__plan__items-per-week__count-list-item--active':
                                       item.id === defaultItemCount?.id,
                                 }
                              )

                              return (
                                 <li
                                    className={countListClasses}
                                    key={item.id}
                                    onClick={() => setDefaultItemCount(item)}
                                 >
                                    <div className="hern-our-plans__plan__items-per-week__count">
                                       <div data-translation="true"
                                          data-original-value={item.count}>{item.count}</div>
                                       {item?.metaDetails?.label && (
                                          <div data-translation="true"
                                             data-original-value={item?.metaDetails?.label}>{item?.metaDetails?.label}</div>
                                       )}
                                    </div>
                                 </li>
                              )
                           })}
                        </ul>
                     </div>
                  )}
               </section>
               <hr />
               <div className="hern-our-plans__price">
                  {priceDisplay?.pricePerServing?.isVisible === true && (
                     <section className="hern-our-plans__price-per-servings">
                        {priceDisplay?.pricePerServing?.prefix && (
                           <span className="hern-our-plans__price-per-servings__prefix" data-translation="true"
                              data-original-value={priceDisplay?.pricePerServing?.prefix}>
                              {priceDisplay?.pricePerServing?.prefix}
                           </span>
                        )}
                        <span
                           style={{
                              color: `${colorConfig?.accent?.value
                                 ? colorConfig?.accent?.value
                                 : 'rgba(5, 150, 105, 1)'
                                 }`,
                           }}
                           className="hern-our-plans__price-per-servings__price"
                           data-translation="true"
                           data-original-value=
                           {formatCurrency(
                              Number.parseFloat(
                                 (defaultItemCount?.price || 1) /
                                 ((defaultItemCount?.count || 1) *
                                    (defaultServing?.size || 1))
                              ).toFixed(2)
                           )}
                        >
                           {formatCurrency(
                              Number.parseFloat(
                                 (defaultItemCount?.price || 1) /
                                 ((defaultItemCount?.count || 1) *
                                    (defaultServing?.size || 1))
                              ).toFixed(2)
                           )}
                           <span className="hern-our-plans__price-per-servings__suffix" data-translation="true"
                              data-original-value={priceDisplay?.pricePerServing?.suffix ||
                                 yieldLabel.singular}>
                              {priceDisplay?.pricePerServing?.suffix ||
                                 `per ${yieldLabel.singular}`}
                           </span>
                        </span>
                     </section>
                  )}
                  {/* ///start from here */}
                  {priceDisplay?.totalServing?.isVisible === true && (
                     <section className="hern-our-plans__price-total-servings">
                        {priceDisplay?.totalServing?.prefix && (
                           <span className="hern-our-plans__price-total-servings__prefix" data-translation="true"
                              data-original-value={priceDisplay?.totalServing?.prefix}>
                              {priceDisplay?.totalServing?.prefix}
                           </span>
                        )}
                        <span
                           style={{
                              color: `${colorConfig?.accent?.value
                                 ? colorConfig?.accent?.value
                                 : 'rgba(5, 150, 105, 1)'
                                 }`,
                           }}
                           className="hern-our-plans__price-total-servings__price"
                           data-translation="true"
                           data-original-value={Number.parseFloat(
                              (defaultItemCount?.count || 1) *
                              (defaultServing?.size || 1)
                           ).toFixed(0)}
                        >
                           {Number.parseFloat(
                              (defaultItemCount?.count || 1) *
                              (defaultServing?.size || 1)
                           ).toFixed(0)}
                        </span>
                     </section>
                  )}

                  {priceDisplay?.pricePerPlan?.isVisible === true && (
                     <section className="hern-our-plans__price-per-plan">
                        {priceDisplay?.pricePerPlan?.prefix && (
                           <span className="hern-our-plans__price-total-servings__prefix" data-translation="true"
                              data-original-value={priceDisplay?.pricePerPlan?.prefix}>
                              {priceDisplay?.pricePerPlan?.prefix}
                           </span>
                        )}
                        <div className="hern-our-plans__price-total-servings__wrapper">
                           <span
                              style={{
                                 color: `${colorConfig?.accent?.value
                                    ? colorConfig?.accent?.value
                                    : 'rgba(5, 150, 105, 1)'
                                    }`,
                              }}
                              className="hern-our-plans__price-total-servings__price"
                              data-translation="true"
                              data-original-value={formatCurrency(defaultItemCount?.price)}
                           >
                              {formatCurrency(defaultItemCount?.price)}
                           </span>
                           <span className="hern-our-plans__price-total-servings__tax" >
                              {defaultItemCount?.isTaxIncluded
                                 ? t('Tax Inclusive')
                                 : t('Tax Exclusive')}
                           </span>
                           <span className="hern-our-plans__price-total-servings__suffix" >
                              {<span data-translation="true"
                                 data-original-value={priceDisplay?.pricePerPlan?.suffix}>{priceDisplay?.pricePerPlan?.suffix}</span> ||
                                 <span>{t('Weekly total')}</span>}
                           </span>
                        </div>
                     </section>
                  )}
               </div>
               <button
                  className="hern-our-plans__select-plan__btn"
                  onClick={() => selectPlan()}
                  style={{
                     backgroundColor: `${colorConfig?.accent?.value
                        ? colorConfig?.accent?.value
                        : 'rgba(96, 165, 250, 1)'
                        }`,
                  }}
               >
                  {t('Select')}
               </button>
            </div>
         </li>
         <LoginWrapper
            closeLoginPopup={() => {
               setShowLoginPopup(false)
            }}
            showLoginPopup={showLoginPopup}
         />
      </>
   )
}
