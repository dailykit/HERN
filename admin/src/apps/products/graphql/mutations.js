import gql from 'graphql-tag'

export const CREATE_INGREDIENT = gql`
   mutation CreateIngredient($name: String) {
      createIngredient(objects: { name: $name }) {
         returning {
            id
            name
         }
      }
   }
`
export const CREATE_INGREDIENTS = gql`
   mutation CreateIngredients(
      $objects: [ingredient_ingredient_insert_input!]!
   ) {
      createIngredient(objects: $objects) {
         returning {
            id
            name
         }
      }
   }
`
export const DELETE_INGREDIENTS = gql`
   mutation DeleteIngredients($ids: [Int!]!) {
      updateIngredient(
         where: { id: { _in: $ids } }
         _set: { isArchived: true }
      ) {
         returning {
            id
         }
      }
   }
`

export const UPDATE_INGREDIENT = gql`
   mutation UpdateIngredient($id: Int!, $set: ingredient_ingredient_set_input) {
      updateIngredient(where: { id: { _eq: $id } }, _set: $set) {
         returning {
            id
         }
      }
   }
`

export const CREATE_PROCESSINGS = gql`
   mutation CreateProcessings(
      $procs: [ingredient_ingredientProcessing_insert_input!]!
   ) {
      createIngredientProcessing(objects: $procs) {
         returning {
            id
            processingName
         }
      }
   }
`

export const UPDATE_PROCESSING = gql`
   mutation UpdateIngredientProcessing(
      $id: Int!
      $set: ingredient_ingredientProcessing_set_input
   ) {
      updateIngredientProcessing(where: { id: { _eq: $id } }, _set: $set) {
         returning {
            id
         }
      }
   }
`

export const DELETE_PROCESSING = gql`
   mutation DeleteProcessing($id: Int!) {
      updateIngredientProcessing(
         where: { id: { _eq: $id } }
         _set: { isArchived: true }
      ) {
         returning {
            id
         }
      }
   }
`

export const CREATE_SACHET = gql`
   mutation CreateSachet(
      $objects: [ingredient_ingredientSachet_insert_input!]!
   ) {
      createIngredientSachet(objects: $objects) {
         returning {
            id
            ingredient {
               name
            }
         }
      }
   }
`

export const UPDATE_SACHET = gql`
   mutation UpdateSachet(
      $id: Int!
      $set: ingredient_ingredientSachet_set_input
   ) {
      updateIngredientSachet(where: { id: { _eq: $id } }, _set: $set) {
         returning {
            id
         }
      }
   }
`

export const UPDATE_MODE = gql`
   mutation UpdateMode(
      $id: Int!
      $set: ingredient_modeOfFulfillment_set_input
   ) {
      updateModeOfFulfillment(pk_columns: { id: $id }, _set: $set) {
         id
         isArchived
      }
   }
`

export const DELETE_SACHET = gql`
   mutation DeleteSachet($id: Int!) {
      updateIngredientSachet(
         where: { id: { _eq: $id } }
         _set: { isArchived: true }
      ) {
         returning {
            id
         }
      }
   }
`

export const CREATE_SIMPLE_RECIPE = gql`
   mutation CreateRecipe($objects: [simpleRecipe_simpleRecipe_insert_input!]!) {
      createSimpleRecipe(objects: $objects) {
         returning {
            id
            name
         }
      }
   }
`
export const DELETE_SIMPLE_RECIPES = gql`
   mutation DeleteRecipes($ids: [Int!]!) {
      updateSimpleRecipe(
         where: { id: { _in: $ids } }
         _set: { isArchived: true }
      ) {
         returning {
            id
         }
      }
   }
`

export const CREATE_SIMPLE_RECIPE_YIELDS = gql`
   mutation CreateSimpleRecipeYields(
      $objects: [simpleRecipe_simpleRecipeYield_insert_input!]!
   ) {
      createSimpleRecipeYield(objects: $objects) {
         returning {
            id
         }
      }
   }
`

export const UPDATE_NUTRITIONINFO = gql`
   mutation UpdateNutritionInfo($simpleRecipeYieldIds: [Int!]!) {
      calculateNutitionalInfo(simpleRecipeYieldIds: $simpleRecipeYieldIds) {
         message
         success
      }
   }
`

export const UPDATE_SIMPLE_RECIPE_YIELD_USER_DEFINED_NUTRITION_INFO = gql`
   mutation UpdateSimpleRecipeYieldUserDefinedNutritionInfo(
      $pk_columns: simpleRecipe_simpleRecipeYield_pk_columns_input!
      $_set: simpleRecipe_simpleRecipeYield_set_input!
   ) {
      updateSimpleRecipeYield_by_pk(pk_columns: $pk_columns, _set: $_set) {
         id
      }
   }
`

export const DELETE_SIMPLE_RECIPE_YIELD = gql`
   mutation DeleteSimpleRecipeYield($id: Int!) {
      updateSimpleRecipeYield(
         where: { id: { _eq: $id } }
         _set: { isArchived: true }
      ) {
         returning {
            id
         }
      }
   }
`

