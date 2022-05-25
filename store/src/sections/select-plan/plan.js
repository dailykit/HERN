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
import config from './planConfig.json'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Plan = ({ plan, handlePlanClick, itemCount }) => {
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
   console.log('plan', plan.servings)
   return (
      <li className="hern-plan">
         {/* <div className="hern-our-plans__plan__body"> */}

         {/* Cover image should maintain 2:1 aspect ratio always  */}
         {plan.metaDetails?.coverImage && (
            <div className="hern-plan__cover-image">
               <HernLazyImage
                  dataSrc={plan.metaDetails?.coverImage}
                  className="hern-plan__plan__img"
               />
            </div>
         )}

         {/* Plan title and  icon  */}
         <div className="hern-plan__icon-title-wrapper">
            {plan.metaDetails?.icon ? (
               <div className="hern-plan__icon">
                  <img src={plan.metaDetails?.icon} />
               </div>
            ) : (
               <PlateIllustration />
            )}

            <h2 title={plan.title} className="hern-plan__title">
               <span data-translation="true">{plan.title}</span>
            </h2>
         </div>

         {plan?.metaDetails?.description && (
            <p className="hern-plan__description" data-translation="true">
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
         <div className="hern-plan__servings">
            <h4 className="hern-plan__servings__label">
               {/* <span>{t('No. of')}</span>{' '} */}
               <span data-translation="true">{yieldLabel.plural}</span>
            </h4>
            <div>
               {plansFirstIndex > 0 &&
                  plan.servings.length > numberOfItemsToShow && (
                     <button
                        className="hern-plan__servings__arrow-btn"
                        onClick={handlePlanPrevious}
                     >
                        <BiChevronLeft size={20} />
                     </button>
                  )}

               <ul className="hern-plan__servings__list">
                  {plansToShow.map(serving => {
                     return (
                        <li
                           className={classNames(
                              'hern-plan__servings__list-item',
                              {
                                 'hern-plan__servings__list-item--active':
                                    serving.id === defaultServing?.id,
                              }
                           )}
                           key={serving.id}
                           onClick={() => setDefaultServing(serving)}
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

               {plan.servings.length > servingsLastIndex && (
                  <button
                     className="hern-plan__servings__arrow-btn"
                     onClick={handlePlanNext}
                  >
                     <BiChevronRight size={20} />
                  </button>
               )}
            </div>
         </div>
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
         <div className="hern-plan__item-counts">
            <h4 className="hern-plan__item-counts__label">
               <span data-translation="true">{itemCountLabel.singular}</span>{' '}
               {t('per week')}
            </h4>
            <div className="hern-plan__item-counts__list__wrapper">
               {servingsFirstIndex > 0 &&
                  defaultServing?.itemCounts.length > numberOfItemsToShow && (
                     <button
                        className="hern-plan__item-counts__arrow-btn--left"
                        onClick={handleRecipePrevious}
                     >
                        <BiChevronLeft size={20} />
                     </button>
                  )}

               <ul className="hern-plan__item-counts__list">
                  {servingsToShow.map(item => {
                     return (
                        <li
                           className={classNames(
                              'hern-plan__item-counts__list-item',
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
                     className="hern-plan__servings__arrow-btn--right"
                     onClick={handleRecipeNext}
                  >
                     <BiChevronRight size={20} />
                  </button>
               )}
            </div>
         </div>
         {/* )}
         </section> */}
         {/* <hr /> */}
         {(priceDisplay?.pricePerServing?.isVisible.value === true ||
            priceDisplay?.totalServing?.isVisible.value === true ||
            priceDisplay?.pricePerPlan?.isVisible.value === true) && (
            <div className="hern-plan__pricing">
               <div className="hern-plan__pricing-total-price-serving-wrapper">
                  {priceDisplay?.totalServing?.isVisible.value === true && (
                     <section className="hern-plan__pricing__total-serving">
                        {priceDisplay?.totalServing?.prefix.value && (
                           <span
                              className="hern-plan__pricing__total-serving__prefix"
                              data-translation="true"
                           >
                              {priceDisplay?.totalServing?.prefix.value}{' '}
                           </span>
                        )}
                        <span
                           className="hern-plan__pricing__total-serving__price"
                           data-translation="true"
                        >
                           {Number.parseFloat(
                              (defaultItemCount?.count || 1) *
                                 (defaultServing?.size || 1)
                           ).toFixed(0)}{' '}
                        </span>
                        {priceDisplay?.totalServing?.suffix.value && (
                           <span
                              className="hern-plan__pricing__total-serving__prefix"
                              data-translation="true"
                           >
                              {priceDisplay?.totalServing?.suffix.value}
                           </span>
                        )}
                     </section>
                  )}

                  {priceDisplay?.pricePerServing?.isVisible.value === true && (
                     <section className="hern-plan__pricing__price-per-serving">
                        {priceDisplay?.pricePerServing?.prefix.value && (
                           <span
                              className="hern-plan__pricing__price-per-serving__prefix"
                              data-translation="true"
                           >
                              {priceDisplay?.pricePerServing?.prefix.value}{' '}
                           </span>
                        )}
                        <span
                           className="hern-plan__pricing__price-per-serving__price"
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
                              className="hern-plan__pricing__price-per-serving__suffix"
                              data-translation="true"
                           >
                              {priceDisplay?.pricePerServing?.suffix.value ||
                                 `per ${yieldLabel.singular}`}
                           </span>
                        </span>
                     </section>
                  )}
               </div>

               {priceDisplay?.pricePerPlan?.isVisible.value === true && (
                  <section className="hern-plan__pricing__total-price">
                     {priceDisplay?.pricePerPlan?.prefix && (
                        <span
                           className="hern-plan__pricing__total-price__prefix"
                           data-translation="true"
                        >
                           {priceDisplay?.pricePerPlan?.prefix.value}{' '}
                        </span>
                     )}

                     <span
                        style={{
                           color: `${
                              colorConfig?.accent?.value
                                 ? colorConfig?.accent?.value
                                 : 'rgba(5, 150, 105, 1)'
                           }`,
                        }}
                        className="hern-plan__pricing__total-price__price"
                        data-translation="true"
                     >
                        {formatCurrency(defaultItemCount?.price)}{' '}
                     </span>
                     <span className="hern-plan__pricing__total-price__tax">
                        {defaultItemCount?.isTaxIncluded
                           ? t('Tax Inclusive')
                           : t('Tax Exclusive')}{' '}
                     </span>
                     <span className="hern-plan__pricing__total-price__suffix">
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
         <button
            className="hern-plan__select-plan__btn"
            onClick={() => selectPlan()}
            // style={{
            //    backgroundColor: `${
            //       colorConfig?.accent?.value
            //          ? colorConfig?.accent?.value
            //          : '#6A6A6A'
            //    }`,
            // }}
         >
            {t('select plan')}
         </button>
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
// TODO
// You need to use all the config field on this plan and plans component
// The plans which doesn't have any meta details cover image we have to use the default

// You need create the list view
// You need create the aggregate view
//You have to show the view based on the config
