import React from 'react'
import { GoodiesWrapper, IngredientGrid } from './styles'
import { isEmpty } from '../../utils'
import { theme } from '../../theme'
import { Tag } from 'antd'

export const Ingredients = ({
   ingredients = [],
   ingredientView,
   showTag,
   textClass = ''
}) => {
   const [requiredIngredients, setRequiredIngredients] =
      React.useState(ingredients)

   React.useEffect(() => {
      let newIngredients = ingredients
      if (ingredientView === 'includedWithProduct') {
         newIngredients = ingredients.filter(
            ingredient => ingredient?.includedWithProduct
         )
      } else if (ingredientView === 'excludedWithProduct') {
         newIngredients = ingredients.filter(
            ingredient => !ingredient?.includedWithProduct
         )
      }
      setRequiredIngredients(newIngredients)
   }, [ingredients])

   if (isEmpty(ingredients) || isEmpty(requiredIngredients)) return null
   return (
      <>
         <IngredientGrid>
            {requiredIngredients?.map(item => {
               return (
                  <div className="goodiesCard" key={item.id}>
                     <img
                        className="goodiesImg"
                        src={item?.ingredient?.assets?.images[0]}
                        alt=""
                     />
                     <p className="goodieName text7">
                        {item?.ingredient?.name}
                        {showTag && (
                           <Tag color={theme.colors.lightBackground.grey}>
                              {item?.includedWithProduct
                                 ? 'Included with kit'
                                 : 'Not included with kit'}
                           </Tag>
                        )}
                     </p>
                  </div>
               )
            })}
         </IngredientGrid>
      </>
   )
}
export const Goodies = ({
   products,
   title,
   secondTitle,
   textClass = '',
   ingredientView = 'all',
   showTag = false
}) => {
   if (isEmpty(products)) return null
   return (
      <GoodiesWrapper>
         {products.map(product => {
            return (
               <div key={product?.id}>
                  <h1 className={`sub-heading text1 ${textClass}`}>{title}</h1>
                  <Ingredients
                     ingredients={
                        product?.productOptions[0]?.simpleRecipeYield
                           ?.simpleRecipe?.simpleRecipeIngredients
                     }
                     title={secondTitle}
                     textClass={textClass}
                     ingredientView={ingredientView}
                     showTag={showTag}
                  />
               </div>
            )
         })}
      </GoodiesWrapper>
   )
}