export const DELETE_SIMPLE_RECIPE_INGREDIENT_PROCESSINGS = gql`
   mutation DeleteSimpleRecipeIngredientProcessings($ids: [Int!]!) {
      deleteSimpleRecipeIngredientProcessings(where: { id: { _in: $ids } }) {
         returning {
            id
         }
      }
   }
`

export const UPDATE_SIMPLE_RECIPE_YIELD = gql`
   mutation UpdateSimpleRecipeYield(
      $_set: simpleRecipe_simpleRecipeYield_set_input!
      $pk_columns: simpleRecipe_simpleRecipeYield_pk_columns_input!
   ) {
      updateSimpleRecipeYield_by_pk(pk_columns: $pk_columns, _set: $_set) {
         id
      }
   }
`

export const UPSERT_SIMPLE_RECIPE_YIELD_SACHET = gql`
   mutation UpsertSimpleRecipeSachet(
      $yieldId: Int!
      $ingredientProcessingRecordId: Int!
      $ingredientSachetId: Int!
      $slipName: String!
   ) {
      createSimpleRecipeSachet(
         objects: [
            {
               recipeYieldId: $yieldId
               simpleRecipeIngredientProcessingId: $ingredientProcessingRecordId
               ingredientSachetId: $ingredientSachetId
               slipName: $slipName
            }
         ]
         on_conflict: {
            constraint: simpleRecipeYield_ingredientSachet_pkey
            update_columns: [ingredientSachetId, slipName]
            where: {
               recipeYieldId: { _eq: $yieldId }
               simpleRecipeIngredientProcessingId: {
                  _eq: $ingredientProcessingRecordId
               }
            }
         }
      ) {
         returning {
            ingredientSachetId
         }
      }
   }
`

export const CREATE_SIMPLE_RECIPE_YIELD_SACHET = gql`
   mutation CreateSimpleRecipeSachet(
      $objects: [simpleRecipe_simpleRecipeYield_ingredientSachet_insert_input!]!
   ) {
      createSimpleRecipeSachet(objects: $objects) {
         returning {
            ingredientSachetId
         }
      }
   }
`

export const UPDATE_SIMPLE_RECIPE_YIELD_SACHET = gql`
   mutation UpdateSimpleRecipeSachet(
      $ingredientProcessingRecordId: Int!
      $yieldId: Int!
      $set: simpleRecipe_simpleRecipeYield_ingredientSachet_set_input
   ) {
      updateSimpleRecipeSachet(
         where: {
            simpleRecipeIngredientProcessingId: {
               _eq: $ingredientProcessingRecordId
            }
            recipeYieldId: { _eq: $yieldId }
         }
         _set: $set
      ) {
         returning {
            ingredientSachetId
         }
      }
   }
`

export const DELETE_SIMPLE_RECIPE_YIELD_SACHETS = gql`
   mutation DeleteSimpleRecipeSachet(
      $sachetIds: [Int!]!
      $servingIds: [Int!]!
   ) {
      updateSimpleRecipeSachet(
         where: {
            ingredientSachetId: { _in: $sachetIds }
            simpleRecipeYield: { id: { _in: $servingIds } }
         }
         _set: { isArchived: true }
      ) {
         returning {
            ingredientSachetId
         }
      }
   }
`

export const UPDATE_RECIPE = gql`
   mutation UpdateSimpleRecipe(
      $id: Int!
      $set: simpleRecipe_simpleRecipe_set_input
   ) {
      updateSimpleRecipe(where: { id: { _eq: $id } }, _set: $set) {
         returning {
            id
         }
      }
   }
`

export const CREATE_CUSINE_NAME = gql`
   mutation CreateCuisineName($objects: [master_cuisineName_insert_input!]!) {
      createCuisineName(objects: $objects) {
         returning {
            id
         }
      }
   }
`

export const CREATE_MODIFIER = gql`
   mutation CreateModifier($object: onDemand_modifier_insert_input!) {
      createModifier(object: $object) {
         id
      }
   }
`

export const UPDATE_MODIFIER = gql`
   mutation UpdateModifier($id: Int!, $set: onDemand_modifier_set_input) {
      updateModifier(pk_columns: { id: $id }, _set: $set) {
         id
      }
   }
`

export const UPSERT_MASTER_PROCESSING = gql`
   mutation UpsertMasterProcessing($name: String!) {
      createMasterProcessing(
         objects: { name: $name }
         on_conflict: {
            constraint: processing_name_key
            update_columns: name
            where: { name: { _eq: $name } }
         }
      ) {
         returning {
            id
            name
         }
      }
   }
`

export const UPSERT_MASTER_UNIT = gql`
   mutation UpsertMasterUnit($name: String!) {
      createUnit(
         objects: { name: $name }
         on_conflict: {
            constraint: unit_name_key
            update_columns: name
            where: { name: { _eq: $name } }
         }
      ) {
         returning {
            id
            name
         }
      }
   }
`

