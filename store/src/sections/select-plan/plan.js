import React from 'react'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import classNames from 'classnames'

import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { Loader } from '../../components'
import { isClient, formatCurrency, getRoute, LoginWrapper } from '../../utils'
import { HernLazyImage } from '../../utils/hernImage'
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Plan = ({
   plan,
   handlePlanClick,
   itemCount,
   planConfig,
   planViewConfig,
   showSelectPlanButton = true,
   showPlanPrice = true,
   showPlanRecipes = true,
   showPlanServings = true,
   showPlanCoverImage = true,
   showPlanIcon = true,
   showPlanTitle = true,
   showOveralay = false,
}) => {
   // subscription plan configurations (Display)
   // select button

   const selectPlanButtonConfig = {
      color: planConfig?.display?.selectPlanButton?.color?.value ?? '#ffffff',
      backgroundColor:
         planConfig?.display?.selectPlanButton?.backgroundColor?.value ??
         '#11823B',
      fontSize:
         planConfig?.display?.selectPlanButton?.fontSize?.value ?? '1.125rem',
      fontFamily:
         planConfig?.display?.selectPlanButton?.fontFamily?.value ?? 'Poppins',

      fontWeight:
         planConfig?.display?.selectPlanButton?.fontWeight?.value ?? '500',

      border:
         planConfig?.display?.selectPlanButton?.border?.border?.value ?? 'none',

      borderRadius:
         planConfig?.display?.selectPlanButton?.border?.borderRadius?.value ??
         '25px',
      hoverColor:
         planConfig?.display?.selectPlanButton?.hover?.color?.value ??
         '#FFFFFF',
   }

   // Button label
   const selectPlanButtonLabelConfig = {
      buttonLabel:
         planConfig?.data?.selectPlanButtonLabel?.value ?? 'Choose Plan',
   }

   // Plan title
   const selectPlanTitleConfig = {
      color: planConfig?.display?.planTitle?.color?.value ?? 'blue',
      fontSize: planConfig?.display?.planTitle?.fontSize?.value ?? '1.125rem',
      fontFamily:
         planConfig?.display?.planTitle?.fontFamily?.value ?? 'Poppins',
      fontWeight: planConfig?.display?.planTitle?.fontWeight?.value ?? '600',
   }

   //Yield and ItemCount labels
   const yieldAndItemsCountLabelConfig = {
      color:
         planConfig?.display?.yieldAndItemsCountLabel?.color?.value ??
         'rgba(51, 51, 51, 0.6)',
      fontSize:
         planConfig?.display?.yieldAndItemsCountLabel?.fontSize?.value ??
         '1rem',

      fontWeight:
         planConfig?.display?.yieldAndItemsCountLabel?.fontWeight?.value ??
         '500',
   }

   const yieldLabelConfig = {
      singular: planConfig?.data?.yieldLabel?.singular?.value || 'serving',
      plural: planConfig?.data?.yieldLabel?.plural?.value || 'servings',
   }

   const itemCountLabelConfig = {
      singular: planConfig?.data?.itemCountLabel?.singular?.value || 'recipe',
      plural: planConfig?.data?.itemCountLabel?.plural?.value || 'recipes',
      itemCountLabel: planConfig?.data?.itemCountLabel?.value || 'recipe',
   }

   // Count Buttons
   const countButtonConfig = {
      borderRadius:
         planConfig?.display?.countButton?.borderRadius?.value ?? '2px',
      backgroundColor:
         planConfig?.display?.countButton?.backgroundColor?.value ??
         ' rgba(17, 130, 59, 0.2)',
      fontSize: planConfig?.display?.countButton?.fontSize?.value ?? '1rem',
      fontWeight: planConfig?.display?.countButton?.fontWeight?.value ?? '600',
      color:
         planConfig?.display?.countButton?.color?.value ??
         'rgba(51, 51, 51, 0.6)',
   }

   //subscription plan configurations (Visibility)
   const router = useRouter()
   const { user, isAuthenticated, isLoading } = useUser()
   const { addToast } = useToasts()
   const { configOf } = useConfig('conventions')
   const { t, dynamicTrans, locale } = useTranslation()
   const [defaultItemCount, setDefaultItemCount] = React.useState(null)
   const [defaultServing, setDefaultServing] = React.useState(null)
   const [selectedPlan, setSelectedPlan] = React.useState(null)
   const numberOfItemsToShow = 4
   const [servingsFirstIndex, setServingsFirstIndex] = React.useState(0)
   const [servingsLastIndex, setServingsLastIndex] =
      React.useState(numberOfItemsToShow)

   const [plansFirstIndex, setPlansFirstIndex] = React.useState(0)
   const [plansLastIndex, setPlansLastIndex] =
      React.useState(numberOfItemsToShow)

   const plansToShow = plan.servings.slice(plansFirstIndex, plansLastIndex)

   const servingsToShow = defaultServing?.itemCounts.slice(
      servingsFirstIndex,
      servingsLastIndex
   )

   const handlePlanNext = () => {
      setPlansFirstIndex(plansFirstIndex + numberOfItemsToShow)
      if (plansLastIndex < plan.servings.length) {
         setPlansLastIndex(plansLastIndex + numberOfItemsToShow)
      }
   }

   const handlePlanPrevious = () => {
      if (plansFirstIndex > 0) {
         setPlansFirstIndex(plansFirstIndex - numberOfItemsToShow)
         setPlansLastIndex(plansLastIndex - numberOfItemsToShow)
      }
   }

   const handleRecipeNext = () => {
      setServingsFirstIndex(servingsFirstIndex + numberOfItemsToShow)
      if (servingsLastIndex < defaultServing?.itemCounts.length) {
         setServingsLastIndex(servingsLastIndex + numberOfItemsToShow)
      }
   }
   const handleRecipePrevious = () => {
      if (servingsFirstIndex > 0) {
         setServingsFirstIndex(servingsFirstIndex - numberOfItemsToShow)
         setServingsLastIndex(servingsLastIndex - numberOfItemsToShow)
      }
   }

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
   }, [isAuthenticated, isLoading, selectedPlan])
   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   //handle plan click
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
         isClient &&
            localStorage.setItem('redirect_to', '/get-started/select-delivery')
         router.push(getRoute('/login'))
      } else {
         router.push(getRoute('/get-started/select-delivery'))
      }
   }

   const colorConfig = configOf('theme-color', 'Visual')?.themeColor
   const priceDisplay = configOf('priceDisplay', 'Visual')?.priceDisplay

   if (!defaultServing) return <Loader inline />

   return (
      <li
         className={
            planViewConfig === 'card'
               ? 'hern-plan__card'
               : planViewConfig === 'aggregated'
               ? 'hern-plan__aggregate'
               : 'hern-plan'
         }
      >
         {/* <div className="hern-our-plans__plan__body"> */}

         {/* Cover image should maintain 2:1 aspect ratio always  */}
         {plan.metaDetails?.coverImage && showPlanCoverImage ? (
            <div
               className={
                  planViewConfig === 'card'
                     ? 'hern-plan__card__cover-image'
                     : planViewConfig === 'aggregated'
                     ? 'hern-plan__aggregate__cover-image'
                     : 'hern-plan__cover-image'
               }
            >
               <HernLazyImage
                  dataSrc={plan.metaDetails?.coverImage}
                  className={
                     planViewConfig === 'card'
                        ? 'hern-plan__card__plan__img'
                        : planViewConfig === 'aggregated'
                        ? 'hern-plan__aggregate__plan__img'
                        : 'hern-plan__plan__img'
                  }
               />

               {showOveralay && (
                  <div className="hern-plan__aggregate__overlay"></div>
               )}
            </div>
         ) : (
            <div
               className={
                  planViewConfig === 'card'
                     ? 'hern-plan__card__cover-image'
                     : 'hern-plan__cover-image'
               }
               style={{
                  display: `${planViewConfig === 'aggregated' ? 'block' : ''}`,
               }}
            >
               {showPlanCoverImage && <CardCoverIllustration />}

               {showOveralay && (
                  <div className="hern-plan__aggregate__overlay"></div>
               )}
            </div>
         )}

         {/* Plan title and  icon  */}

         {showPlanTitle && (
            <div
               className={
                  planViewConfig === 'card'
                     ? 'hern-plan__card__icon-title-wrapper'
                     : planViewConfig === 'aggregated'
                     ? 'hern-plan__aggregate__icon-title-wrapper'
                     : 'hern-plan__icon-title-wrapper'
               }
            >
               {plan.metaDetails?.icon && showPlanIcon ? (
                  <div
                     className={
                        planViewConfig === 'card'
                           ? 'hern-plan__card__icon'
                           : planViewConfig === 'aggregated'
                           ? 'hern-plan__aggregate__icon'
                           : 'hern-plan__icon'
                     }
                  >
                     <img src={plan.metaDetails?.icon} />
                  </div>
               ) : (
                  <PlateIllustration />
               )}

               <h2
                  title={plan.title}
                  className={
                     planViewConfig === 'card'
                        ? 'hern-plan__card__title'
                        : planViewConfig === 'aggregated'
                        ? 'hern-plan__aggregate__title'
                        : 'hern-plan__title'
                  }
               >
                  <span
                     style={{
                        color: selectPlanTitleConfig.color,
                        fontSize: selectPlanTitleConfig.fontSize,
                        fontFamily: selectPlanTitleConfig.fontFamily,
                        fontWeight: selectPlanTitleConfig.fontWeight,
                     }}
                     data-translation="true"
                  >
                     {plan.title}
                  </span>
               </h2>
            </div>
         )}

         {plan?.metaDetails?.description && (
            <p
               className={
                  planViewConfig === 'card'
                     ? 'hern-plan__card__description'
                     : 'hern-plan__description'
               }
               data-translation="true"
            >
               {'plan?.metaDetails?.description'}
            </p>
         )}

         {/* <section className="hern-plan__servings"> */}
         {/* {plan.servings.length === 1 ? (
               <span className="hern-plan__yield--single">
                  <span className="hern-our-plans__plan__servings__label--multi">
                     <span>{t('No. of')}</span>{' '}
                     <span data-translation="true">{yieldLabel.plural}</span>
                  </span>
                  <span
                     data-translation="true"
                     className="hern-our-plans__plan__servings__label--item"
                  >
                     {plan.servings[0].size}
                  </span>
                  <span
                     data-translation="true"
                     className="hern-our-plans__plan__servings__label--item"
                  >
                     {plan.servings[0].size > 1
                        ? yieldLabel.singular
                        : yieldLabel.plural}
                  </span>
               </span>
            ) : ( */}

         {showPlanServings && (
            <div
               className={
                  planViewConfig === 'card'
                     ? 'hern-plan__card__servings'
                     : planViewConfig === 'aggregated'
                     ? 'hern-plan__aggregate__servings'
                     : 'hern-plan__servings'
               }
            >
               <h4
                  className={
                     planViewConfig === 'card'
                        ? 'hern-plan__card__servings__label'
                        : 'hern-plan__servings__label'
                  }
               >
                  {/* <span>{t('No. of')}</span>{' '} */}
                  <span
                     style={{
                        color: yieldAndItemsCountLabelConfig.color,
                        fontSize: yieldAndItemsCountLabelConfig.fontSize,
                        fontWeight: yieldAndItemsCountLabelConfig.fontWeight,
                     }}
                     data-translation="true"
                  >
                     {yieldLabelConfig.plural}
                  </span>
               </h4>
               <div
                  className={
                     planViewConfig === 'card'
                        ? 'hern-plan__card__servings__list__wrapper'
                        : 'hern-plan__servings__list__wrapper'
                  }
               >
                  {plansFirstIndex > 0 &&
                     plan.servings.length > numberOfItemsToShow && (
                        <button
                           className={
                              planViewConfig === 'card'
                                 ? 'hern-plan__card__servings__arrow-btn--left'
                                 : 'hern-plan__servings__arrow-btn--left'
                           }
                           onClick={handlePlanPrevious}
                        >
                           <BiChevronLeft size={20} />
                        </button>
                     )}
                  <ul
                     className={
                        planViewConfig === 'card'
                           ? 'hern-plan__card__servings__list'
                           : 'hern-plan__servings__list'
                     }
                  >
                     {plansToShow.map(serving => {
                        return (
                           <li
                              className={classNames(
                                 `${
                                    planViewConfig === 'card'
                                       ? 'hern-plan__card__servings__list-item'
                                       : 'hern-plan__servings__list-item'
                                 }`,
                                 {
                                    'hern-plan__servings__list-item--active':
                                       serving.id === defaultServing?.id,
                                 }
                              )}
                              key={serving.id}
                              onClick={() => setDefaultServing(serving)}
                              style={{
                                 borderRadius: countButtonConfig.borderRadius,
                                 backgroundColor:
                                    countButtonConfig.backgroundColor,
                                 fontSize: countButtonConfig.fontSize,
                                 fontWeight: countButtonConfig.fontWeight,
                                 color: countButtonConfig.color,
                              }}
                           >
                              <div data-translation="true">{serving.size}</div>
                              {serving?.metaDetails?.label && (
                                 <div data-translation="true">
                                    {serving?.metaDetails?.label}
                                 </div>
                              )}
                           </li>
                        )
                     })}
                  </ul>
                  {plan.servings.length > plansLastIndex && (
                     <button
                        className={
                           planViewConfig === 'card'
                              ? 'hern-plan__card__servings__arrow-btn--right'
                              : 'hern-plan__servings__arrow-btn--right'
                        }
                        onClick={handlePlanNext}
                     >
                        <BiChevronRight size={20} />
                     </button>
                  )}
               </div>
            </div>
         )}

         {/* )} */}
         {/* </section> */}
         {/* <section className="hern-our-plans__plan__items-per-week">
               {defaultServing.itemCounts.length === 1 ? (
                  <span className="hern-our-plans__plan__items-per-week__label">
                     <span data-translation="true">
                        {defaultServing.itemCounts[0].count}
                     </span>
                     <span data-translation="true">
                        {defaultServing.itemCounts[0].count === 1
                           ? itemCountLabel.singular
                           : itemCountLabel.plural}
                     </span>
                     {t('per week')}
                  </span>
               ) : ( */}

         {showPlanRecipes && (
            <div
               className={
                  planViewConfig === 'card'
                     ? 'hern-plan__card__item-counts'
                     : planViewConfig === 'aggregated'
                     ? 'hern-plan__aggregate__item-counts'
                     : 'hern-plan__item-counts'
               }
            >
               <h4
                  style={{
                     color: yieldAndItemsCountLabelConfig.color,
                     fontSize: yieldAndItemsCountLabelConfig.fontSize,
                     fontWeight: yieldAndItemsCountLabelConfig.fontWeight,
                  }}
                  className={
                     planViewConfig === 'card'
                        ? 'hern-plan__card__item-counts__label'
                        : 'hern-plan__item-counts__label'
                  }
               >
                  <span data-translation="true">
                     {itemCountLabelConfig.itemCountLabel}
                  </span>{' '}
                  {t('per week')}
               </h4>
               <div
                  className={
                     planViewConfig === 'card'
                        ? 'hern-plan__card__item-counts__list__wrapper'
                        : 'hern-plan__item-counts__list__wrapper'
                  }
               >
                  {servingsFirstIndex > 0 &&
                     defaultServing?.itemCounts.length >
                        numberOfItemsToShow && (
                        <button
                           className={
                              planViewConfig === 'card'
                                 ? 'hern-plan__card__item-counts__arrow-btn--left'
                                 : 'hern-plan__item-counts__arrow-btn--left'
                           }
                           onClick={handleRecipePrevious}
                        >
                           <BiChevronLeft size={20} />
                        </button>
                     )}
                  <ul
                     className={
                        planViewConfig === 'card'
                           ? 'hern-plan__card__item-counts__list'
                           : 'hern-plan__item-counts__list'
                     }
                  >
                     {servingsToShow.map(item => {
                        return (
                           <li
                              className={classNames(
                                 `${
                                    planViewConfig === 'card'
                                       ? 'hern-plan__card__item-counts__list-item'
                                       : 'hern-plan__item-counts__list-item'
                                 }`,
                                 {
                                    'hern-plan__item-counts__list-item--active':
                                       item.id === defaultItemCount?.id,
                                 }
                              )}
                              key={item.id}
                              onClick={() => setDefaultItemCount(item)}
                           >
                              <div data-translation="true">{item.count}</div>
                              {item?.metaDetails?.label && (
                                 <div data-translation="true">
                                    {item?.metaDetails?.label}
                                 </div>
                              )}
                           </li>
                        )
                     })}
                  </ul>
                  {defaultServing?.itemCounts.length > servingsLastIndex && (
                     <button
                        className={
                           planViewConfig === 'card'
                              ? 'hern-plan__card__servings__arrow-btn--right'
                              : 'hern-plan__servings__arrow-btn--right'
                        }
                        onClick={handleRecipeNext}
                     >
                        <BiChevronRight size={20} />
                     </button>
                  )}
               </div>
            </div>
         )}

         {/* )}
            </section> */}
         {/* <hr /> */}
         {(priceDisplay?.pricePerServing?.isVisible.value === true ||
            priceDisplay?.totalServing?.isVisible.value === true ||
            priceDisplay?.pricePerPlan?.isVisible.value === true) &&
            showPlanPrice && (
               <div
                  className={
                     planViewConfig === 'card'
                        ? 'hern-plan__card__pricing'
                        : planViewConfig === 'aggregated'
                        ? 'hern-plan__aggregate__pricing'
                        : 'hern-plan__pricing'
                  }
               >
                  <div
                     className={
                        planViewConfig === 'card'
                           ? 'hern-plan__card__pricing-total-price-serving-wrapper'
                           : planViewConfig === 'aggregated'
                           ? 'hern-plan__aggregate__pricing-total-price-serving-wrapper'
                           : 'hern-plan__pricing-total-price-serving-wrapper'
                     }
                  >
                     {priceDisplay?.totalServing?.isVisible.value === true && (
                        <section className="hern-plan__pricing__total-serving">
                           {priceDisplay?.totalServing?.prefix.value && (
                              <span
                                 className={
                                    planViewConfig === 'card'
                                       ? 'hern-plan__card__pricing__total-serving__prefix'
                                       : 'hern-plan__pricing__total-serving__prefix'
                                 }
                                 data-translation="true"
                              >
                                 {priceDisplay?.totalServing?.prefix.value}{' '}
                              </span>
                           )}
                           <span
                              className={
                                 planViewConfig === 'card'
                                    ? 'hern-plan__card__pricing__total-serving__price'
                                    : 'hern-plan__pricing__total-serving__price'
                              }
                              data-translation="true"
                           >
                              {Number.parseFloat(
                                 (defaultItemCount?.count || 1) *
                                    (defaultServing?.size || 1)
                              ).toFixed(0)}{' '}
                           </span>
                           {priceDisplay?.totalServing?.suffix.value && (
                              <span
                                 className={
                                    planViewConfig === 'card'
                                       ? 'hern-plan__card__pricing__total-serving__prefix'
                                       : 'hern-plan__pricing__total-serving__prefix'
                                 }
                                 data-translation="true"
                              >
                                 {priceDisplay?.totalServing?.suffix.value}
                              </span>
                           )}
                        </section>
                     )}
                     {priceDisplay?.pricePerServing?.isVisible.value ===
                        true && (
                        <section
                           className={
                              planViewConfig === 'card'
                                 ? 'hern-plan__card__pricing__price-per-serving'
                                 : 'hern-plan__pricing__price-per-serving'
                           }
                        >
                           {priceDisplay?.pricePerServing?.prefix.value && (
                              <span
                                 className={
                                    planViewConfig === 'card'
                                       ? 'hern-plan__card__pricing__price-per-serving__prefix'
                                       : 'hern-plan__pricing__price-per-serving__prefix'
                                 }
                                 data-translation="true"
                              >
                                 {priceDisplay?.pricePerServing?.prefix.value}{' '}
                              </span>
                           )}
                           <span
                              className={
                                 planViewConfig === 'card'
                                    ? 'hern-plan__card__pricing__price-per-serving__price'
                                    : 'hern-plan__pricing__price-per-serving__price'
                              }
                              data-translation="true"
                           >
                              {formatCurrency(
                                 Number.parseFloat(
                                    (defaultItemCount?.price || 1) /
                                       ((defaultItemCount?.count || 1) *
                                          (defaultServing?.size || 1))
                                 ).toFixed(2)
                              )}{' '}
                              <span
                                 className={
                                    planViewConfig === 'card'
                                       ? 'hern-plan__card__pricing__price-per-serving__suffix'
                                       : 'hern-plan__pricing__price-per-serving__suffix'
                                 }
                                 data-translation="true"
                              >
                                 {priceDisplay?.pricePerServing?.suffix.value ||
                                    `per ${yieldLabelConfig.singular}`}
                              </span>
                           </span>
                        </section>
                     )}
                  </div>
                  {priceDisplay?.pricePerPlan?.isVisible.value === true && (
                     <section
                        className={
                           planViewConfig === 'card'
                              ? 'hern-plan__card__pricing__total-price'
                              : 'hern-plan__pricing__total-price'
                        }
                     >
                        {priceDisplay?.pricePerPlan?.prefix && (
                           <span
                              className={
                                 planViewConfig === 'card'
                                    ? 'hern-plan__card__pricing__total-price__prefix'
                                    : 'hern-plan__pricing__total-price__prefix'
                              }
                              data-translation="true"
                           >
                              {priceDisplay?.pricePerPlan?.prefix.value}{' '}
                           </span>
                        )}
                        <br />
                        <span
                           style={{
                              color: `${
                                 colorConfig?.accent?.value
                                    ? colorConfig?.accent?.value
                                    : 'rgba(5, 150, 105, 1)'
                              }`,
                           }}
                           className={
                              planViewConfig === 'card'
                                 ? 'hern-plan__card__pricing__total-price__price'
                                 : 'hern-plan__pricing__total-price__price'
                           }
                           data-translation="true"
                        >
                           {formatCurrency(defaultItemCount?.price)}{' '}
                        </span>
                        <span
                           className={
                              planViewConfig === 'card'
                                 ? 'hern-plan__card__pricing__total-price__tax'
                                 : 'hern-plan__pricing__total-price__tax'
                           }
                        >
                           {defaultItemCount?.isTaxIncluded
                              ? t('Tax Inclusive')
                              : t('Tax Exclusive')}{' '}
                        </span>
                        <span
                           className={
                              planViewConfig === 'card'
                                 ? 'hern-plan__card__pricing__total-price__suffix'
                                 : 'hern-plan__pricing__total-price__suffix'
                           }
                        >
                           {(
                              <span data-translation="true">
                                 {priceDisplay?.pricePerPlan?.suffix.value}
                              </span>
                           ) || <span>{t('Weekly total')}</span>}
                        </span>
                     </section>
                  )}
               </div>
            )}

         {showSelectPlanButton && (
            <button
               className={
                  planViewConfig === 'card'
                     ? 'hern-plan__card__select-plan__btn'
                     : planViewConfig === 'aggregated'
                     ? 'hern-plan__aggregate__select-plan__btn'
                     : 'hern-plan__select-plan__btn'
               }
               onClick={() => selectPlan()}
               style={{
                  color: selectPlanButtonConfig.color,
                  backgroundColor: selectPlanButtonConfig.backgroundColor,
                  fontSize: selectPlanButtonConfig.fontSize,
                  fontFamily: selectPlanButtonConfig.fontFamily,
                  fontWeight: selectPlanButtonConfig.fontWeight,
                  borderRadius: selectPlanButtonConfig.borderRadius,
                  border: selectPlanButtonConfig.border,
               }}
            >
               {t(`${selectPlanButtonLabelConfig?.buttonLabel}`)}
            </button>
         )}

         {/* </div> */}
      </li>
   )
}
const PlateIllustration = () => (
   <svg
      width="29"
      height="29"
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <g clip-path="url(#clip0_1428_1520)">
         <path
            d="M14.0974 6.58142C12.4534 6.58142 10.8462 7.06894 9.47924 7.98233C8.11225 8.89572 7.04682 10.194 6.41767 11.7129C5.78851 13.2318 5.6239 14.9031 5.94464 16.5156C6.26538 18.1281 7.05707 19.6092 8.21959 20.7717C9.38211 21.9343 10.8633 22.726 12.4757 23.0467C14.0882 23.3674 15.7596 23.2028 17.2785 22.5737C18.7974 21.9445 20.0956 20.8791 21.009 19.5121C21.9224 18.1451 22.4099 16.538 22.4099 14.8939C22.4075 12.6901 21.5309 10.5772 19.9726 9.01878C18.4142 7.46041 16.3013 6.58385 14.0974 6.58142ZM14.0974 22.3314C12.6264 22.3314 11.1885 21.8952 9.96536 21.078C8.74227 20.2607 7.78899 19.0992 7.22606 17.7401C6.66314 16.3811 6.51585 14.8857 6.80283 13.4429C7.0898 12.0002 7.79816 10.675 8.83831 9.63481C9.87846 8.59466 11.2037 7.88631 12.6464 7.59933C14.0892 7.31235 15.5846 7.45964 16.9436 8.02257C18.3026 8.58549 19.4642 9.53878 20.2815 10.7619C21.0987 11.985 21.5349 13.4229 21.5349 14.8939C21.5327 16.8658 20.7484 18.7563 19.3541 20.1506C17.9598 21.5449 16.0693 22.3292 14.0974 22.3314Z"
            fill="#333333"
            fill-opacity="0.6"
         />
         <path
            d="M5.78491 10.0814V5.70642H4.90991V9.64392H4.47241V5.70642H3.59741V9.64392H3.15991V5.70642H2.28491V9.64392H1.84741V5.70642H0.972412V12.2689C0.972743 12.5403 1.05701 12.8049 1.21367 13.0265C1.37032 13.2481 1.59169 13.4158 1.84741 13.5066V23.6439C1.84741 23.992 1.98569 24.3259 2.23183 24.572C2.47798 24.8181 2.81182 24.9564 3.15991 24.9564H3.59741C3.94551 24.9564 4.27935 24.8181 4.52549 24.572C4.77163 24.3259 4.90991 23.992 4.90991 23.6439V13.5066C5.16563 13.4158 5.387 13.2481 5.54366 13.0265C5.70031 12.8049 5.78458 12.5403 5.78491 12.2689V10.0814ZM4.90991 12.2689C4.90991 12.385 4.86382 12.4962 4.78177 12.5783C4.69972 12.6603 4.58844 12.7064 4.47241 12.7064C4.35638 12.7064 4.2451 12.7525 4.16305 12.8346C4.08101 12.9166 4.03491 13.0279 4.03491 13.1439V23.6439C4.03491 23.76 3.98882 23.8712 3.90677 23.9533C3.82472 24.0353 3.71344 24.0814 3.59741 24.0814H3.15991C3.04388 24.0814 2.9326 24.0353 2.85055 23.9533C2.76851 23.8712 2.72241 23.76 2.72241 23.6439V13.1439C2.72241 13.0279 2.67632 12.9166 2.59427 12.8346C2.51222 12.7525 2.40094 12.7064 2.28491 12.7064C2.16888 12.7064 2.0576 12.6603 1.97555 12.5783C1.89351 12.4962 1.84741 12.385 1.84741 12.2689V10.5189H4.90991V12.2689ZM26.7849 5.26892C25.741 5.27008 24.7401 5.68529 24.002 6.42347C23.2638 7.16164 22.8486 8.16249 22.8474 9.20642V14.8939C22.8474 15.242 22.9857 15.5759 23.2318 15.822C23.478 16.0681 23.8118 16.2064 24.1599 16.2064V24.5189C24.1599 24.635 24.206 24.7462 24.2881 24.8283C24.3701 24.9103 24.4814 24.9564 24.5974 24.9564H26.7849C26.9009 24.9564 27.0122 24.9103 27.0943 24.8283C27.1763 24.7462 27.2224 24.635 27.2224 24.5189V5.70642C27.2224 5.59039 27.1763 5.47911 27.0943 5.39706C27.0122 5.31501 26.9009 5.26892 26.7849 5.26892ZM26.3474 24.0814H25.0349V15.7689C25.0349 15.6529 24.9888 15.5416 24.9068 15.4596C24.8247 15.3775 24.7134 15.3314 24.5974 15.3314H24.1599C24.0439 15.3314 23.9326 15.2853 23.8506 15.2033C23.7685 15.1212 23.7224 15.01 23.7224 14.8939V9.20642C23.7233 8.47021 23.989 7.75889 24.4709 7.20234C24.9529 6.64579 25.6189 6.28115 26.3474 6.17498V24.0814Z"
            fill="#333333"
            fill-opacity="0.6"
         />
         <path
            d="M25.0349 7.89392H24.1599V14.4564H25.0349V7.89392Z"
            fill="#333333"
            fill-opacity="0.6"
         />
         <path
            d="M14.0974 10.5189C13.2321 10.5189 12.3863 10.7755 11.6668 11.2562C10.9473 11.737 10.3866 12.4203 10.0554 13.2197C9.72431 14.0191 9.63767 14.8988 9.80648 15.7474C9.97529 16.5961 10.392 17.3757 11.0038 17.9875C11.6157 18.5994 12.3952 19.016 13.2439 19.1849C14.0926 19.3537 14.9722 19.267 15.7717 18.9359C16.5711 18.6048 17.2544 18.044 17.7351 17.3245C18.2158 16.6051 18.4724 15.7592 18.4724 14.8939C18.4711 13.734 18.0098 12.6219 17.1896 11.8017C16.3694 10.9815 15.2573 10.5202 14.0974 10.5189ZM14.0974 18.3939C13.4052 18.3939 12.7285 18.1886 12.1529 17.8041C11.5773 17.4195 11.1287 16.8729 10.8638 16.2333C10.5989 15.5938 10.5296 14.89 10.6647 14.2111C10.7997 13.5322 11.1331 12.9085 11.6225 12.419C12.112 11.9296 12.7357 11.5962 13.4146 11.4612C14.0935 11.3261 14.7973 11.3954 15.4368 11.6603C16.0763 11.9252 16.623 12.3739 17.0076 12.9494C17.3921 13.525 17.5974 14.2017 17.5974 14.8939C17.5964 15.8219 17.2273 16.7115 16.5711 17.3676C15.915 18.0238 15.0254 18.3929 14.0974 18.3939Z"
            fill="#333333"
            fill-opacity="0.6"
         />
      </g>
      <defs>
         <clipPath id="clip0_1428_1520">
            <rect
               width="28"
               height="28"
               fill="white"
               transform="translate(0.0974121 0.894043)"
            />
         </clipPath>
      </defs>
   </svg>
)

