import gql from 'graphql-tag'

export const CUISINES = gql`
   query Cuisines {
      cuisineNames {
         id
         title: name
      }
   }
`

export const INGREDIENTS = gql`
   query Ingredients($where: ingredient_ingredient_bool_exp) {
      ingredients(where: $where) {
         id
         title: name
         name
         isValid
      }
   }
`

// TODO: add isValid on processing
export const PROCESSINGS = gql`
   query Processings($where: ingredient_ingredientProcessing_bool_exp) {
      ingredientProcessings(where: $where) {
         id
         title: processingName
         processingName
      }
   }
`

export const SACHETS = gql`
   query Sachets($where: ingredient_ingredientSachet_bool_exp) {
      ingredientSachets(where: $where) {
         id
         isValid
         quantity
         unit
         ingredient {
            id
            name
         }
      }
   }
`

export const SACHET_ITEMS = gql`
   query {
      sachetItems(where: { isArchived: { _eq: false } }) {
         id
         unitSize
         unit
         bulkItem {
            id
            processingName
            supplierItem {
               id
               name
               prices
            }
         }
      }
   }
`

export const BULK_ITEMS = gql`
   query BulkItems {
      bulkItems(where: { isArchived: { _eq: false } }) {
         id
         unit
         processingName
         supplierItem {
            id
            name
            prices
         }
      }
   }
`

export const SUPPLIER_ITEMS = gql`
   query SupplierItems {
      supplierItems(where: { isArchived: { _eq: false } }) {
         id
         name
         title: name
         unitSize
         unit
         prices
      }
   }
`

export const SIMPLE_RECIPES = gql`
   query SimpleRecipes($where: simpleRecipe_simpleRecipe_bool_exp) {
      simpleRecipes(where: $where) {
         id
         name
         title: name
         isValid
         simpleRecipeYields(where: { isArchived: { _eq: false } }) {
            id
            yield
         }
      }
   }
`

export const DERIVE_SACHETS_FROM_BASE_YIELD = gql`
   query DeriveSachetsFromBaseYield(
      $args: simpleRecipe_deriveIngredientSachets_args!
   ) {
      simpleRecipe_deriveIngredientSachets(args: $args) {
         success
         message
      }
   }
`
