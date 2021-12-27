import React from 'react'
import LockIcon from '../assets/icons/Lock'
import ChefIcon from '../assets/icons/Chef'
import TimeIcon from '../assets/icons/Time'
import UtensilsIcon from '../assets/icons/Utensils'
import CuisineIcon from '../assets/icons/Cuisine'
import { useConfig } from '../lib'
import classNames from 'classnames'
import { HelperBar } from './helper_bar'

export const Recipe = ({ productOption }) => {
   const { configOf } = useConfig()
   const recipe = productOption?.simpleRecipeYield?.simpleRecipe
   const theme = configOf('theme-color', 'Visual')
   const renderIngredientName = (slipName, sachet) => {
      if (recipe.showIngredientsQuantity) {
         return `${slipName} - ${sachet.quantity} ${sachet.unit}`
      }
      return slipName
   }

   if (!recipe) {
      return (
         <main className="hern-recipe">
            <HelperBar type="info">
               <HelperBar.Title> No such recipe exists!</HelperBar.Title>
            </HelperBar>
         </main>
      )
   }
   return (
      <div>
         <header
            style={{ paddingTop: '32px', borderBottom: '0.5px solid #f4f4f4' }}
         >
            <h2>Recipe</h2>
         </header>
         <main className="hern-recipe">
            <h1 className="hern-recipe__title">{recipe.name}</h1>
            <div className="hern-recipe__img__wrapper">
               {recipe?.assets?.images?.length ? (
                  <img
                     className="hern-recipe__img"
                     src={recipe?.assets?.images[0]}
                     alt={recipe.name}
                  />
               ) : (
                  'N/A'
               )}
            </div>
            {!!recipe.description && (
               <>
                  <h2>Description</h2>
                  <p className="hern-recipe__description">
                     {recipe.description}
                  </p>
               </>
            )}
            <h2 className="hern-recipe__details__heading">Details</h2>
            <div className="hern-recipe__details">
               {!!recipe.type && (
                  <div>
                     <h6 tw="text-gray-500 text-sm font-normal">Type</h6>
                     <p tw="text-teal-900">{recipe.type}</p>
                  </div>
               )}
               {!!recipe.cuisine && (
                  <div className="hern-recipe__details__cuisine">
                     <CuisineIcon size={40} color={theme?.accent} />
                     <p>{recipe.cuisine}</p>
                  </div>
               )}
               {!!recipe.author && (
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
            {!!recipe.notIncluded?.length && (
               <div className="hern-recipe__not-included">
                  <h6 className="hern-recipe__not-included__heading">
                     What you'll need
                  </h6>
                  <p className="hern-recipe__not-included__item">
                     {recipe.notIncluded.join(', ')}
                  </p>
               </div>
            )}
            {recipe.showIngredients &&
               Boolean(productOption.simpleRecipeYield.sachets.length) && (
                  <>
                     <h2 className="hern-recipe__ingradients__heading">
                        Ingredients
                     </h2>
                     <div className="hern-recipe__ingradients">
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
                                       {renderIngredientName(slipName, sachet)}
                                    </>
                                 ) : (
                                    <LockIcon />
                                 )}
                              </div>
                           )
                        )}
                     </div>
                  </>
               )}
            {recipe.showProcedures && Boolean(recipe.instructionSets.length) && (
               <>
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
                                          {step.assets.images.length > 0 && (
                                             <img
                                                src={step.assets.images[0].url}
                                                alt={
                                                   step.assets.images[0].title
                                                }
                                                title={
                                                   step.assets.images[0].title
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
               </>
            )}
         </main>
         <button
            className="hern-recipe__go-back-btn"
            onClick={() => isClient && window.history.go(-1)}
         >
            Go back to Main menu
         </button>
      </div>
   )
}