const CardCoverIllustration = () => (
   <div
      style={{
         width: '100%',
         minHeight: '230px',
         display: 'flex',
         justifyContent: 'center',
         alignItems: 'center',
         backgroundColor: '#F9F9F9',
      }}
   >
      <svg
         width="150"
         height="161"
         viewBox="0 0 150 161"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M11.0495 149.53C11.4666 149.947 11.8821 150.154 12.5084 150.154H89.9997H90.2075L126.454 160.57H127.079C127.496 160.57 127.911 160.362 128.328 160.153C128.953 159.736 129.161 159.111 129.161 158.486V150.155H137.492C138.117 150.155 138.534 149.947 138.951 149.53L149.367 139.114C149.992 138.489 150.199 137.655 149.784 136.823C149.576 135.989 148.742 135.572 147.909 135.572H139.578C138.536 103.076 113.331 76.62 81.4593 73.4954C82.0841 72.4535 82.2919 71.2039 82.2919 69.9543C82.2919 65.9961 78.9586 62.6627 75.0003 62.6627C71.042 62.6627 67.7087 65.996 67.7087 69.9543C67.7087 71.2039 68.1258 72.4536 68.5413 73.4954C36.6714 76.6209 11.4644 103.075 10.4229 135.572H2.09124C1.25863 135.572 0.424574 135.989 0.216785 136.821C-0.200244 137.654 0.00900297 138.488 0.633817 139.113L11.0495 149.53ZM124.995 155.778L68.9597 139.739H124.995V155.778ZM142.91 139.739L136.66 145.989L129.162 145.987V139.738H137.494L142.91 139.739ZM75.0007 66.8306C76.6673 66.8306 78.1247 68.2895 78.1247 69.9547C78.1247 71.6214 76.6673 73.0787 75.0007 73.0787C73.334 73.0787 71.8766 71.6199 71.8766 69.9547C71.8766 68.288 73.334 66.8306 75.0007 66.8306ZM75.0007 77.2461C107.706 77.2461 134.369 103.285 135.411 135.573H127.079L54.1704 135.571H14.5915C15.6319 103.285 42.2956 77.2447 75.0014 77.2447L75.0007 77.2461ZM12.5077 139.739H53.9614L75.8343 145.989L13.3413 145.987L7.09165 139.738L12.5077 139.739Z"
            fill="#333333"
            fill-opacity="0.4"
         />
         <path
            d="M77.084 85.5786C77.084 84.3289 76.2513 83.4949 75.0003 83.4949C53.5443 83.4949 33.9632 96.2018 25.4225 115.991C25.0055 117.033 25.4225 118.282 26.4644 118.699C26.6721 118.907 27.0892 118.907 27.297 118.907C28.1296 118.907 28.9636 118.49 29.1714 117.657C37.0876 99.5349 55.2116 87.662 74.9996 87.662C76.2492 87.662 77.0833 86.8279 77.0833 85.5783L77.084 85.5786Z"
            fill="#333333"
            fill-opacity="0.4"
         />
         <path
            d="M92.9151 63.7059C92.2903 64.7477 92.7074 65.9974 93.7477 66.4144C93.9555 66.6222 94.3726 66.6222 94.7896 66.6222C95.6222 66.6222 96.2485 66.2051 96.664 65.5803C102.497 54.3323 99.3725 48.0827 96.8718 42.8749C94.3726 37.6672 92.0811 33.2919 96.8718 23.9183C97.2889 22.8765 96.8718 21.6269 95.83 21.2099C94.7881 20.7928 93.5385 21.2099 93.1215 22.2517C87.4968 33.4997 90.6222 39.5414 93.1215 44.9571C95.6237 49.9569 97.7058 54.3322 92.9152 63.7057L92.9151 63.7059Z"
            fill="#333333"
            fill-opacity="0.4"
         />
         <path
            d="M72.0846 42.8747C71.4598 43.9166 71.8768 45.1662 72.9172 45.5832C73.125 45.791 73.542 45.791 73.959 45.791C74.7916 45.791 75.4179 45.3739 75.8335 44.7491C81.6662 33.5011 78.542 27.2515 76.0413 22.0437C73.542 16.836 71.2505 12.4607 76.0413 3.08717C76.4583 2.04532 76.0413 0.795683 74.9994 0.378691C73.9576 -0.0383376 72.7079 0.378693 72.2909 1.42054C66.6662 12.6685 69.7917 18.7103 72.2909 24.1259C74.7931 29.1257 76.8753 33.501 72.0846 42.8746L72.0846 42.8747Z"
            fill="#333333"
            fill-opacity="0.4"
         />
         <path
            d="M53.1283 63.7059C52.5035 64.7477 52.9205 65.9974 53.9609 66.4144C54.1687 66.6222 54.5857 66.6222 55.0027 66.6222C55.8353 66.6222 56.4616 66.2051 56.8772 65.5803C62.7099 54.3323 59.5857 48.0827 57.085 42.8749C54.5857 37.6672 52.2942 33.2919 57.085 23.9183C57.502 22.8765 57.085 21.6269 56.0431 21.2099C55.0013 20.7928 53.7516 21.2099 53.3346 22.2517C47.7099 33.4997 50.8354 39.5414 53.3346 44.9571C55.8368 49.9569 57.919 54.3322 53.1283 63.7057L53.1283 63.7059Z"
            fill="#333333"
            fill-opacity="0.4"
         />
      </svg>
   </div>
)
