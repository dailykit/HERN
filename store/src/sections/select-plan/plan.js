import React from 'react'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import classNames from 'classnames'
import { PlateIllustration } from '../../assets/icons/PlateIllustration'
import { CardCoverIllustration } from '../../assets/icons/CardCoverIllustration'

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
   console.log('plans--->', plan, 'showPlanServings', showPlanServings)
   /*
      -TODO-
      - create a config for when the view is aggregated to make the plantitle configurable
      -Implement information visibily config
      -Hover and active state configs need to be created
      -Implement config for spacing (padding and margin)
      -Extract illustration svgs into separate files for reusability
      - Create config for the congratulations page
   */

   const selectPlanButtonConfig = {
      color: planConfig?.display?.selectPlanButton?.color?.value || '#ffffff',
      backgroundColor:
         planConfig?.display?.selectPlanButton?.backgroundColor?.value ||
         '#11823B',
      fontSize:
         planConfig?.display?.selectPlanButton?.fontSize?.value || '1.125rem',
      fontFamily:
         planConfig?.display?.selectPlanButton?.fontFamily?.value || 'Poppins',

      fontWeight:
         planConfig?.display?.selectPlanButton?.fontWeight?.value || '500',

      border:
         planConfig?.display?.selectPlanButton?.border?.border?.value || 'none',

      borderRadius:
         planConfig?.display?.selectPlanButton?.border?.borderRadius?.value ||
         '25px',
      hoverColor:
         planConfig?.display?.selectPlanButton?.hover?.color?.value ||
         '#FFFFFF',
   }

   // Button label
   const selectPlanButtonLabelConfig = {
      buttonLabel:
         planConfig?.data?.selectPlanButtonLabel?.value || 'Choose Plan',
   }

   // Plan title
   const selectPlanTitleConfig = {
      color: planConfig?.display?.planTitle?.color?.value || 'blue',
      fontSize: planConfig?.display?.planTitle?.fontSize?.value || '1.125rem',
      fontFamily:
         planConfig?.display?.planTitle?.fontFamily?.value || 'Poppins',
      fontWeight: planConfig?.display?.planTitle?.fontWeight?.value || '600',
   }

   //Yield and ItemCount labels
   const yieldAndItemsCountLabelConfig = {
      color:
         planConfig?.display?.yieldAndItemsCountLabel?.color?.value ||
         'rgba(51, 51, 51, 0.6)',
      fontSize:
         planConfig?.display?.yieldAndItemsCountLabel?.fontSize?.value ||
         '1rem',

      fontWeight:
         planConfig?.display?.yieldAndItemsCountLabel?.fontWeight?.value ||
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
         planConfig?.display?.countButton?.borderRadius?.value || '2px',
      backgroundColor:
         planConfig?.display?.countButton?.backgroundColor?.value ||
         ' rgba(17, 130, 59, 0.2)',
      fontSize: planConfig?.display?.countButton?.fontSize?.value || '1rem',
      fontWeight: planConfig?.display?.countButton?.fontWeight?.value || '600',
      color:
         planConfig?.display?.countButton?.color?.value ||
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
   const [servingsLastIndex, setServingsLastIndex] = React.useState(4)

   const [plansFirstIndex, setPlansFirstIndex] = React.useState(0)
   const [plansLastIndex, setPlansLastIndex] = React.useState(4)

   // handle margin right for servings and recipe buttons to maintain alignment of the buttons when you click next.
   const [planNext, setPlanNext] = React.useState(false)
   const [recipeNext, setRecipeNext] = React.useState(false)

   const plansToShow = React.useMemo(
      () => plan?.servings.slice(plansFirstIndex, plansLastIndex),
      [plansLastIndex, plan]
   )
   // console.log('user details', user)

   const servingsToShow = React.useMemo(
      () =>
         defaultServing?.itemCounts.slice(
            servingsFirstIndex,
            servingsLastIndex
         ),
      [servingsLastIndex, defaultServing, plansToShow]
   )

   const handlePlanNext = () => {
      setPlanNext(true)
      setPlansFirstIndex(plansFirstIndex + numberOfItemsToShow)
      if (plansLastIndex < plan.servings.length) {
         setPlansLastIndex(plansLastIndex + numberOfItemsToShow)
      }
   }

   const handlePlanPrevious = () => {
      setPlanNext(false)
      if (plansFirstIndex > 0) {
         setPlansFirstIndex(plansFirstIndex - numberOfItemsToShow)
         setPlansLastIndex(plansLastIndex - numberOfItemsToShow)
      }
   }

   const handleRecipeNext = () => {
      setRecipeNext(true)
      setServingsFirstIndex(servingsFirstIndex + numberOfItemsToShow)
      if (servingsLastIndex < defaultServing?.itemCounts.length) {
         setServingsLastIndex(servingsLastIndex + numberOfItemsToShow)
      }
   }
   const handleRecipePrevious = () => {
      setRecipeNext(false)
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
            // (user?.isSubscriber
            //    ? localStorage.setItem('redirect_to', '/select-menu')
            //    :
            localStorage.setItem('redirect_to', '/get-started/select-delivery')
         //   )
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
               {showPlanCoverImage && (
                  <div
                     style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#F9F9F9',
                     }}
                  >
                     <CardCoverIllustration width={'100%'} height={'225px'} />
                  </div>
               )}

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
                  <div
                     className={
                        planViewConfig === 'card'
                           ? 'hern-plan__card__icon'
                           : planViewConfig === 'aggregated'
                           ? 'hern-plan__aggregate__icon'
                           : 'hern-plan__icon'
                     }
                  >
                     <PlateIllustration />
                  </div>
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
                  {/* TODO-
                  - create a config when the view is aggregated
                */}
                  <span
                     style={{
                        color:
                           planViewConfig === 'aggregated'
                              ? '#ffffff'
                              : selectPlanTitleConfig.color,
                        fontSize:
                           planViewConfig === 'aggregated'
                              ? '15px'
                              : selectPlanTitleConfig.fontSize,
                        fontFamily: selectPlanTitleConfig.fontFamily,
                        fontWeight:
                           planViewConfig === 'aggregated'
                              ? '400'
                              : selectPlanTitleConfig.fontWeight,
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
                        color: yieldAndItemsCountLabelConfig?.color,
                        fontSize: yieldAndItemsCountLabelConfig?.fontSize,
                        fontWeight: yieldAndItemsCountLabelConfig?.fontWeight,
                     }}
                     data-translation="true"
                  >
                     {t(`${yieldLabelConfig?.plural}`)}
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
                     plan?.servings?.length > numberOfItemsToShow && (
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
                     style={{ marginRight: planNext ? '24px' : '' }}
                     className={
                        planViewConfig === 'card'
                           ? 'hern-plan__card__servings__list'
                           : 'hern-plan__servings__list'
                     }
                  >
                     {plansToShow.map(serving => {
                        console.log('servings:', serving)
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
                  {plan?.servings?.length > plansLastIndex && (
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
                     color: yieldAndItemsCountLabelConfig?.color,
                     fontSize: yieldAndItemsCountLabelConfig?.fontSize,
                     fontWeight: yieldAndItemsCountLabelConfig?.fontWeight,
                  }}
                  className={
                     planViewConfig === 'card'
                        ? 'hern-plan__card__item-counts__label'
                        : 'hern-plan__item-counts__label'
                  }
               >
                  <span data-translation="true">
                     {itemCountLabelConfig?.itemCountLabel}
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
                     defaultServing?.itemCounts?.length >
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
                     style={{ marginRight: recipeNext ? '24px' : '' }}
                     className={
                        planViewConfig === 'card'
                           ? 'hern-plan__card__item-counts__list'
                           : 'hern-plan__item-counts__list'
                     }
                  >
                     {servingsToShow &&
                        servingsToShow.map(item => {
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
                              : planViewConfig === 'aggregated'
                              ? 'hern-plan__aggregate__pricing__total-price'
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

// TODO-
// -Extract illustration svgs into separate files for reusability
