import React from 'react'
import LockIcon from '../assets/icons/Lock'
import ChefIcon from '../assets/icons/Chef'
import TimeIcon from '../assets/icons/Time'
import UtensilsIcon from '../assets/icons/Utensils'
import CuisineIcon from '../assets/icons/Cuisine'
import { VegNonVegType } from '../assets/icons'
import { useConfig } from '../lib'
import classNames from 'classnames'
import { HelperBar } from './helper_bar'
import { Nutritions } from './nutrition'
import { getRoute, isClient } from '../utils'
import { useRouter } from 'next/router'
import { useTranslation } from '../context'
import { HernLazyImage } from '../utils/hernImage'
import { useProductConfig } from '../utils/getProductSettings'

export const Recipe = ({ productOption, config }) => {
   const { configOf } = useConfig()
   const router = useRouter()
   const { id } = router.query
   const { value: productSetting } = useProductConfig('recipe-section', id)

   const recipe = productOption?.simpleRecipeYield?.simpleRecipe
   const theme = configOf('theme-color', 'Visual')
   const { t, dynamicTrans, locale } = useTranslation()
   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   const RenderIngredientName = (slipName, sachet) => {
      if (recipe.showIngredientsQuantity) {
         return (
            <>
               <span data-translation="true">{slipName}</span>
               <span>
                  {' '}
                  - {sachet.quantity} {sachet.unit}
               </span>
            </>
         )
      }
      return <span data-translation="true"> {slipName}</span>
   }

   const customIngredientsLabel =
      (productSetting &&
         productSetting?.['information Visibility']?.customIngredientsLabel
            ?.value) ||
      config?.['information Visibility']?.recipe?.customIngredientsLabel?.value
   const showAuthor =
      (productSetting &&
         productSetting?.['information Visibility']?.showAuthor?.value) ??
      config?.['information Visibility']?.recipe?.showAuthor?.value ??
      true
   const showCookingProcess =
      (productSetting &&
         productSetting?.['information Visibility']?.showCookingProcess
            ?.value) ??
      config?.['information Visibility']?.recipe?.showCookingProcess?.value ??
      false
   const showNavigationCategory =
      (productSetting &&
         productSetting?.['information Visibility']?.showNavigationCategory
            ?.value) ??
      config?.['information Visibility']?.recipe?.showNavigationCategory
         ?.value ??
      false

   const nutritionAndRecipeSameline =
      (productSetting &&
         productSetting?.['information Visibility']?.nutritionAndRecipeSameline
            ?.value) ??
      config?.['information Visibility']?.recipe?.nutritionAndRecipeSameline
         ?.value ??
      true

   const recipeImageSize = React.useMemo(() => {
      const innerWidth = isClient ? window.innerWidth : ''
      if (0 <= innerWidth && innerWidth <= 468) {
         return {
            width: 370,
            height: 183,
         }
      } else if (469 <= innerWidth && innerWidth <= 900) {
         return {
            width: 892,
            height: 442,
         }
      } else if (901 <= innerWidth) {
         return {
            width: 1180,
            height: 585,
         }
      }
   }, [])
   const recipeIngredientItemSize = React.useMemo(() => {
      const innerWidth = isClient ? window.innerWidth : ''
      if (0 <= innerWidth && innerWidth <= 468) {
         return {
            width: 153,
            height: 153,
         }
      } else if (469 <= innerWidth && innerWidth <= 900) {
         return {
            width: 174,
            height: 174,
         }
      } else if (901 <= innerWidth) {
         return {
            width: 184,
            height: 184,
         }
      }
   }, [])

   // if (!recipe) {
   //    return (
   //       <main className="hern-recipe__wrapper">
   //          <HelperBar type="info">
   //             <HelperBar.Title> No such recipe exists!</HelperBar.Title>
   //          </HelperBar>
   //       </main>
   //    )
   // }
   if (!recipe) {
      return null
   }
   return (
      <div className="hern-recipe__wrapper">
         <div className="hern-recipe-navigation">
            <h3>{t('Recipe')}</h3>
            {showNavigationCategory && (
               <div>
                  {recipe.showIngredients && (
                     <a href="#ingredients" className="active">
                        <span> {t('Ingredients')}</span>
                     </a>
                  )}
                  <a href="#nutrition">
                     <span>{t('Nutrition')}</span>
                     {'&'} <span>{t('Allergens')}</span>
                  </a>
                  {showCookingProcess && (
                     <a href="#cooking-process">{t('Cooking Process')}</a>
                  )}
               </div>
            )}
         </div>
         <div>
            <main className="hern-recipe">
               <h1 className="hern-recipe__title" data-translation="true">
                  {recipe.name}
               </h1>
               <div className="hern-recipe__img__wrapper">
                  {recipe?.assets?.images?.length && (
                     <HernLazyImage
                        dataSrc={recipe?.assets?.images[0]}
                        alt={recipe.name}
                        width={recipeImageSize.width}
                        height={recipeImageSize.height}
                     />
                  )}
               </div>
               {!!recipe.description && (
                  <div className="hern-recipe__description">
                     <h2>{t('Description')}</h2>
                     <p data-translation="true">{recipe.description}</p>
                  </div>
               )}
               <div className="hern-product-page-section-ending" />
               <div className="hern-recipe__details">
                  <h2>{t('Details')}</h2>
                  <div>
                     {!!recipe.type && (
                        <div>
                           <VegNonVegType
                              vegNonVegType={recipe.type}
                              size={38}
                           />
                           <p data-translation="true">{recipe.type}</p>
                        </div>
                     )}
                     {!!recipe.cuisine && (
                        <div className="hern-recipe__details__cuisine">
                           <CuisineIcon size={40} color={theme?.accent} />
                           <p data-translation="true">{recipe.cuisine}</p>
                        </div>
                     )}
                     {!!recipe.author && showAuthor && (
                        <div className="hern-recipe__details__author">
                           <ChefIcon size={40} color={theme?.accent} />
                           <p data-translation="true">{recipe.author}</p>
                        </div>
                     )}
                     {!!recipe.cookingTime && (
                        <div className="hern-recipe__details__cooking-time">
                           <TimeIcon size={40} color={theme?.accent} />
                           <p data-translation="true">
                              {recipe.cookingTime} mins.
                           </p>
                        </div>
                     )}
                     {!!recipe.utensils?.length && (
                        <div className="hern-recipe__details__utelsils">
                           <UtensilsIcon size={40} color={theme?.accent} />
                           <p data-translation="true">
                              {recipe.utensils.join(', ')}
                           </p>
                        </div>
                     )}
                  </div>
               </div>
               <div className="hern-product-page-section-ending" />
               {!!recipe.notIncluded?.length && (
                  <div className="hern-recipe__not-included">
                     <h2>{t("What you'll need")}</h2>
                     <p data-translation="true">
                        {recipe.notIncluded.join(', ')}
                     </p>
                  </div>
               )}
               <div
                  className={classNames({
                     'hern-nutrition-recipe__wrapper':
                        nutritionAndRecipeSameline,
                  })}
               >
                  {recipe.showIngredients &&
                     Boolean(
                        productOption.simpleRecipeYield.sachets.length
                     ) && (
                        <div
                           id="ingredients"
                           className="hern-recipe__ingradients"
                        >
                           <h2>
                              {customIngredientsLabel ? (
                                 customIngredientsLabel
                              ) : (
                                 <span>{t('Ingredients')}</span>
                              )}
                           </h2>
                           <div>
                              {productOption.simpleRecipeYield.sachets.map(
                                 ({ isVisible, slipName, sachet }, index) => (
                                    <div
                                       key={index}
                                       className={classNames(
                                          'hern-recipe__ingradient__item--visible',
                                          {
                                             'hern-recipe__ingradient__item':
                                                !isVisible,
                                          }
                                       )}
                                    >
                                       {isVisible ? (
                                          <>
                                             {sachet.ingredient.assets?.images
                                                ?.length && (
                                                <HernLazyImage
                                                   dataSrc={
                                                      sachet.ingredient.assets
                                                         .images[0]
                                                   }
                                                   width={
                                                      recipeIngredientItemSize.width
                                                   }
                                                   height={
                                                      recipeIngredientItemSize.height
                                                   }
                                                />
                                             )}
                                             <span>
                                                {RenderIngredientName(
                                                   slipName,
                                                   sachet
                                                )}
                                             </span>
                                          </>
                                       ) : (
                                          <LockIcon />
                                       )}
                                    </div>
                                 )
                              )}
                           </div>
                        </div>
                     )}
                  <div className="hern-recipe-nutrition">
                     <Nutritions
                        simpleRecipeYield={productOption?.simpleRecipeYield}
                     />
                  </div>
               </div>
               {showCookingProcess &&
                  recipe.showProcedures &&
                  Boolean(recipe.instructionSets.length) && (
                     <div className="hern-recipe__cooking-process">
                        <h2 className="hern-recipe__cooking-process__heading">
                           {t('Cooking Process')}
                        </h2>
                        <ul>
                           {recipe.instructionSets.map(set => (
                              <li
                                 className="hern-recipe__cooking-instructions"
                                 key={set.id}
                              >
                                 <ol className="hern-recipe__cooking-setps">
                                    <h4
                                       className="hern-recipe__cooking-setps__heading"
                                       data-translation="true"
                                    >
                                       {set.title}
                                    </h4>
                                    {set.instructionSteps.map(step =>
                                       step.isVisible ? (
                                          <li
                                             className="hern-recipe__cooking-setps__step"
                                             key={step.title}
                                          >
                                             {step.title && (
                                                <span
                                                   className="hern-recipe__cooking-setps__step__title"
                                                   data-translation="true"
                                                >
                                                   {step.title}
                                                </span>
                                             )}
                                             <div className="hern-recipe__cooking-setps__step__img">
                                                {step.assets.images.length >
                                                   0 && (
                                                   <HernLazyImage
                                                      dataSrc={
                                                         step.assets.images[0]
                                                            .url
                                                      }
                                                      alt={
                                                         step.assets.images[0]
                                                            .title
                                                      }
                                                      title={
                                                         step.assets.images[0]
                                                            .title
                                                      }
                                                   />
                                                )}
                                             </div>
                                             <p
                                                className="hern-recipe__cooking-setps__step__description"
                                                data-translation="true"
                                             >
                                                {step.description}
                                             </p>
                                          </li>
                                       ) : (
                                          <li
                                             key={step.title}
                                             className="hern-recipe__cooking-setps__step--locked"
                                          >
                                             <LockIcon />
                                          </li>
                                       )
                                    )}
                                 </ol>
                              </li>
                           ))}
                        </ul>
                     </div>
                  )}
            </main>
            <button
               className="hern-recipe__go-back-btn"
               onClick={() => router.push(getRoute('/order'))}
            >
               {t('Go back to Main menu')}
            </button>
         </div>
      </div>
   )
}