export const CREATE_SIMPLE_RECIPE_INGREDIENT_PROCESSING = gql`
   mutation CreateSimpleRecipeIngredientProcessing(
      $object: simpleRecipe_simpleRecipe_ingredient_processing_insert_input!
   ) {
      createSimpleRecipeIngredientProcessing(object: $object) {
         id
      }
   }
`

export const CREATE_SIMPLE_RECIPE_INGREDIENT_PROCESSINGS = gql`
   mutation CreateSimpleRecipeIngredientProcessings(
      $objects: [simpleRecipe_simpleRecipe_ingredient_processing_insert_input!]!
   ) {
      createSimpleRecipeIngredientProcessings(objects: $objects) {
         returning {
            id
         }
      }
   }
`

export const UPDATE_SIMPLE_RECIPE_INGREDIENT_PROCESSING = gql`
   mutation UpdateSimpleRecipeIngredientProcessing(
      $id: Int!
      $_set: simpleRecipe_simpleRecipe_ingredient_processing_set_input!
   ) {
      updateSimpleRecipeIngredientProcessing(
         pk_columns: { id: $id }
         _set: $_set
      ) {
         id
      }
   }
`

export const INSTRUCTION_SET = {
   CREATE: gql`
      mutation CreateInstructionSet(
         $object: instructions_instructionSet_insert_input!
      ) {
         createInstructionSet(object: $object) {
            id
         }
      }
   `,
   UPDATE: gql`
      mutation UpdateInstructionSet(
         $id: Int!
         $set: instructions_instructionSet_set_input
      ) {
         updateInstructionSet(pk_columns: { id: $id }, _set: $set) {
            id
         }
      }
   `,
   DELETE: gql`
      mutation DeleteInstructionSet($id: Int!) {
         deleteInstructionSet(id: $id) {
            id
         }
      }
   `,
}

export const INSTRUCTION_STEP = {
   CREATE: gql`
      mutation CreateInstructionStep(
         $object: instructions_instructionStep_insert_input!
      ) {
         createInstructionStep(object: $object) {
            id
         }
      }
   `,
   UPDATE: gql`
      mutation UpdateInstructionStep(
         $id: Int!
         $set: instructions_instructionStep_set_input
      ) {
         updateInstructionStep(pk_columns: { id: $id }, _set: $set) {
            id
         }
      }
   `,
   DELETE: gql`
      mutation DeleteInstructionStep($id: Int!) {
         deleteInstructionStep(id: $id) {
            id
         }
      }
   `,
}

export const SIMPLE_RECIPE_UPDATE = gql`
   mutation UpdateSimpleRecipe(
      $ids: [Int!]
      $_set: simpleRecipe_simpleRecipe_set_input
   ) {
      updateSimpleRecipe(where: { id: { _in: $ids } }, _set: $_set) {
         affected_rows
      }
   }
`
export const CREATE_CUISINE_NAME = gql`
   mutation CreateCuisineName($name: String) {
      createCuisineName(objects: { name: $name }) {
         affected_rows
      }
   }
`
export const INGREDIENT_INGREDIENT_CATEGORY_UPDATE = gql`
   mutation updateIngredientCategory(
      $id: Int_comparison_exp!
      $category: String!
   ) {
      updateIngredient(where: { id: $id }, _set: { category: $category }) {
         affected_rows
      }
   }
`

export const INGREDIENT_CATEGORY_CREATE = gql`
   mutation insertIngredientCategory($name: String!) {
      createIngredientCategory(object: { name: $name }) {
         name
      }
   }
`

export const INCREASE_PRICE_AND_DISCOUNT = gql`
   mutation increasePriceAndDiscount(
      $price: numeric!
      $discount: numeric!
      $ids: [Int!]
   ) {
      updateProducts(
         where: { id: { _in: $ids } }
         _inc: { price: $price, discount: $discount }
      ) {
         affected_rows
      }
   }
`
export const INCREMENTS_IN_PRODUCT_OPTIONS = gql`
   mutation IncrementsInProductOptions(
      $_inc: products_productOption_inc_input!
      $_in: [Int!]
   ) {
      updateProductOptions(where: { id: { _in: $_in } }, _inc: $_inc) {
         affected_rows
      }
   }
`

export const MOF = {
   CREATE: gql`
      mutation CreateMode($object: ingredient_modeOfFulfillment_insert_input!) {
         createModeOfFulfillment(object: $object) {
            id
         }
      }
   `,
}

export const UPDATE_SIMPLE_RECIPE_INGREDIENT_PROCESSING_INCLUDED_WITH_PRODUCT = gql`
   mutation MyMutation(
      $id: Int!
      $_set: simpleRecipe_simpleRecipe_ingredient_processing_set_input!
   ) {
      updateSimpleRecipeIngredientProcessing(
         pk_columns: { id: $id }
         _set: $_set
      ) {
         includedWithProduct
      }
   }
`
