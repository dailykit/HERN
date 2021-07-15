import React from 'react'
import { Text } from '@dailykit/ui'
import { Container } from '../styled'
import { Nutrition } from '../../../../../../../shared/components'

const NutritionalInfo = ({ state }) => {
   const [nutrition, setNutrition] = React.useState({
      iron: 0,
      sodium: 0,
      sugars: 0,
      calcium: 0,
      protein: 0,
      calories: 0,
      totalFat: 0,
      transFat: 0,
      vitaminA: 0,
      vitaminC: 0,
      cholesterol: 0,
      dietaryFibre: 0,
      saturatedFat: 0,
      totalCarbohydrates: 0,
   })

   React.useEffect(() => {
      if (state.simpleRecipeYields.length) {
         const nutritionObj = {
            iron: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum + (sachet.ingredientSachet.nutritionalInfo?.iron || 0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
            sodium: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum +
                     (sachet.ingredientSachet.nutritionalInfo?.sodium || 0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
            sugars: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum +
                     (sachet.ingredientSachet.nutritionalInfo?.sugars || 0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
            calcium: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum +
                     (sachet.ingredientSachet.nutritionalInfo?.calcium || 0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
            protein: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum +
                     (sachet.ingredientSachet.nutritionalInfo?.protein || 0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
            calories: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum +
                     (sachet.ingredientSachet.nutritionalInfo?.calories || 0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
            totalFat: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum +
                     (sachet.ingredientSachet.nutritionalInfo?.totalFat || 0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
            transFat: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum +
                     (sachet.ingredientSachet.nutritionalInfo?.transFat || 0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
            vitaminA: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum +
                     (sachet.ingredientSachet.nutritionalInfo?.vitaminA || 0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
            vitaminC: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum +
                     (sachet.ingredientSachet.nutritionalInfo?.vitaminC || 0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
            cholesterol: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum +
                     (sachet.ingredientSachet.nutritionalInfo?.cholesterol ||
                        0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
            dietaryFibre: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum +
                     (sachet.ingredientSachet.nutritionalInfo?.dietaryFibre ||
                        0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
            saturatedFat: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum +
                     (sachet.ingredientSachet.nutritionalInfo?.saturatedFat ||
                        0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
            totalCarbohydrates: parseFloat(
               state.simpleRecipeYields[0].ingredientSachets.reduce(
                  (sum, sachet) =>
                     sum +
                     (sachet.ingredientSachet.nutritionalInfo
                        ?.totalCarbohydrates || 0),
                  0
               ) / parseInt(state.simpleRecipeYields[0].yield.serving)
            ),
         }
         console.log(nutritionObj)
         setNutrition({ ...nutritionObj })
      }
   }, [state.simpleRecipeYields])

   return (
      <Container top="32" paddingX="32">
         <Text as="subtitle">Nutrition (per serving)</Text>
         <Nutrition data={nutrition} vertical />
      </Container>
   )
}

export default NutritionalInfo
