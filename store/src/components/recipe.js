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

export const Recipe = ({ productOption, config }) => {
   const { configOf } = useConfig()
   const recipe = productOption?.simpleRecipeYield?.simpleRecipe
   const theme = configOf('theme-color', 'Visual')
   const renderIngredientName = (slipName, sachet) => {
      if (recipe.showIngredientsQuantity) {
         return `${slipName} - ${sachet.quantity} ${sachet.unit}`
      }
      return slipName
   }
   const customIngredientsLabel =
      config?.['information Visibility']?.recipe?.customIngredientsLabel
         ?.value ?? 'Ingredients'
   const showAuthor =
      config?.['information Visibility']?.recipe?.showAuthor?.value ?? true
   const showCookingProcess =
      config?.['information Visibility']?.recipe?.showCookingProcess?.value ??
      false
   const showNavigationCategory =
      config?.['information Visibility']?.recipe?.showNavigationCategory
         ?.value ?? false

   const nutritionAndRecipeSameline =
      config?.['information Visibility']?.recipe?.nutritionAndRecipeSameline
         ?.value ?? true

   if (!recipe) {
      return (
         <main className="hern-recipe__wrapper">
            <HelperBar type="info">
               <HelperBar.Title> No such recipe exists!</HelperBar.Title>
            </HelperBar>
         </main>
      )
   }
   return (
      <div className="hern-recipe__wrapper">
         <div className="hern-recipe-navigation">
            <h3>Recipe</h3>
            {showNavigationCategory && (
               <div>
                  {recipe.showIngredients && (
                     <a href="#ingredients" className="active">
                        Ingredients
                     </a>
                  )}
                  <a href="#nutrition">Nutrition &amp; Allergens</a>
                  {showCookingProcess && (
                     <a href="#cooking-process">Cooking Process</a>
                  )}
               </div>
            )}
         </div>
         <div>
            <main className="hern-recipe">
               <h1 className="hern-recipe__title">{recipe.name}</h1>
               <div className="hern-recipe__img__wrapper">
                  {recipe?.assets?.images?.length && (
                     <img src={recipe?.assets?.images[0]} alt={recipe.name} />
                  )}
               </div>
               {!!recipe.description && (
                  <div className="hern-recipe__description">
                     <h2>Description</h2>
                     <p>{recipe.description}</p>
                  </div>
               )}
               <div className="hern-product-page-section-ending" />
               <div className="hern-recipe__details">
                  <h2>Details</h2>
                  <div>
                     {!!recipe.type && (
                        <div>
                           <VegNonVegType
                              vegNonVegType={recipe.type}
                              size={38}
                           />
                           <p>{recipe.type}</p>
                        </div>
                     )}
                     {!!recipe.cuisine && (
                        <div className="hern-recipe__details__cuisine">
                           <CuisineIcon size={40} color={theme?.accent} />
                           <p>{recipe.cuisine}</p>
                        </div>
                     )}
                     {!!recipe.author && showAuthor && (
                        <div className="hern-recipe__details__author">
                           <ChefIcon size={40} color={theme?.accent} />
                           <p>{recipe.author}</p>
                        </div>
                     )}
                     {!!recipe.cookingTime && (
                        <div className="hern-recipe__details__cooking-time">
                           <TimeIcon size={40} color={theme?.accent} />
                           <p>{recipe.cookingTime} mins.</p>
                        </div>
                     )}
                     {!!recipe.utensils?.length && (
                        <div className="hern-recipe__details__utelsils">
                           <UtensilsIcon size={40} color={theme?.accent} />
                           <p>{recipe.utensils.join(', ')}</p>
                        </div>
                     )}
                  </div>
               </div>
               <div className="hern-product-page-section-ending" />
               {!!recipe.notIncluded?.length && (
                  <div className="hern-recipe__not-included">
                     <h2>What you&apos;ll need</h2>
                     <p>{recipe.notIncluded.join(', ')}</p>
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
                           <h2>{customIngredientsLabel}</h2>
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
                                                <img
                                                   src={
                                                      sachet.ingredient.assets
                                                         .images[0]
                                                   }
                                                />
                                             )}
                                             {renderIngredientName(
                                                slipName,
                                                sachet
                                             )}
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
                           Cooking Process
                        </h2>
                        <ul>
                           {recipe.instructionSets.map(set => (
                              <li
                                 className="hern-recipe__cooking-instructions"
                                 key={set.id}
                              >
                                 <ol className="hern-recipe__cooking-setps">
                                    <h4 className="hern-recipe__cooking-setps__heading">
                                       {set.title}
                                    </h4>
                                    {set.instructionSteps.map(step =>
                                       step.isVisible ? (
                                          <li
                                             className="hern-recipe__cooking-setps__step"
                                             key={step.title}
                                          >
                                             {step.title && (
                                                <span className="hern-recipe__cooking-setps__step__title">
                                                   {step.title}
                                                </span>
                                             )}
                                             <div className="hern-recipe__cooking-setps__step__img">
                                                {step.assets.images.length >
                                                   0 && (
                                                   <img
                                                      src={
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
                                             <p className="hern-recipe__cooking-setps__step__description">
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
               onClick={() => isClient && window.history.go(-1)}
            >
               Go back to Main menu
            </button>
         </div>
      </div>
   )
}
